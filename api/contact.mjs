import { z } from 'zod';
import nodemailer from 'nodemailer';

// Simple in-memory token bucket per IP
const buckets = new Map();
const RATE_LIMIT = { tokens: 5, intervalMs: 60_000 }; // 5 per minute

function rateLimit(ip) {
  const now = Date.now();
  let b = buckets.get(ip);
  if (!b) {
    b = { tokens: RATE_LIMIT.tokens, last: now };
  }
  const elapsed = now - b.last;
  const refill = Math.floor(elapsed / RATE_LIMIT.intervalMs) * RATE_LIMIT.tokens;
  b.tokens = Math.min(RATE_LIMIT.tokens, b.tokens + refill);
  b.last = now;
  if (b.tokens <= 0) {
    buckets.set(ip, b);
    return false;
  }
  b.tokens -= 1;
  buckets.set(ip, b);
  return true;
}

const ContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().max(32).optional().or(z.literal('')),
  message: z.string().min(10).max(2000),
  consent: z.literal('true'),
  // captchaToken optional unless enabled
  captchaToken: z.string().optional()
});

export default async function handler(req, res) {
  const method = req.method || req.headers.get?.('x-vercel-method') || 'GET';
  if (method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    res.end(JSON.stringify({ ok: false, error: 'Method not allowed' }));
    return;
  }

  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').toString();
  if (!rateLimit(ip)) {
    res.statusCode = 429;
    res.end(JSON.stringify({ ok: false, error: 'Too many requests' }));
    return;
  }

  let body = '';
  for await (const chunk of req) body += chunk;
  let data;
  try {
    data = JSON.parse(body);
  } catch (e) {
    // try URL-encoded
    const params = new URLSearchParams(body);
    data = Object.fromEntries(params.entries());
  }

  const parsed = ContactSchema.safeParse(data);
  if (!parsed.success) {
    res.statusCode = 400;
    res.end(JSON.stringify({ ok: false, error: 'Validation failed', details: parsed.error.flatten() }));
    return;
  }

  const { name, email, phone, message, captchaToken } = parsed.data;

  // Optional: Cloudflare Turnstile verification if configured
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    try {
      const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret: turnstileSecret, response: captchaToken || '' })
      });
      const j = await r.json();
      if (!j.success) {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, error: 'Captcha verification failed' }));
        return;
      }
    } catch (e) {
      res.statusCode = 400;
      res.end(JSON.stringify({ ok: false, error: 'Captcha verification error' }));
      return;
    }
  }

  const payload = {
    name,
    email,
    phone: phone || '',
    message,
    ip,
    userAgent: req.headers['user-agent'] || ''
  };

  // Delivery strategies: Resend -> Webhook -> SMTP -> fallback
  const resend = process.env.RESEND_API_KEY;
  const webhookUrl = process.env.WEBHOOK_URL;
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const toEmail = process.env.CONTACT_TO_EMAIL || 'jack@vitalvisibility.co.za';

  try {
    if (resend) {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resend}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Vital Visibility <no-reply@vitalvisibility.co.za>',
          to: [toEmail],
          subject: `New enquiry from ${name}`,
          text: `Name: ${name}\nEmail: ${email}\nPhone: ${payload.phone}\n\nMessage:\n${message}\n\nIP: ${ip}`
        })
      });
      if (!r.ok) throw new Error('Resend failed');
    } else if (webhookUrl) {
      const r = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ event: 'contact', payload })
      });
      if (!r.ok) throw new Error('Webhook failed');
    } else if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: { user: smtpUser, pass: smtpPass }
      });
      await transporter.sendMail({
        from: 'Vital Visibility <no-reply@vitalvisibility.co.za>',
        to: toEmail,
        subject: `New enquiry from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${payload.phone}\n\nMessage:\n${message}\n\nIP: ${ip}`
      });
    } else {
      // No delivery configured, accept but log only
      console.log('[contact] received', payload);
    }
  } catch (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, error: 'Delivery failed' }));
    return;
  }

  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify({ ok: true }));
}


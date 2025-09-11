document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const captchaInput = document.getElementById('captchaToken');
  const tsMeta = document.querySelector('meta[name="turnstile-site-key"]');
  const tsSiteKey = tsMeta && tsMeta.content ? tsMeta.content.trim() : '';
  if (!form) return;

  function show(msg, ok = true) {
    if (!status) return;
    status.textContent = msg;
    status.style.color = ok ? 'var(--color-green)' : 'var(--color-red)';
  }

  // Initialize Cloudflare Turnstile if site key provided and API available
  function initTurnstile() {
    if (!tsSiteKey) return; // not configured
    if (window.turnstile && document.getElementById('turnstile-widget')) {
      try {
        window.turnstile.render('#turnstile-widget', {
          sitekey: tsSiteKey,
          callback: (token) => { if (captchaInput) captchaInput.value = token; }
        });
      } catch (e) {
        // ignore
      }
    }
  }

  // Poll for turnstile API if loaded asynchronously
  if (tsSiteKey) {
    const iv = setInterval(() => {
      if (window.turnstile) {
        clearInterval(iv);
        initTurnstile();
      }
    }, 300);
    setTimeout(() => clearInterval(iv), 10000);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    if (!fd.get('consent')) {
      show('Please provide consent to proceed.', false);
      return;
    }
    // simple client-side checks
    const name = (fd.get('name') || '').toString().trim();
    const email = (fd.get('email') || '').toString().trim();
    const message = (fd.get('message') || '').toString().trim();
    if (name.length < 2 || !email.includes('@') || message.length < 10) {
      show('Please complete all required fields correctly.', false);
      return;
    }
    // Require captcha if enabled
    if (tsSiteKey && (!captchaInput || !captchaInput.value)) {
      show('Please complete the verification.', false);
      return;
    }

    show('Sending…', true);
    const payload = Object.fromEntries(fd.entries());
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const j = await r.json();
      if (j.ok) {
        window.location.href = '/contact-success.html';
      } else {
        show(j.error || 'Submission failed. Please try again later.', false);
      }
    } catch (err) {
      show('Network error. Please try again later.', false);
    }
  });
});

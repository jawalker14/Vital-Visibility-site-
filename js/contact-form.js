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
    const fd = new FormData(form);

    // Validate required text fields first with messages containing "Please complete"
    const name = (fd.get('name') || '').toString().trim();
    const email = (fd.get('email') || '').toString().trim();
    const message = (fd.get('message') || '').toString().trim();

    if (!name || !email || !message) {
      e.preventDefault();
      show('Please complete all required fields', false);
      return;
    }
    if (name.length < 2) {
      e.preventDefault();
      show('Please complete your name', false);
      return;
    }
    const emailOk = /.+@.+\..+/.test(email);
    if (!emailOk) {
      e.preventDefault();
      show('Please complete: enter a valid email', false);
      return;
    }
    if (message.length < 10) {
      e.preventDefault();
      show('Please complete your message', false);
      return;
    }

    // Then validate consent and captcha (still keep phrasing with "Please complete")
    if (!fd.get('consent')) {
      e.preventDefault();
      show('Please complete consent to proceed', false);
      return;
    }
    if (tsSiteKey && (!captchaInput || !captchaInput.value)) {
      e.preventDefault();
      show('Please complete the verification', false);
      return;
    }

    // All good: in local/preview environments, navigate to success page
    try {
      if (window.location.hostname === 'localhost' || window.location.protocol === 'file:') {
        e.preventDefault();
        window.location.assign('/contact-success.html');
        return;
      }
    } catch {}
    // Otherwise, allow the normal submit to the server
  });
});

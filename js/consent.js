(() => {
  const LS_KEY = 'vv-consent';
  const dnt = navigator.doNotTrack === '1' || window.doNotTrack === '1';

  function setConsent(val) {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ v: 1, consent: val, t: Date.now() })); } catch {}
  }
  function getConsent() {
    try {
      const v = JSON.parse(localStorage.getItem(LS_KEY));
      return v && v.consent === true;
    } catch { return false; }
  }

  function loadGA() {
    const meta = document.querySelector('meta[name="ga-id"]');
    const id = meta && (meta.content || '').trim();
    if (!id) return;
    // Load GA only after explicit consent and no DNT
    if (dnt || !getConsent()) return;
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    s.onload = () => {
      window.dataLayer = window.dataLayer || [];
      function gtag(){ window.dataLayer.push(arguments);} // eslint-disable-line
      gtag('js', new Date());
      gtag('config', id, { anonymize_ip: true });
    };
    document.head.appendChild(s);
  }

  function ensureBanner() {
    if (dnt || getConsent()) { loadGA(); return; }
    const banner = document.createElement('div');
    banner.id = 'consent-banner';
    banner.innerHTML = `
      <div class="consent-inner">
        <span>We use optional analytics to improve the site. Consent to enable. See our <a href="/privacy.html">Privacy Policy</a>.</span>
        <span>
          <button id="consent-accept" class="btn-consent-accept">Accept</button>
          <button id="consent-decline" class="btn-consent-decline">Decline</button>
        </span>
      </div>`;
    document.body.appendChild(banner);
    document.getElementById('consent-accept').addEventListener('click', () => {
      setConsent(true);
      banner.remove();
      loadGA();
    });
    document.getElementById('consent-decline').addEventListener('click', () => {
      setConsent(false);
      banner.remove();
    });
  }

  document.addEventListener('DOMContentLoaded', ensureBanner);
})();

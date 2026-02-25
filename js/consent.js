 (function() {
  const CONSENT_KEY = 'vv_cookie_consent'; // 'accept' | 'reject'
  const PREFS_ID = 'cookie-preferences';

  function hasConsent() {
    return localStorage.getItem(CONSENT_KEY) === 'accept';
  }

  function loadGA() {
    if (window.__gaLoaded) return;
    window.__gaLoaded = true;
    const s1 = document.createElement('script');
    s1.async = true;
    s1.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX';
    document.head.appendChild(s1);
    const s2 = document.createElement('script');
    s2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);} 
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXX', { anonymize_ip: true });
    `;
    document.head.appendChild(s2);
  }

  function disableGA() {
    // Prevent any accidental tracking
    window['ga-disable-G-XXXXXXX'] = true;
  }

  function applyConsent() {
    if (hasConsent()) loadGA(); else disableGA();
  }

  function renderBanner() {
    if (localStorage.getItem(CONSENT_KEY)) return;
    const banner = document.createElement('div');
    banner.setAttribute('role', 'dialog');
    banner.id = 'consent-banner';
    banner.className = 'vv-consent-banner';
    banner.innerHTML = `
      <div class="vv-consent-banner__inner">
        <span>We use non-essential analytics only with your consent. Manage your choices in Cookie Preferences.</span>
        <div class="vv-consent-banner__actions">
          <button id="vv-reject" class="vv-consent-btn vv-consent-btn--reject" type="button">Reject</button>
          <button id="vv-accept" class="vv-consent-btn vv-consent-btn--accept" type="button">Accept</button>
          <button id="vv-prefs" class="vv-consent-btn vv-consent-btn--prefs" type="button">Cookie Preferences</button>
        </div>
      </div>`;
    document.body.appendChild(banner);
    document.getElementById('vv-accept').onclick = () => {
      localStorage.setItem(CONSENT_KEY, 'accept'); banner.remove(); applyConsent();
    };
    document.getElementById('vv-reject').onclick = () => {
      localStorage.setItem(CONSENT_KEY, 'reject'); banner.remove(); applyConsent();
    };
    document.getElementById('vv-prefs').onclick = () => {
      document.getElementById(PREFS_ID)?.classList.toggle('open');
    };
  }

  // Add a simple preferences panel in your HTML footer with id="cookie-preferences"

  disableGA(); // Default: off
  document.addEventListener('DOMContentLoaded', () => { applyConsent(); renderBanner(); });
})();

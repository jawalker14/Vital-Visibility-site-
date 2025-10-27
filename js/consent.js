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
    banner.style.position = 'fixed';
    banner.style.bottom = '0'; banner.style.left = '0'; banner.style.right = '0';
    banner.style.padding = '12px'; banner.style.background = '#27287B'; banner.style.color = '#fff';
    banner.style.zIndex = '9999';
    banner.innerHTML = `
      <div style="max-width:960px;margin:0 auto;display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap;">
        <span>We use non-essential analytics only with your consent. Manage your choices in Cookie Preferences.</span>
        <div style="display:flex;gap:8px;">
          <button id="vv-reject" style="padding:8px 12px;">Reject</button>
          <button id="vv-accept" style="padding:8px 12px;font-weight:700;">Accept</button>
          <button id="vv-prefs" style="padding:8px 12px;">Cookie Preferences</button>
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

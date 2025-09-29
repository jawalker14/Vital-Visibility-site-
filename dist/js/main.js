// Navigation toggle for mobile menu
document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');
  if (navToggle && navList) {
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.addEventListener('click', () => {
      const open = navList.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }

  // Mark active nav link with aria-current
  const links = document.querySelectorAll('.site-nav a');
  const norm = (s) => {
    if (!s) return '';
    try {
      const u = new URL(s, window.location.origin);
      let p = u.pathname;
      if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
      return p;
    } catch { return s; }
  };
  const path = norm(window.location.pathname);
  links.forEach((a) => {
    const href = a.getAttribute('href');
    if (!href) return;
    const hp = norm(href);
    if (path === hp) a.setAttribute('aria-current', 'page');
  });
});

// Consent banner & GA opt-in logic is in js/consent.js

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
  const path = window.location.pathname.replace(/index\.html$/, '/');
  links.forEach((a) => {
    const href = a.getAttribute('href');
    if (!href) return;
    if (href === 'index.html' && (path === '/' || path.endsWith('/index.html'))) {
      a.setAttribute('aria-current', 'page');
    } else if (href && path.endsWith(href)) {
      a.setAttribute('aria-current', 'page');
    }
  });
});

// Consent banner & GA opt-in logic is in js/consent.js

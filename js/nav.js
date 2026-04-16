/**
 * nav.js — Navbar interactions
 * - Active link tracking via IntersectionObserver (index.html) or URL match (other pages)
 * - Mobile hamburger toggle
 */

// --- Active nav -----------------------------------------------------------

(function initActiveNav() {
  const navLinks = document.querySelectorAll('.nav__link');

  function setActiveLink(href) {
    navLinks.forEach((link) => {
      link.classList.remove('nav__link--active');
      if (link.getAttribute('href') === href) {
        link.classList.add('nav__link--active');
      }
    });
  }

  const path = window.location.pathname;
  const isIndexPage = path.endsWith('index.html') || path.endsWith('/') || path === '';

  if (!isIndexPage) {
    setActiveLink('index.html#works');
    return;
  }

  const sections = document.querySelectorAll('section[id]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveLink(`#${entry.target.id}`);
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach((section) => observer.observe(section));
})();

// --- Mobile nav toggle ----------------------------------------------------

(function initMobileNav() {
  const toggle = document.querySelector('.nav__toggle');
  const navLinks = document.querySelector('.nav__links');

  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    navLinks.classList.toggle('nav__links--open');
  });

  navLinks.addEventListener('click', (e) => {
    if (e.target.classList.contains('nav__link')) {
      toggle.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('nav__links--open');
    }
  });
})();

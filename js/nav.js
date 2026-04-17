/**
 * nav.js — Navbar generation and interactions
 * - Generate navbar HTML dynamically
 * - Active link tracking via IntersectionObserver (index.html) or URL match (other pages)
 * - Mobile hamburger toggle
 */

// --- Navbar generation ----------------------------------------------------

(function generateNavbar() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  // Determine if we're on the index page
  const path = window.location.pathname;
  const isIndexPage = path.endsWith('index.html') || path.endsWith('/') || path === '';
  
  // Determine base path for links (for case study pages in /works/ folder)
  const isInWorksFolder = path.includes('/works/');
  const basePath = isInWorksFolder ? '../' : '';

  // Build navbar HTML
  const navHTML = `
    <nav class="nav" aria-label="Primary navigation">
      <a class="nav__logo" href="${basePath}index.html">Felix Fong</a>

      <button class="nav__toggle" aria-expanded="false" aria-controls="nav-links">
        <span class="sr-only">Menu</span>
        <span class="nav__hamburger" aria-hidden="true"></span>
      </button>

      <ul class="nav__links" id="nav-links" role="list">
        <li><a class="nav__link" href="${basePath}index.html#home">Home</a></li>
        <li><a class="nav__link" href="${basePath}index.html#about">About</a></li>
        <li><a class="nav__link" href="${basePath}works.html">Works</a></li>
        <li><a class="nav__link" href="${basePath}index.html#contact">Contact</a></li>
      </ul>
    </nav>
  `;

  header.innerHTML = navHTML;
})();

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
  const isWorksPage = path.endsWith('works.html');
  const isInWorksFolder = path.includes('/works/');

  // Set active link based on current page
  if (isWorksPage) {
    setActiveLink('works.html');
    return;
  }

  if (isInWorksFolder) {
    setActiveLink('../works.html');
    return;
  }

  if (!isIndexPage) {
    return;
  }

  // For index page, use IntersectionObserver
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

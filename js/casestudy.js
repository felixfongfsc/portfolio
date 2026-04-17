/**
 * casestudy.js — Slideshow builder + tab switcher for case study pages
 */

/* ── Configuration ──────────────────────────────────────────────────────── */

const SLIDESHOW_AUTO_INTERVAL = 5000; // Auto-advance interval in milliseconds (5000 = 5 seconds)

/* ── Slideshow builder ─────────────────────────────────────────────────── */

/**
 * Builds and inits a slideshow inside `container`.
 * @param {HTMLElement} container  - .cs-slideshow element
 * @param {Array}       slides     - [{ src, alt, caption? }, ...] from projects.js
 */
function buildSlideshow(container, slides) {
  // ── Build track ──────────────────────────────────────────────────────
  const track = document.createElement('div');
  track.className = 'cs-slideshow__track';

  if (slides.length === 0) {
    const ph = document.createElement('div');
    ph.className = 'cs-slide cs-slide--placeholder';
    ph.setAttribute('aria-hidden', 'true');
    ph.innerHTML = '<span>Images coming soon</span>';
    track.appendChild(ph);
  } else {
    slides.forEach(({ src, alt }) => {
      const slide = document.createElement('div');
      slide.className = 'cs-slide';
      
      // Background image (blurred)
      const bgImg = document.createElement('img');
      bgImg.className = 'cs-slide__bg';
      bgImg.src = src;
      bgImg.alt = '';
      bgImg.setAttribute('aria-hidden', 'true');
      bgImg.loading = 'lazy';
      
      // Foreground image (sharp)
      const fgImg = document.createElement('img');
      fgImg.className = 'cs-slide__img';
      fgImg.src = src;
      fgImg.alt = alt;
      fgImg.loading = 'lazy';
      
      slide.appendChild(bgImg);
      slide.appendChild(fgImg);
      track.appendChild(slide);
    });
  }

  container.appendChild(track);

  // ── Dots — always rendered (1 dot minimum for placeholder) ──────────
  const dotsWrap = document.createElement('div');
  dotsWrap.className = 'cs-slideshow__dots';
  dotsWrap.setAttribute('aria-hidden', 'true');
  const dotCount = Math.max(slides.length, 1);
  for (let i = 0; i < dotCount; i++) {
    const dot = document.createElement('span');
    dot.className = 'cs-slideshow__dot' + (i === 0 ? ' cs-slideshow__dot--active' : '');
    dotsWrap.appendChild(dot);
  }
  container.appendChild(dotsWrap);

  // ── Prev / next — only when more than one real slide ────────────────
  if (slides.length > 1) {
    const prev = document.createElement('button');
    prev.className = 'cs-slideshow__btn cs-slideshow__btn--prev';
    prev.setAttribute('aria-label', 'Previous image');
    prev.innerHTML = '&#8592;';

    const next = document.createElement('button');
    next.className = 'cs-slideshow__btn cs-slideshow__btn--next';
    next.setAttribute('aria-label', 'Next image');
    next.innerHTML = '&#8594;';

    container.appendChild(prev);
    container.appendChild(next);
  }

  // ── Caption overlay — shown on hover if slide has a caption ─────────
  const captionEl = document.createElement('div');
  captionEl.className = 'cs-slideshow__caption';
  captionEl.setAttribute('aria-live', 'polite');
  container.appendChild(captionEl);

  // ── Init interaction ─────────────────────────────────────────────────
  initSlideshow(container, slides);
}

function initSlideshow(container, slidesData) {
  const track      = container.querySelector('.cs-slideshow__track');
  const slideEls   = Array.from(track.children);
  const dots       = Array.from(container.querySelectorAll('.cs-slideshow__dot'));
  const prev       = container.querySelector('.cs-slideshow__btn--prev');
  const next       = container.querySelector('.cs-slideshow__btn--next');
  const captionEl  = container.querySelector('.cs-slideshow__caption');

  if (!slideEls.length) return;

  let current = 0;
  let autoPlayTimer = null;
  slideEls[0].setAttribute('data-active', '');

  function updateCaption(index) {
    if (!captionEl) return;
    const text = slidesData[index]?.caption ?? '';
    captionEl.textContent = text;
    captionEl.classList.toggle('cs-slideshow__caption--has-text', text.length > 0);
  }

  function goTo(index) {
    slideEls[current].removeAttribute('data-active');
    dots[current]?.classList.remove('cs-slideshow__dot--active');

    current = (index + slideEls.length) % slideEls.length;

    slideEls[current].setAttribute('data-active', '');
    dots[current]?.classList.add('cs-slideshow__dot--active');
    track.style.transform = `translateX(-${current * 100}%)`;
    updateCaption(current);
  }

  function goToWithReset(index) {
    goTo(index);
    // Reset auto-play timer when manually navigating
    resetAutoPlay();
  }

  // Auto-play functionality
  function startAutoPlay() {
    // Only auto-play if there are multiple slides
    if (slideEls.length > 1 && !autoPlayTimer) {
      autoPlayTimer = setInterval(() => {
        goTo(current + 1);
      }, SLIDESHOW_AUTO_INTERVAL);
    }
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  // Start auto-play on load
  startAutoPlay();

  // Pause auto-play on hover and show caption
  container.addEventListener('mouseenter', () => {
    stopAutoPlay();
    updateCaption(current);
    if (captionEl) captionEl.classList.add('cs-slideshow__caption--visible');
  });
  
  // Resume auto-play on mouse leave and hide caption
  container.addEventListener('mouseleave', () => {
    if (captionEl) captionEl.classList.remove('cs-slideshow__caption--visible');
    startAutoPlay();
  });

  prev?.addEventListener('click', () => goToWithReset(current - 1));
  next?.addEventListener('click', () => goToWithReset(current + 1));

  container.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  goToWithReset(current - 1);
    if (e.key === 'ArrowRight') goToWithReset(current + 1);
  });

  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   (e) => {
    const delta = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) goToWithReset(delta > 0 ? current + 1 : current - 1);
  });
}

/* ── Gallery builder ───────────────────────────────────────────────────── */

/**
 * Populates the gallery tab from project data.
 * @param {HTMLElement} container  - .cs-gallery element
 * @param {Array}       images     - [{ src, alt, caption?, description? }, ...] from projects.js
 */
function buildGallery(container, images) {
  container.innerHTML = '';

  if (images.length === 0) {
    const ph = document.createElement('div');
    ph.className = 'cs-gallery__placeholder';
    ph.innerHTML = '<p>Gallery images coming soon.</p>';
    container.appendChild(ph);
    return;
  }

  images.forEach(({ src, alt, caption, description }) => {
    // Create wrapper for image + caption
    const itemWrapper = document.createElement('div');
    itemWrapper.className = 'cs-gallery__item';
    
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.loading = 'lazy';
    img.className = 'lightbox-trigger';
    img.setAttribute('data-full', src);
    
    // Add caption and description as data attributes for lightbox
    if (caption) img.setAttribute('data-caption', caption);
    if (description) img.setAttribute('data-description', description);
    
    // Check if image is landscape when it loads
    img.onload = function() {
      if (this.naturalWidth > this.naturalHeight) {
        this.classList.add('landscape');
        itemWrapper.classList.add('landscape');
      }
    };
    
    itemWrapper.appendChild(img);
    
    // Add caption if provided
    if (caption) {
      const captionEl = document.createElement('p');
      captionEl.className = 'cs-gallery__caption';
      captionEl.textContent = caption;
      itemWrapper.appendChild(captionEl);
    }
    
    container.appendChild(itemWrapper);
  });
}

// ── Boot ─────────────────────────────────────────────────────────────────

(function () {
  const container = document.querySelector('.cs-slideshow');
  if (!container) return;

  const pageId  = location.pathname.split('/').pop().replace('.html', '');
  const project = (typeof projects !== 'undefined')
    ? projects.find((p) => p.id === pageId)
    : null;

  if (!project) return;

  // ── Apply custom accent color if defined ───────────────────────────
  if (project.accentColor) {
    document.documentElement.style.setProperty('--color-accent', project.accentColor);
  }

  // ── Populate page <title> ──────────────────────────────────────────
  document.title = project.title + ' — Felix Fong';

  // ── Populate cs-header ─────────────────────────────────────────────
  const discipline = document.querySelector('.cs-header__discipline');
  const title      = document.querySelector('.cs-title');
  const caption    = document.querySelector('.cs-header__caption');
  if (discipline) discipline.textContent = project.discipline ?? '';
  if (title)      title.textContent      = project.title      ?? '';
  if (caption)    caption.textContent    = project.caption    ?? '';

  // ── Populate overview meta-grid (omit null fields) ─────────────────
  const dl = document.querySelector('.cs-overview .meta-grid');
  if (dl && project.overview) {
    const labels = {
      role:     'Role',
      timeline: 'Timeline',
      teamSize: 'Team Size',
      platform: 'Platform',
    };
    dl.innerHTML = '';
    Object.entries(labels).forEach(([key, label]) => {
      const value = project.overview[key];
      if (value == null || value === '') return;
      const dt = document.createElement('dt');
      dt.textContent = label;
      const dd = document.createElement('dd');
      dd.textContent = value;
      dl.appendChild(dt);
      dl.appendChild(dd);
    });
  }

  // ── Build slideshow ────────────────────────────────────────────────
  const slides = project.slides ?? [];
  buildSlideshow(container, slides);

  // ── Build gallery tab ──────────────────────────────────────────────
  const galleryEl = document.querySelector('.cs-gallery');
  if (galleryEl) buildGallery(galleryEl, project.gallery ?? []);
})();


/* ── Tab switcher ──────────────────────────────────────────────────────── */

function initTabs(tabsContainer) {
  const bar    = tabsContainer.querySelector('.cs-tabs__bar');
  const tabs   = Array.from(tabsContainer.querySelectorAll('.cs-tabs__tab'));
  const panels = Array.from(tabsContainer.querySelectorAll('.cs-tabs__panel'));

  if (!tabs.length || !panels.length) return;

  // ── Build sliding indicator ──────────────────────────────────────────
  const indicator = document.createElement('div');
  indicator.className = 'cs-tabs__indicator';
  bar.appendChild(indicator);

  // ── Wrap panels in a viewport + track for sliding ────────────────────
  const viewport = document.createElement('div');
  viewport.className = 'cs-tabs__viewport';
  const track = document.createElement('div');
  track.className = 'cs-tabs__track';

  // Move panels into the track
  panels.forEach((panel) => {
    panel.classList.remove('cs-tabs__panel--hidden');
    track.appendChild(panel);
  });
  viewport.appendChild(track);
  tabsContainer.appendChild(viewport);

  // ── Restore tab state from sessionStorage ────────────────────────────
  const pageId = location.pathname.split('/').pop().replace('.html', '');
  const storageKey = `cs-tab-${pageId}`;
  const savedTabIndex = sessionStorage.getItem(storageKey);
  let currentIndex = savedTabIndex !== null ? parseInt(savedTabIndex, 10) : 0;

  function moveIndicator(tab) {
    indicator.style.left  = tab.offsetLeft + 'px';
    indicator.style.width = tab.offsetWidth + 'px';
  }

  function switchTo(index) {
    // Update tab states
    tabs.forEach((t, i) => {
      const active = i === index;
      t.classList.toggle('cs-tabs__tab--active', active);
      t.setAttribute('aria-selected', String(active));
    });

    // Slide the track
    track.style.transform = `translateX(-${index * 100}%)`;

    // Move indicator
    moveIndicator(tabs[index]);

    // Accessibility: hide off-screen panels from pointer/screen-reader
    panels.forEach((panel, i) => {
      panel.classList.toggle('cs-tabs__panel--hidden', i !== index);
    });

    currentIndex = index;
    
    // Save current tab to sessionStorage
    sessionStorage.setItem(storageKey, String(index));
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => switchTo(i));
  });

  // Init — position indicator on the active tab without animation
  indicator.style.transition = 'none';
  switchTo(currentIndex); // Use switchTo to properly initialize the saved tab
  // Re-enable transition after first paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      indicator.style.transition = '';
    });
  });
}

document.querySelectorAll('.cs-tabs').forEach(initTabs);

/* ── Clear tab state when navigating away ──────────────────────────────── */

(function initTabStateClear() {
  // Clear tab state when clicking navigation links (going to other pages)
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.href && !link.href.includes(location.pathname)) {
      // User is navigating away from current page
      const pageId = location.pathname.split('/').pop().replace('.html', '');
      const storageKey = `cs-tab-${pageId}`;
      sessionStorage.removeItem(storageKey);
    }
  });
})();

/* ── Back to Top Button ────────────────────────────────────────────────── */

(function initBackToTop() {
  // Only initialize on case study pages
  if (!document.querySelector('.case-study-page')) return;

  // Create the button
  const backToTopBtn = document.createElement('button');
  backToTopBtn.className = 'back-to-top';
  backToTopBtn.setAttribute('aria-label', 'Back to top');
  backToTopBtn.innerHTML = '&#8593;'; // Up arrow
  document.body.appendChild(backToTopBtn);

  // Show/hide button based on scroll position
  const SCROLL_THRESHOLD = 400; // Show button after scrolling 400px

  function toggleButtonVisibility() {
    const scrolled = window.scrollY || document.documentElement.scrollTop;
    if (scrolled > SCROLL_THRESHOLD) {
      backToTopBtn.classList.add('back-to-top--visible');
    } else {
      backToTopBtn.classList.remove('back-to-top--visible');
    }
  }

  // Scroll to top smoothly when clicked
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Listen to scroll events with throttling for performance
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) {
      window.cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = window.requestAnimationFrame(() => {
      toggleButtonVisibility();
    });
  }, { passive: true });

  // Initial check
  toggleButtonVisibility();
})();

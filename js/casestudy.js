/**
 * casestudy.js — Slideshow builder + tab switcher for case study pages
 */

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
      const img = document.createElement('img');
      img.src = src;
      img.alt = alt;
      img.loading = 'lazy';
      slide.appendChild(img);
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

  // Show caption on hover
  container.addEventListener('mouseenter', () => updateCaption(current));
  container.addEventListener('mouseleave', () => {
    if (captionEl) captionEl.classList.remove('cs-slideshow__caption--visible');
  });

  // Make caption visible while hovering
  container.addEventListener('mouseenter', () => {
    if (captionEl) captionEl.classList.add('cs-slideshow__caption--visible');
  });

  prev?.addEventListener('click', () => goTo(current - 1));
  next?.addEventListener('click', () => goTo(current + 1));

  container.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   (e) => {
    const delta = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) goTo(delta > 0 ? current + 1 : current - 1);
  });
}

/* ── Gallery builder ───────────────────────────────────────────────────── */

/**
 * Populates the gallery tab from project data.
 * @param {HTMLElement} container  - .cs-gallery element
 * @param {Array}       images     - [{ src, alt }, ...] from projects.js
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

  images.forEach(({ src, alt }) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.loading = 'lazy';
    img.className = 'lightbox-trigger';
    img.setAttribute('data-full', src);
    
    // Check if image is landscape when it loads
    img.onload = function() {
      if (this.naturalWidth > this.naturalHeight) {
        this.classList.add('landscape');
      }
    };
    
    container.appendChild(img);
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

  let currentIndex = 0;

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
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => switchTo(i));
  });

  // Init — position indicator on the active tab without animation
  indicator.style.transition = 'none';
  moveIndicator(tabs[currentIndex]);
  // Re-enable transition after first paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      indicator.style.transition = '';
    });
  });
}

document.querySelectorAll('.cs-tabs').forEach(initTabs);

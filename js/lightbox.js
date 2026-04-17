/**
 * lightbox.js — Image lightbox with gallery navigation
 * Triggered by clicking any .lightbox-trigger image.
 * Supports navigation via arrows, keyboard, thumbnails, and touch/swipe.
 */

(function () {
  let lightbox = null;
  let currentIndex = 0;
  let galleryImages = [];
  let focusableElements = [];
  let touchStartX = 0;

  /**
   * Build the lightbox DOM structure once and append to <body>
   * @returns {HTMLElement} The lightbox container element
   */
  function buildLightbox() {
    const lb = document.createElement('div');
    lb.id = 'lightbox';
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Image viewer');
    lb.hidden = true;

    lb.innerHTML = `
      <button class="lightbox__close" aria-label="Close image viewer">
        <span aria-hidden="true">&times;</span>
      </button>
      
      <div class="lightbox__content">
        <div class="lightbox__header">
          <div class="lightbox__caption"></div>
          <div class="lightbox__counter" aria-live="polite"></div>
        </div>
        
        <div class="lightbox__main">
          <button class="lightbox__arrow lightbox__arrow--prev" aria-label="Previous image">
            <span aria-hidden="true">&#8592;</span>
          </button>
          
          <figure class="lightbox__figure">
            <img class="lightbox__img" src="" alt="">
          </figure>
          
          <button class="lightbox__arrow lightbox__arrow--next" aria-label="Next image">
            <span aria-hidden="true">&#8594;</span>
          </button>
        </div>
        
        <div class="lightbox__description"></div>
        
        <div class="lightbox__thumbnails">
          <div class="lightbox__thumbnails-track"></div>
        </div>
      </div>
    `;

    document.body.appendChild(lb);
    return lb;
  }

  /**
   * Open the lightbox with a gallery of images
   * @param {Array} images - Array of image objects with { src, alt, description? }
   * @param {number} startIndex - Index of the image to display first
   */
  function openLightbox(images, startIndex) {
    if (!lightbox) {
      lightbox = buildLightbox();
      attachEventListeners();
    }

    galleryImages = images;
    currentIndex = startIndex;

    // Build thumbnail strip
    buildThumbnails();

    // Show the starting image
    showImage(currentIndex);

    // Show lightbox
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden'; // Prevent background scrolling

    // Update focusable elements list
    updateFocusableElements();

    // Focus close button
    const closeBtn = lightbox.querySelector('.lightbox__close');
    if (closeBtn) closeBtn.focus();
  }

  /**
   * Display the image at the given index
   * @param {number} index - Index of the image to display
   */
  function showImage(index) {
    if (!lightbox || galleryImages.length === 0) return;

    // Wrap around if needed
    if (index < 0) index = galleryImages.length - 1;
    if (index >= galleryImages.length) index = 0;

    currentIndex = index;
    const image = galleryImages[index];

    // Update main image
    const img = lightbox.querySelector('.lightbox__img');
    img.src = image.src;
    img.alt = image.alt;

    // Update counter
    const counter = lightbox.querySelector('.lightbox__counter');
    counter.textContent = `${index + 1} / ${galleryImages.length}`;

    // Update caption (show at top, always visible if exists)
    const caption = lightbox.querySelector('.lightbox__caption');
    if (image.caption) {
      caption.textContent = image.caption;
      caption.style.display = 'block';
    } else {
      caption.textContent = '';
      caption.style.display = 'none';
    }

    // Update description (show at bottom, only if exists)
    const description = lightbox.querySelector('.lightbox__description');
    if (image.description) {
      description.textContent = image.description;
      description.style.display = 'block';
    } else {
      description.textContent = '';
      description.style.display = 'none';
    }

    // Update thumbnail highlights
    updateThumbnailHighlight(index);

    // Scroll current thumbnail into view
    scrollThumbnailIntoView(index);

    // Handle arrow button states (disable at boundaries or wrap around)
    // For this implementation, we'll wrap around, so arrows are always enabled
    const prevBtn = lightbox.querySelector('.lightbox__arrow--prev');
    const nextBtn = lightbox.querySelector('.lightbox__arrow--next');
    if (prevBtn) prevBtn.disabled = false;
    if (nextBtn) nextBtn.disabled = false;
  }

  /**
   * Navigate to the next image
   */
  function nextImage() {
    showImage(currentIndex + 1);
  }

  /**
   * Navigate to the previous image
   */
  function prevImage() {
    showImage(currentIndex - 1);
  }

  /**
   * Build the thumbnail strip
   */
  function buildThumbnails() {
    const track = lightbox.querySelector('.lightbox__thumbnails-track');
    track.innerHTML = '';

    galleryImages.forEach((image, index) => {
      const thumb = document.createElement('button');
      thumb.className = 'lightbox__thumbnail';
      thumb.setAttribute('aria-label', `View image ${index + 1}`);
      thumb.dataset.index = index;

      const img = document.createElement('img');
      img.src = image.src;
      img.alt = '';
      img.setAttribute('aria-hidden', 'true');

      thumb.appendChild(img);
      track.appendChild(thumb);

      // Click handler
      thumb.addEventListener('click', () => {
        showImage(index);
      });
    });
  }

  /**
   * Update thumbnail highlight
   * @param {number} index - Index of the current image
   */
  function updateThumbnailHighlight(index) {
    const thumbnails = lightbox.querySelectorAll('.lightbox__thumbnail');
    thumbnails.forEach((thumb, i) => {
      thumb.classList.toggle('lightbox__thumbnail--active', i === index);
    });
  }

  /**
   * Scroll the current thumbnail into view
   * @param {number} index - Index of the current image
   */
  function scrollThumbnailIntoView(index) {
    const thumbnails = lightbox.querySelectorAll('.lightbox__thumbnail');
    const thumb = thumbnails[index];
    if (thumb) {
      thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  /**
   * Close the lightbox
   */
  function closeLightbox() {
    if (!lightbox) return;

    lightbox.hidden = true;
    document.body.style.overflow = ''; // Restore scrolling

    // Clear state
    const img = lightbox.querySelector('.lightbox__img');
    img.src = '';
    img.alt = '';

    galleryImages = [];
    currentIndex = 0;
    focusableElements = [];
  }

  /**
   * Attach event listeners to lightbox controls
   */
  function attachEventListeners() {
    if (!lightbox) return;

    // Close button
    const closeBtn = lightbox.querySelector('.lightbox__close');
    closeBtn.addEventListener('click', closeLightbox);

    // Arrow buttons
    const prevBtn = lightbox.querySelector('.lightbox__arrow--prev');
    const nextBtn = lightbox.querySelector('.lightbox__arrow--next');
    prevBtn.addEventListener('click', prevImage);
    nextBtn.addEventListener('click', nextImage);

    // Backdrop click (click on lightbox or content wrapper, not on interactive elements)
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox__content')) {
        closeLightbox();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', handleKeydown);

    // Touch/swipe navigation
    const figure = lightbox.querySelector('.lightbox__figure');
    figure.addEventListener('touchstart', handleTouchStart, { passive: true });
    figure.addEventListener('touchend', handleTouchEnd);
  }

  /**
   * Handle keyboard events
   * @param {KeyboardEvent} e
   */
  function handleKeydown(e) {
    if (!lightbox || lightbox.hidden) return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        closeLightbox();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        prevImage();
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextImage();
        break;
      case 'Tab':
        e.preventDefault();
        handleTabKey(e.shiftKey);
        break;
    }
  }

  /**
   * Handle touch start event
   * @param {TouchEvent} e
   */
  function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
  }

  /**
   * Handle touch end event (detect swipe)
   * @param {TouchEvent} e
   */
  function handleTouchEnd(e) {
    const touchEndX = e.changedTouches[0].clientX;
    const delta = touchStartX - touchEndX;

    // Swipe threshold: 50px
    if (Math.abs(delta) > 50) {
      if (delta > 0) {
        // Swipe left → next image
        nextImage();
      } else {
        // Swipe right → previous image
        prevImage();
      }
    }
  }

  /**
   * Update the list of focusable elements within the lightbox
   */
  function updateFocusableElements() {
    if (!lightbox) return;

    const selectors = [
      '.lightbox__close',
      '.lightbox__arrow--prev',
      '.lightbox__arrow--next',
      '.lightbox__thumbnail'
    ];

    focusableElements = Array.from(
      lightbox.querySelectorAll(selectors.join(','))
    ).filter(el => !el.disabled && el.offsetParent !== null);
  }

  /**
   * Handle Tab key for focus trap
   * @param {boolean} shiftKey - Whether Shift key is pressed
   */
  function handleTabKey(shiftKey) {
    if (focusableElements.length === 0) return;

    const currentFocus = document.activeElement;
    const currentIndex = focusableElements.indexOf(currentFocus);

    let nextIndex;
    if (shiftKey) {
      // Shift+Tab: move backwards
      nextIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
    } else {
      // Tab: move forwards
      nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1;
    }

    focusableElements[nextIndex].focus();
  }

  /**
   * Delegated click listener for .lightbox-trigger images
   */
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.lightbox-trigger');
    if (!trigger) return;

    e.preventDefault();

    // Collect all gallery images in the same container
    const container = trigger.closest('.cs-gallery, .image-grid, .cs-ideation');
    if (!container) return;

    const triggers = Array.from(container.querySelectorAll('.lightbox-trigger'));
    
    // Build gallery images array
    const images = triggers.map(img => ({
      src: img.getAttribute('data-full') || img.src,
      alt: img.alt,
      caption: img.getAttribute('data-caption') || null,
      description: img.getAttribute('data-description') || null
    }));

    // Find the index of the clicked image
    const clickedIndex = triggers.indexOf(trigger);

    // Open lightbox
    openLightbox(images, clickedIndex);
  });

})();

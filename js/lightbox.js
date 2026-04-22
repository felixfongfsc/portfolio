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
  let keydownListenerAttached = false; // Track keydown listener to prevent duplicates
  let clickListenerAttached = false; // Track click listener for lazy attachment

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
    // Graceful fallback: Validate input parameters
    if (!Array.isArray(images) || images.length === 0) {
      console.warn('Lightbox: Cannot open lightbox with empty or invalid images array.');
      return;
    }
    
    if (startIndex < 0 || startIndex >= images.length) {
      console.warn(`Lightbox: Invalid start index ${startIndex} for images array of length ${images.length}. Using index 0.`);
      startIndex = 0;
    }

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
    if (!lightbox || galleryImages.length === 0) {
      console.warn('Lightbox: Cannot show image - lightbox not initialized or no images available.');
      return;
    }

    // Wrap around if needed
    if (index < 0) index = galleryImages.length - 1;
    if (index >= galleryImages.length) index = 0;

    currentIndex = index;
    const image = galleryImages[index];
    
    // Graceful fallback: Validate image object
    if (!image || !image.src) {
      console.warn(`Lightbox: Invalid image data at index ${index}:`, image);
      return;
    }

    // Update main image
    const img = lightbox.querySelector('.lightbox__img');
    img.src = image.src;
    img.alt = image.alt || ''; // Ensure alt is never null for accessibility

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

    // Handle arrow button states and visibility for single-image containers
    const prevBtn = lightbox.querySelector('.lightbox__arrow--prev');
    const nextBtn = lightbox.querySelector('.lightbox__arrow--next');
    
    if (galleryImages.length === 1) {
      // Single image: hide navigation arrows
      if (prevBtn) {
        prevBtn.style.display = 'none';
        prevBtn.disabled = true;
      }
      if (nextBtn) {
        nextBtn.style.display = 'none';
        nextBtn.disabled = true;
      }
    } else {
      // Multiple images: show navigation arrows and enable them (wrap around behavior)
      if (prevBtn) {
        prevBtn.style.display = 'block';
        prevBtn.disabled = false;
      }
      if (nextBtn) {
        nextBtn.style.display = 'block';
        nextBtn.disabled = false;
      }
    }

    // Update focusable elements after changing arrow visibility
    updateFocusableElements();
  }

  /**
   * Navigate to the next image
   */
  function nextImage() {
    // Don't navigate if there's only one image
    if (galleryImages.length <= 1) return;
    showImage(currentIndex + 1);
  }

  /**
   * Navigate to the previous image
   */
  function prevImage() {
    // Don't navigate if there's only one image
    if (galleryImages.length <= 1) return;
    showImage(currentIndex - 1);
  }

  /**
   * Build the thumbnail strip with optimized event delegation
   * Task 7.3 optimization: Use event delegation instead of individual listeners
   */
  function buildThumbnails() {
    const track = lightbox.querySelector('.lightbox__thumbnails-track');
    if (!track) {
      console.warn('Lightbox: Cannot build thumbnails - thumbnails track element not found.');
      return;
    }
    
    track.innerHTML = '';

    galleryImages.forEach((image, index) => {
      // Graceful fallback: Skip invalid images
      if (!image || !image.src) {
        console.warn(`Lightbox: Skipping invalid image at index ${index}:`, image);
        return;
      }
      
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
    });

    // Use event delegation for thumbnail clicks (optimization)
    if (!track.hasAttribute('data-listener-attached')) {
      track.addEventListener('click', (e) => {
        const thumb = e.target.closest('.lightbox__thumbnail');
        if (thumb && thumb.dataset.index) {
          showImage(parseInt(thumb.dataset.index, 10));
        }
      });
      track.setAttribute('data-listener-attached', 'true');
    }
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
   * Close the lightbox with optimized cleanup
   * Task 7.3 optimization: Enhanced cleanup for better performance
   */
  function closeLightbox() {
    if (!lightbox) return;

    lightbox.hidden = true;
    document.body.style.overflow = ''; // Restore scrolling

    // Clear state with performance optimization
    const img = lightbox.querySelector('.lightbox__img');
    if (img) {
      img.src = '';
      img.alt = '';
    }

    // Clear thumbnail event delegation marker for next use
    const track = lightbox.querySelector('.lightbox__thumbnails-track');
    if (track) {
      track.removeAttribute('data-listener-attached');
    }

    // Clear arrays efficiently
    galleryImages.length = 0; // More efficient than galleryImages = []
    focusableElements.length = 0;
    currentIndex = 0;
  }

  /**
   * Attach event listeners to lightbox controls
   * Optimized for Task 7.3: Efficient event listener management
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

    // Keyboard navigation - only attach when lightbox is first created
    if (!keydownListenerAttached) {
      document.addEventListener('keydown', handleKeydown);
      keydownListenerAttached = true;
    }

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
    ).filter(el => !el.disabled && el.offsetParent !== null && el.style.display !== 'none');
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
   * Detect the appropriate container for an image trigger
   * @param {HTMLElement} trigger - The clicked image element
   * @returns {Object|null} Container detection result with { container, type } or null
   */
  function detectImageContainer(trigger) {
    // Priority 1: Workflow step container (progress tab)
    const workflowContainer = trigger.closest('.workflow-step__photo');
    if (workflowContainer) {
      return {
        container: workflowContainer,
        type: 'workflow-step'
      };
    }
    
    // Priority 2: Existing gallery containers
    const galleryContainer = trigger.closest('.cs-gallery, .image-grid, .cs-ideation');
    if (galleryContainer) {
      return {
        container: galleryContainer,
        type: 'gallery'
      };
    }
    
    return null;
  }

  /**
   * Collect images from a container based on its type
   * @param {HTMLElement} container - The container element
   * @param {string} type - Container type ('workflow-step' or 'gallery')
   * @returns {Array} Array of image elements
   */
  function collectImagesFromContainer(container, type) {
    if (!container) {
      console.warn('Lightbox: Cannot collect images from null/undefined container.');
      return [];
    }
    
    let images = [];
    
    if (type === 'workflow-step') {
      // For workflow steps, collect all img elements within the container
      images = Array.from(container.querySelectorAll('img'));
      if (images.length === 0) {
        console.warn('Lightbox: No img elements found in workflow-step container:', container);
      }
    } else if (type === 'gallery') {
      // For gallery containers, use existing behavior with .lightbox-trigger class
      images = Array.from(container.querySelectorAll('.lightbox-trigger'));
      if (images.length === 0) {
        console.warn('Lightbox: No .lightbox-trigger elements found in gallery container:', container);
      }
    } else {
      console.warn(`Lightbox: Unknown container type "${type}". Expected 'workflow-step' or 'gallery'.`);
    }
    
    return images;
  }

  /**
   * Initialize the document click listener lazily
   * Task 7.3 optimization: Only attach when first needed
   */
  function initializeClickListener() {
    if (clickListenerAttached) return;
    
    /**
     * Enhanced delegated click listener supporting multiple container types
     */
    document.addEventListener('click', (e) => {
      // Check if clicked element is an image or has an image as target
      const clickedImg = e.target.tagName === 'IMG' ? e.target : null;
      
      // First, try to detect container to determine if this is a valid lightbox trigger
      let trigger = null;
      if (clickedImg) {
        const containerInfo = detectImageContainer(clickedImg);
        if (containerInfo) {
          // Image is in a valid container, use it as trigger
          trigger = clickedImg;
        }
      }
      
      // Fallback: check for explicit .lightbox-trigger class (for backward compatibility)
      if (!trigger) {
        trigger = e.target.closest('.lightbox-trigger');
      }
      
      if (!trigger) return;

      e.preventDefault();

      // Detect the appropriate container for this image
      const containerInfo = detectImageContainer(trigger);
      if (!containerInfo) {
        // Graceful fallback: No valid container detected
        console.warn('Lightbox: No valid container detected for image trigger. Image must be within .workflow-step__photo, .cs-gallery, .image-grid, or .cs-ideation container.');
        return;
      }

      const { container, type } = containerInfo;

      // Collect images from the detected container
      const imageElements = collectImagesFromContainer(container, type);
      if (imageElements.length === 0) {
        // Prevent lightbox initialization for empty containers
        console.warn(`Lightbox: Container detected but no valid images found. Container type: ${type}, Container:`, container);
        return;
      }
      
      // Build gallery images array with proper data attribute handling
      const images = imageElements.map(img => {
        // Handle data-full attribute with fallback to src
        const dataFull = img.getAttribute('data-full');
        const src = (dataFull && dataFull.trim() !== '') ? dataFull : img.src;
        
        // Handle caption attribute - convert empty strings to null
        const dataCaption = img.getAttribute('data-caption');
        const caption = (dataCaption && dataCaption.trim() !== '') ? dataCaption : null;
        
        // Handle description attribute - convert empty strings to null
        const dataDescription = img.getAttribute('data-description');
        const description = (dataDescription && dataDescription.trim() !== '') ? dataDescription : null;
        
        return {
          src: src,
          alt: img.alt || '', // Ensure alt is never null for accessibility
          caption: caption,
          description: description
        };
      });

      // Find the index of the clicked image
      const clickedIndex = imageElements.indexOf(trigger);
      if (clickedIndex === -1) return;

      // Open lightbox
      openLightbox(images, clickedIndex);
    });
    
    clickListenerAttached = true;
  }

  /**
   * Ensure click listener is initialized when needed
   * Task 7.3 optimization: Lazy initialization of document click listener
   */
  function ensureClickListenerInitialized() {
    if (!clickListenerAttached) {
      initializeClickListener();
    }
  }

  // Initialize click listener on first DOM interaction with potential lightbox triggers
  // This provides a balance between lazy loading and user experience
  if (typeof document !== 'undefined') {
    // Use a single event listener to detect when initialization might be needed
    document.addEventListener('DOMContentLoaded', () => {
      // Check if there are any potential lightbox containers on the page
      const hasContainers = document.querySelector('.workflow-step__photo, .cs-gallery, .image-grid, .cs-ideation');
      if (hasContainers) {
        // Initialize click listener since there are containers that might need it
        ensureClickListenerInitialized();
      }
    }, { once: true });
  }

})();

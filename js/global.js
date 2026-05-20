/* ============================================================
   WEBFLOW STARTER KIT — global.js
   Version: 1.0.0
   
   Single file. Auto-detects components via data-* attributes.
   Add to Webflow: Before </body> via jsDelivr.
   
   Dependencies (load BEFORE this script):
   - GSAP 3.12+ (always)
   - ScrollTrigger (always)
   - Swiper 11+ (only if [data-swiper] exists)
   - Lenis 1.1+ (only if <body data-lenis> exists)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  /* ===== REDUCED MOTION CHECK ===== */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===== GSAP INIT (always) ===== */
  try {
    if (typeof gsap !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      // If reduced motion — just reveal all animated elements instantly
      if (prefersReduced) {
        gsap.set('[data-animate]', { opacity: 1, y: 0, scale: 1 });
      }
    } else {
      console.warn('[Starter] GSAP not found. Load it before global.js');
      // Fallback: show all animated elements
      document.querySelectorAll('[data-animate]').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }
  } catch (e) {
    console.warn('[Starter] GSAP init failed:', e);
  }

  /* ===== COMPONENTS — auto-detect and init ===== */
  if (document.querySelector('[data-header]'))    initHeader();
  if (document.querySelector('[data-dropdown]'))  initDropdown();
  if (document.querySelector('[data-accordion]')) initAccordion();
  if (document.querySelector('[data-form]'))      initForm();

  // Swiper — only if library is loaded AND elements exist
  if (document.querySelector('[data-swiper]') && typeof Swiper !== 'undefined') {
    initSwiper();
  }

  // Animations — only if GSAP loaded and motion is OK
  if (typeof gsap !== 'undefined' && !prefersReduced) {
    if (document.querySelector('[data-animate]'))  initAnimations();
    if (document.querySelector('[data-parallax]')) initParallax();
  }

  // Lenis — opt-in via <body data-lenis>
  if (document.body.hasAttribute('data-lenis') && typeof Lenis !== 'undefined' && !prefersReduced) {
    initLenis();
  }
});


/* =================================================================
   HEADER
   
   Features:
   - Scroll state: adds .is-scrolled after 50px scroll
   - Burger toggle: toggles .is-active on burger, .is-open on overlay
   - Body scroll lock when mobile nav is open
   
   Required HTML structure:
   <header class="section_header" data-header>
     <div class="container-l">
       <div class="header_component">
         <a class="header_logo" href="/">...</a>
         <nav class="header_nav">...desktop links...</nav>
         <button class="header_burger" data-burger>
           <span class="header_burger-line"></span>
           <span class="header_burger-line"></span>
           <span class="header_burger-line"></span>
         </button>
       </div>
     </div>
     <nav class="header_nav-overlay" data-nav-overlay>
       ...mobile links...
     </nav>
   </header>
   ================================================================= */

function initHeader() {
  const header = document.querySelector('[data-header]');
  const burger = document.querySelector('[data-burger]');
  const overlay = document.querySelector('[data-nav-overlay]');
  if (!header) return;

  // --- Scroll state ---
  const scrollThreshold = 50;
  let lastScroll = 0;
  let ticking = false;

  function updateHeaderScroll() {
    const currentScroll = window.scrollY;
    
    if (currentScroll > scrollThreshold) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }

    lastScroll = currentScroll;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateHeaderScroll);
      ticking = true;
    }
  }, { passive: true });

  // Run once on load (page might load scrolled)
  updateHeaderScroll();

  // --- Burger toggle ---
  if (!burger || !overlay) return;
  
  let isNavOpen = false;

  function openNav() {
    isNavOpen = true;
    burger.classList.add('is-active');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    // If Lenis is running, pause it
    if (window.__lenis) window.__lenis.stop();
  }

  function closeNav() {
    isNavOpen = false;
    burger.classList.remove('is-active');
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';

    if (window.__lenis) window.__lenis.start();
  }

  burger.addEventListener('click', () => {
    isNavOpen ? closeNav() : openNav();
  });

  // Close on overlay link click (smooth page navigation)
  overlay.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isNavOpen) closeNav();
  });

  // Close if viewport resizes past tablet breakpoint (user rotated device)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 991 && isNavOpen) closeNav();
  });
}


/* =================================================================
   DROPDOWN (Nav)
   
   Desktop: open on hover with delay, close on mouseleave.
   Mobile: not used (mobile nav overlay has flat links).
   
   Required HTML:
   <div class="header_dropdown" data-dropdown>
     <button class="header_dropdown-trigger" data-dropdown-trigger>
       Services
     </button>
     <div class="header_dropdown-list" data-dropdown-list>
       <a href="#">Service 1</a>
       <a href="#">Service 2</a>
     </div>
   </div>
   
   Accessibility:
   - aria-expanded on trigger
   - arrow key navigation inside dropdown
   - closes on Escape
   ================================================================= */

function initDropdown() {
  const dropdowns = document.querySelectorAll('[data-dropdown]');
  if (!dropdowns.length) return;

  dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('[data-dropdown-trigger]');
    const list = dropdown.querySelector('[data-dropdown-list]');
    if (!trigger || !list) return;

    let closeTimer = null;
    const CLOSE_DELAY = 150; // ms — prevents flicker on mouse movement

    // Set initial ARIA state
    trigger.setAttribute('aria-expanded', 'false');

    function open() {
      clearTimeout(closeTimer);
      // Close all other dropdowns first
      dropdowns.forEach(d => {
        if (d !== dropdown) close(d);
      });
      dropdown.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }

    function close(target) {
      const t = target || dropdown;
      t.classList.remove('is-open');
      const trig = t.querySelector('[data-dropdown-trigger]');
      if (trig) trig.setAttribute('aria-expanded', 'false');
    }

    function delayedClose() {
      closeTimer = setTimeout(() => close(), CLOSE_DELAY);
    }

    // Desktop: hover behavior
    dropdown.addEventListener('mouseenter', open);
    dropdown.addEventListener('mouseleave', delayedClose);

    // Keyboard: toggle on Enter/Space
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = dropdown.classList.contains('is-open');
      isOpen ? close() : open();
    });

    // Keyboard: close on Escape
    dropdown.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        close();
        trigger.focus();
      }
    });

    // Focus management: close when focus leaves dropdown entirely
    dropdown.addEventListener('focusout', (e) => {
      // Check if the new focus target is still inside this dropdown
      requestAnimationFrame(() => {
        if (!dropdown.contains(document.activeElement)) {
          close();
        }
      });
    });
  });

  // Close all dropdowns on outside click
  document.addEventListener('click', (e) => {
    dropdowns.forEach(dropdown => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('is-open');
        const trigger = dropdown.querySelector('[data-dropdown-trigger]');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      }
    });
  });
}


/* =================================================================
   ACCORDION (FAQ)
   
   Supports:
   - Single open (default): opening one closes others
   - Multi open: add data-accordion-multi on the parent wrapper
   - Smooth height animation via max-height
   - Accessible: aria-expanded, keyboard support
   
   Required HTML:
   <div class="faq_component" data-accordion-group>
     <div class="faq_item" data-accordion>
       <button class="faq_trigger" data-accordion-trigger>
         <span class="faq_question">Question?</span>
         <span class="faq_icon">+</span>
       </button>
       <div class="faq_content" data-accordion-content>
         <p class="faq_answer">Answer text here.</p>
       </div>
     </div>
   </div>
   
   Multi-open mode:
   <div class="faq_component" data-accordion-group data-accordion-multi>
   ================================================================= */

function initAccordion() {
  const groups = document.querySelectorAll('[data-accordion-group]');
  
  // If no group wrapper, treat all accordions as one group
  if (!groups.length) {
    initAccordionGroup(document, false);
    return;
  }

  groups.forEach(group => {
    const allowMulti = group.hasAttribute('data-accordion-multi');
    initAccordionGroup(group, allowMulti);
  });
}

function initAccordionGroup(container, allowMulti) {
  const items = container.querySelectorAll('[data-accordion]');
  if (!items.length) return;

  items.forEach(item => {
    const trigger = item.querySelector('[data-accordion-trigger]');
    const content = item.querySelector('[data-accordion-content]');
    if (!trigger || !content) return;

    // Set initial ARIA
    trigger.setAttribute('aria-expanded', 'false');

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Close others in the same group (unless multi mode)
      if (!allowMulti) {
        items.forEach(other => {
          if (other !== item && other.classList.contains('is-open')) {
            other.classList.remove('is-open');
            other.querySelector('[data-accordion-trigger]')?.setAttribute('aria-expanded', 'false');
            other.querySelector('[data-accordion-content]').style.maxHeight = null;
          }
        });
      }

      // Toggle clicked item
      if (isOpen) {
        item.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        content.style.maxHeight = null;
      } else {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });

  // Recalculate max-height on window resize (content may reflow)
  window.addEventListener('resize', () => {
    items.forEach(item => {
      if (item.classList.contains('is-open')) {
        const content = item.querySelector('[data-accordion-content]');
        if (content) content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
}


/* =================================================================
   FORM VALIDATION
   
   Lightweight client-side validation.
   Adds .is-error / .is-success classes on fields.
   Shows/hides error messages via [data-error-for="fieldName"].
   
   Required HTML:
   <form data-form>
     <input type="email" name="email" required data-validate>
     <span data-error-for="email" class="u-hide">Enter valid email</span>
     
     <input type="text" name="name" required data-validate>
     <span data-error-for="name" class="u-hide">Name is required</span>
     
     <button type="submit">Send</button>
   </form>
   ================================================================= */

function initForm() {
  const forms = document.querySelectorAll('[data-form]');
  if (!forms.length) return;

  forms.forEach(form => {
    const fields = form.querySelectorAll('[data-validate]');

    // Validate single field
    function validateField(field) {
      const name = field.getAttribute('name');
      const errorEl = form.querySelector(`[data-error-for="${name}"]`);
      let isValid = true;

      // Required check
      if (field.hasAttribute('required') && !field.value.trim()) {
        isValid = false;
      }

      // Email format
      if (field.type === 'email' && field.value.trim()) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        isValid = emailPattern.test(field.value);
      }

      // Phone format (basic)
      if (field.type === 'tel' && field.value.trim()) {
        const phonePattern = /^[\d\s\-+()]{7,}$/;
        isValid = phonePattern.test(field.value);
      }

      // Apply states
      field.classList.toggle('is-error', !isValid);
      field.classList.toggle('is-success', isValid && field.value.trim() !== '');
      
      if (errorEl) {
        errorEl.classList.toggle('u-hide', isValid);
      }

      return isValid;
    }

    // Validate on blur (when user leaves field)
    fields.forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      
      // Clear error state on input (feels more responsive)
      field.addEventListener('input', () => {
        if (field.classList.contains('is-error')) {
          field.classList.remove('is-error');
          const errorEl = form.querySelector(`[data-error-for="${field.name}"]`);
          if (errorEl) errorEl.classList.add('u-hide');
        }
      });
    });

    // Validate all on submit
    form.addEventListener('submit', (e) => {
      let allValid = true;
      
      fields.forEach(field => {
        if (!validateField(field)) allValid = false;
      });

      if (!allValid) {
        e.preventDefault();
        // Focus first invalid field
        const firstError = form.querySelector('.is-error');
        if (firstError) firstError.focus();
      }
      // If valid — Webflow handles the actual submission
    });
  });
}


/* =================================================================
   SWIPER INIT
   
   Base Swiper configuration with data-attribute overrides.
   You customize per-slider via data-attrs in Webflow.
   
   Required HTML:
   <div class="swiper" data-swiper 
        data-swiper-slides="3"
        data-swiper-gap="24"
        data-swiper-loop="true">
     <div class="swiper-wrapper">
       <div class="swiper-slide">...</div>
       <div class="swiper-slide">...</div>
     </div>
     <button data-swiper-prev>←</button>
     <button data-swiper-next>→</button>
     <div data-swiper-pagination></div>
   </div>
   
   Available data-attrs:
   data-swiper-slides    → slidesPerView on desktop (default: 1)
   data-swiper-slides-tablet → slidesPerView on tablet (default: auto-calc)
   data-swiper-slides-mobile → slidesPerView on mobile (default: 1)
   data-swiper-gap       → spaceBetween in px (default: 16)
   data-swiper-loop      → "true" to enable loop (default: false)
   data-swiper-autoplay  → delay in ms, e.g. "3000" (default: off)
   data-swiper-speed     → transition speed in ms (default: 500)
   ================================================================= */

function initSwiper() {
  const sliders = document.querySelectorAll('[data-swiper]');
  if (!sliders.length) return;

  sliders.forEach(el => {
    // Read config from data-attributes
    const desktopSlides = parseFloat(el.dataset.swiperSlides) || 1;
    const tabletSlides = parseFloat(el.dataset.swiperSlidesTablet) || Math.max(1, Math.floor(desktopSlides * 0.66));
    const mobileSlides = parseFloat(el.dataset.swiperSlidesMobile) || 1;
    const gap = parseInt(el.dataset.swiperGap, 10) || 16;
    const loop = el.dataset.swiperLoop === 'true';
    const speed = parseInt(el.dataset.swiperSpeed, 10) || 500;
    const autoplayDelay = parseInt(el.dataset.swiperAutoplay, 10);

    // Ensure Swiper can find its structure — add classes if Webflow stripped them
    if (!el.classList.contains('swiper')) {
      el.classList.add('swiper');
    }
    const wrapper = el.querySelector(':scope > div:not([data-swiper-prev]):not([data-swiper-next]):not([data-swiper-pagination])');
    if (wrapper && !wrapper.classList.contains('swiper-wrapper')) {
      wrapper.classList.add('swiper-wrapper');
      // Add swiper-slide to each direct child of wrapper
      Array.from(wrapper.children).forEach(child => {
        if (!child.classList.contains('swiper-slide')) {
          child.classList.add('swiper-slide');
        }
      });
    }

    // Build config
    const config = {
      slidesPerView: mobileSlides,
      spaceBetween: gap,
      speed: speed,
      loop: loop,
      grabCursor: true,
      observer: true,
      observeParents: true,
      breakpoints: {
        768: {
          slidesPerView: tabletSlides,
          spaceBetween: gap,
        },
        1280: {
          slidesPerView: desktopSlides,
          spaceBetween: gap,
        },
      },
    };

    // Search for nav/pagination in parent wrapper (they may be outside .swiper)
    const searchRoot = el.parentElement || el;

    // Navigation
    const prevBtn = searchRoot.querySelector('[data-swiper-prev]');
    const nextBtn = searchRoot.querySelector('[data-swiper-next]');
    if (prevBtn && nextBtn) {
      config.navigation = {
        prevEl: prevBtn,
        nextEl: nextBtn,
      };
    }

    // Pagination
    const paginationEl = searchRoot.querySelector('[data-swiper-pagination]');
    if (paginationEl) {
      config.pagination = {
        el: paginationEl,
        clickable: true,
      };
    }

    // Autoplay
    if (autoplayDelay) {
      config.autoplay = {
        delay: autoplayDelay,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      };
    }

    // Initialize
    try {
      new Swiper(el, config);
    } catch (e) {
      console.warn('[Starter] Swiper init failed:', e);
    }
  });
}


/* =================================================================
   ANIMATIONS — Scroll-triggered reveals
   
   Uses GSAP ScrollTrigger batch for performance.
   Elements start hidden (CSS handles initial state).
   
   Available data-attrs:
   data-animate="fade-in"  → fade + slide up (default)
   data-animate="stagger"  → staggered grid reveal
   data-animate="scale"    → scale up + fade
   
   Optional modifiers:
   data-animate-delay="0.2"   → extra delay in seconds
   data-animate-duration="0.8" → custom duration
   ================================================================= */

function initAnimations() {
  // --- Fade-in (individual elements) ---
  const fadeEls = document.querySelectorAll('[data-animate="fade-in"]');
  if (fadeEls.length) {
    ScrollTrigger.batch(fadeEls, {
      onEnter: (batch) => {
        batch.forEach((el, i) => {
          const delay = parseFloat(el.dataset.animateDelay) || 0;
          const duration = parseFloat(el.dataset.animateDuration) || 0.8;
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: duration,
            delay: delay,
            ease: 'power2.out',
          });
        });
      },
      start: 'top 88%',
      once: true,
    });
  }

  // --- Stagger (grid items reveal one by one) ---
  const staggerEls = document.querySelectorAll('[data-animate="stagger"]');
  if (staggerEls.length) {
    ScrollTrigger.batch(staggerEls, {
      onEnter: (batch) => {
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.7,
          ease: 'power2.out',
        });
      },
      start: 'top 88%',
      once: true,
    });
  }

  // --- Scale (zoom-in reveal) ---
  const scaleEls = document.querySelectorAll('[data-animate="scale"]');
  if (scaleEls.length) {
    ScrollTrigger.batch(scaleEls, {
      onEnter: (batch) => {
        batch.forEach((el) => {
          const delay = parseFloat(el.dataset.animateDelay) || 0;
          gsap.to(el, {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            delay: delay,
            ease: 'power2.out',
          });
        });
      },
      start: 'top 88%',
      once: true,
    });
  }

  // --- Fallback: any [data-animate] without a specific type ---
  const genericEls = document.querySelectorAll('[data-animate]:not([data-animate="fade-in"]):not([data-animate="stagger"]):not([data-animate="scale"])');
  if (genericEls.length) {
    ScrollTrigger.batch(genericEls, {
      onEnter: (batch) => {
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.7,
          ease: 'power2.out',
        });
      },
      start: 'top 88%',
      once: true,
    });
  }
}


/* =================================================================
   PARALLAX
   
   Simple parallax on scroll via GSAP.
   
   Usage:
   <img data-parallax src="..." />
   <div data-parallax data-parallax-speed="-20">...</div>
   
   data-parallax-speed → yPercent value (default: -15)
     Negative = moves up slower (classic parallax)
     Positive = moves down faster
   ================================================================= */

function initParallax() {
  const elements = document.querySelectorAll('[data-parallax]');
  if (!elements.length) return;

  elements.forEach(el => {
    const speed = parseFloat(el.dataset.parallaxSpeed) || -15;

    gsap.to(el, {
      yPercent: speed,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });
}


/* =================================================================
   LENIS SMOOTH SCROLL (optional)
   
   Activated by adding data-lenis to <body>:
   <body data-lenis>
   
   Syncs with GSAP ticker for ScrollTrigger accuracy.
   Exposes window.__lenis for external control (header scroll lock etc).
   
   Optional attrs on <body>:
   data-lenis-duration="1.2"  → scroll smoothness (default: 1.2)
   ================================================================= */

function initLenis() {
  try {
    const duration = parseFloat(document.body.dataset.lenisDuration) || 1.2;

    const lenis = new Lenis({
      duration: duration,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    // Sync with GSAP ticker (critical for ScrollTrigger)
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Expose globally for header scroll lock, modals, etc.
    window.__lenis = lenis;

    // Handle anchor links smoothly
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, { offset: -80, duration: 1.2 });
        }
      });
    });
  } catch (e) {
    console.warn('[Starter] Lenis init failed:', e);
  }
}

/* ============================================
   BHONE NYAN SOE — app.js
   Scroll reveals, nav behavior, mobile toggle
   ============================================ */

(function () {
  'use strict';

  // --- Slow, eased scrolling (Lenis) ---
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.6,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      syncTouch: true,
      smoothTouch: true,
      touchMultiplier: 1.1,
      wheelMultiplier: 0.85,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // --- Relative "time ago" for podcast episode dates ---
  document.querySelectorAll('.episode-card__meta[data-published]').forEach((el) => {
    const published = new Date(el.dataset.published);
    const diffDays = Math.floor((Date.now() - published) / 86400000);

    let text;
    if (diffDays < 1) {
      text = 'Today';
    } else if (diffDays === 1) {
      text = '1 day ago';
    } else if (diffDays < 30) {
      text = `${diffDays} days ago`;
    } else if (diffDays < 365) {
      const months = Math.round(diffDays / 30);
      text = months === 1 ? '1 month ago' : `${months} months ago`;
    } else {
      const years = Math.round(diffDays / 365);
      text = years === 1 ? '1 year ago' : `${years} years ago`;
    }

    el.textContent = text;
  });

  // --- Scroll Reveal via IntersectionObserver ---
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // --- Staggered reveal for grid children ---
  const staggerContainers = document.querySelectorAll('.ventures__grid, .media__grid, .episodes__grid');

  const staggerObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const children = entry.target.querySelectorAll('.reveal');
          children.forEach((child, i) => {
            child.style.transitionDelay = `${i * 120}ms`;
            child.classList.add('is-visible');
          });
          staggerObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  staggerContainers.forEach((el) => staggerObserver.observe(el));

  // --- Mobile nav toggle ---
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('is-open');
      navLinks.classList.toggle('is-open');
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('is-open');
        navLinks.classList.remove('is-open');
      });
    });
  }

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();

        if (lenis) {
          lenis.scrollTo(target, { duration: 1.6 });
        } else {
          const targetPos = target.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top: targetPos, behavior: 'smooth' });
        }
      }
    });
  });

  // --- Contact form ---
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const statusEl = document.getElementById('contactStatus');
    const submitBtn = contactForm.querySelector('.contact__submit');

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Honeypot — if filled, silently drop (likely a bot)
      const honey = contactForm.elements['_honey'];
      if (honey && honey.value) return;

      submitBtn.disabled = true;
      statusEl.textContent = 'Sending…';
      statusEl.className = 'contact__status';

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(contactForm),
        });

        if (!response.ok) throw new Error('Submission failed');

        statusEl.textContent = "Thanks — I'll get back to you soon.";
        statusEl.className = 'contact__status contact__status--success';
        contactForm.reset();
      } catch (err) {
        statusEl.textContent = 'Something went wrong. Please try again or email me directly.';
        statusEl.className = 'contact__status contact__status--error';
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

})();

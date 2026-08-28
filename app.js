/* ============================================
   BHONE NYAN SOE — app.js
   Scroll reveals, nav behavior, mobile toggle
   ============================================ */

(function () {
  'use strict';

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
  const staggerContainers = document.querySelectorAll('.ventures__grid, .media__grid');

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

  // --- Nav scroll behavior ---
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  function onScroll() {
    const scrollY = window.scrollY || window.pageYOffset;

    // Add/remove scrolled class for blur background
    if (scrollY > 40) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }

    lastScroll = scrollY;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Init state

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
        const navHeight = nav ? nav.offsetHeight : 72;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
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

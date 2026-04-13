/* ============================================
   MAESTROS DEL CLOUD — Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* -------------------------------------------
     1. NAVBAR — scroll effect
     ------------------------------------------- */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* -------------------------------------------
     2. HAMBURGER — mobile menu toggle
     ------------------------------------------- */
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.setAttribute('aria-expanded', 'false');

    function closeMenu() {
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.contains('open');
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(!isOpen));
      document.body.style.overflow = !isOpen ? 'hidden' : '';
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
        closeMenu();
      }
    });
  }

  /* -------------------------------------------
     3. ACTIVE NAV LINK — detect current page
     ------------------------------------------- */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a:not(.nav-cta)').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* -------------------------------------------
     4. SCROLL REVEAL — IntersectionObserver
     ------------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length > 0) {
    // Immediately reveal elements already in viewport on load
    const viewportH = window.innerHeight;
    revealElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < viewportH - 40) {
        el.classList.add('revealed');
      }
    });

    // Observe remaining hidden elements for scroll reveal
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.reveal:not(.revealed)').forEach(el => {
      revealObserver.observe(el);
    });
  }

  /* -------------------------------------------
     5. ANIMATED COUNTERS — data-count
     ------------------------------------------- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(el => counterObserver.observe(el));
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = prefix + current + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  /* -------------------------------------------
     6. FILTER TABS — data-filter / data-category
     ------------------------------------------- */
  const filterTabs = document.querySelectorAll('.filter-tab');
  const filterCards = document.querySelectorAll('[data-category]');

  if (filterTabs.length > 0 && filterCards.length > 0) {
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const filter = tab.getAttribute('data-filter');

        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        filterCards.forEach(card => {
          if (filter === 'all' || card.getAttribute('data-category') === filter) {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });
  }

  /* -------------------------------------------
     7a. NAVBAR SHRINK — reduce on scroll
     ------------------------------------------- */
  // Already handled by .scrolled class in section 1

  /* -------------------------------------------
     7b. FLOAT CARD PARALLAX — scroll-linked
     ------------------------------------------- */
  const heroSection = document.querySelector('.hero');
  const floatCards = document.querySelectorAll('.float-card');
  if (heroSection && floatCards.length) {
    let parallaxTicking = false;
    window.addEventListener('scroll', () => {
      if (!parallaxTicking) {
        parallaxTicking = true;
        requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
          if (scrolled < heroBottom) {
            floatCards.forEach((card, i) => {
              const rate = scrolled * 0.12;
              card.style.transform = `translateY(${-rate * (0.4 + i * 0.15)}px)`;
            });
          }
          parallaxTicking = false;
        });
      }
    }, { passive: true });
  }

  /* -------------------------------------------
     7c. CARD GLOW — mouse-tracking light
     ------------------------------------------- */
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', x + '%');
      card.style.setProperty('--mouse-y', y + '%');
    });
  });

  /* -------------------------------------------
     7d. PARTICLE CANVAS — hero home only
     ------------------------------------------- */
  const canvas = document.getElementById('hero-particles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId;

    function resizeCanvas() {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    }

    function createParticles() {
      particles = [];
      const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 12000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          r: Math.random() * 2 + 1,
          alpha: Math.random() * 0.4 + 0.1
        });
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255,255,255,${0.06 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(drawParticles);
    }

    resizeCanvas();
    createParticles();
    drawParticles();

    window.addEventListener('resize', () => {
      resizeCanvas();
      createParticles();
    });

    // Pause when not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else {
        drawParticles();
      }
    });
  }

  /* -------------------------------------------
     8. CONTACT FORM — submit simulation
     ------------------------------------------- */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('.form-submit');
      const errorDiv = contactForm.querySelector('.form-error');
      const originalText = submitBtn.textContent;

      // Sync _replyto with email field
      const emailField = contactForm.querySelector('#email');
      const replyTo = contactForm.querySelector('#_replyto');
      if (emailField && replyTo) {
        replyTo.value = emailField.value;
      }

      // Show loading state
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';
      if (errorDiv) errorDiv.style.display = 'none';

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          // Success — animate out form, show success
          contactForm.style.opacity = '0';
          contactForm.style.transform = 'translateY(-12px)';
          contactForm.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          setTimeout(() => {
            contactForm.style.display = 'none';
            document.querySelector('.form-success').classList.add('show');
          }, 300);
        } else {
          throw new Error('Server error');
        }
      } catch (err) {
        // Show error
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        if (errorDiv) errorDiv.style.display = 'block';
      }
    });
  }

  /* -------------------------------------------
     9. FAQ ACCORDION
     ------------------------------------------- */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.setAttribute('aria-expanded', 'false');

    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const answer = item.querySelector('.faq-answer');
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        openItem.querySelector('.faq-answer').style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* -------------------------------------------
     10. SERVICE PILLS — smooth scroll + active
     ------------------------------------------- */
  const servicePills = document.querySelectorAll('.service-pill');
  if (servicePills.length > 0) {
    servicePills.forEach(pill => {
      pill.addEventListener('click', () => {
        const target = document.querySelector(pill.getAttribute('data-target'));
        if (target) {
          const offset = 160;
          const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
        servicePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      });
    });

    // Update active pill on scroll (throttled)
    const servicesSections = document.querySelectorAll('.service-section');
    if (servicesSections.length > 0) {
      let scrollTicking = false;
      window.addEventListener('scroll', () => {
        if (!scrollTicking) {
          scrollTicking = true;
          requestAnimationFrame(() => {
            let current = '';
            servicesSections.forEach(section => {
              const top = section.offsetTop - 200;
              if (window.pageYOffset >= top) {
                current = '#' + section.id;
              }
            });
            servicePills.forEach(pill => {
              pill.classList.toggle('active', pill.getAttribute('data-target') === current);
            });
            scrollTicking = false;
          });
        }
      }, { passive: true });
    }
  }

});

/* ================================
   SGI ARQUITECTURA — main.js
================================ */

document.addEventListener('DOMContentLoaded', () => {

  const isMobile = () => window.innerWidth <= 768;

  /* --------------------------------
     1. SCROLL ANIMATIONS
  -------------------------------- */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '-60px 0px'
  });

  document.querySelectorAll('.reveal, .reveal-fade, .line-reveal').forEach(el => {
    observer.observe(el);
  });

  /* --------------------------------
     2. SMOOTH SCROLL
  -------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* --------------------------------
     3. NAVBAR
  -------------------------------- */
  const nav = document.querySelector('nav');
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  const navLogo = document.querySelector('.nav-logo');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
    document.querySelectorAll('.nav-menu a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    if (current > 150) {
      nav.classList.add('nav-scrolled');
      nav.style.top = current > lastScroll ? '-160px' : '0';
    } else {
      nav.classList.remove('nav-scrolled');
      nav.style.top = '0';
    }
    lastScroll = current;
  }, { passive: true });

  /* --------------------------------
     3b. LOGO SMOOTH INTERPOLATION
     Gradually shrinks logo from large to small
     as user scrolls. Uses lerp + rAF for smoothness.
  -------------------------------- */
  const LOGO_LARGE = isMobile() ? 180 : 300;
  const LOGO_SMALL = 130;
  const LOGO_TOP_LARGE = isMobile() ? 16 : 20;
  const LOGO_TOP_SMALL = isMobile() ? 5 : 10;
  const SCROLL_END = 280;

  let currentLogoSize = LOGO_LARGE;
  let currentLogoTop = LOGO_TOP_LARGE;
  let currentNavLinksMT = isMobile() ? 0 : 135;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function updateLogoOnScroll() {
    const scroll = window.scrollY;
    const progress = easeInOut(Math.min(Math.max(scroll / SCROLL_END, 0), 1));

    const targetSize = lerp(LOGO_LARGE, LOGO_SMALL, progress);
    const targetTop = lerp(LOGO_TOP_LARGE, LOGO_TOP_SMALL, progress);
    const targetMT = isMobile() ? 0 : lerp(135, 0, progress);

    // Smooth chase — lerp toward target each frame
    currentLogoSize = lerp(currentLogoSize, targetSize, 0.1);
    currentLogoTop = lerp(currentLogoTop, targetTop, 0.1);
    currentNavLinksMT = lerp(currentNavLinksMT, targetMT, 0.1);

    if (navLogo) {
      navLogo.style.height = currentLogoSize + 'px';
      navLogo.style.width = currentLogoSize + 'px';
      navLogo.style.top = currentLogoTop + 'px';
    }

    if (navMenu && !isMobile()) {
      navMenu.style.marginTop = currentNavLinksMT + 'px';
    }

    requestAnimationFrame(updateLogoOnScroll);
  }

  requestAnimationFrame(updateLogoOnScroll);

  /* --------------------------------
     3c. ABOUT SECTION — AUTO CROSSFADE SLIDESHOW
  -------------------------------- */
  const aboutSlides = document.querySelectorAll('.about-slide');
  if (aboutSlides.length > 1) {
    let aboutCurrent = 0;
    setInterval(() => {
      aboutSlides[aboutCurrent].classList.remove('active');
      aboutCurrent = (aboutCurrent + 1) % aboutSlides.length;
      aboutSlides[aboutCurrent].classList.add('active');
    }, 5000);
  }

  /* --------------------------------
     4. HERO PARALLAX — mouse + scroll
  -------------------------------- */
  const heroBgImg = document.querySelector('.hero-bg img');
  let mouseNX = 0, mouseNY = 0;
  let curPX = 0, curPY = 0;

  if (heroBgImg && !isMobile()) {
    document.addEventListener('mousemove', e => {
      mouseNX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseNY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
  }

  function animateParallax() {
    if (heroBgImg && !isMobile()) {
      curPX = lerp(curPX, mouseNX * 28, 0.06);
      curPY = lerp(curPY, mouseNY * 28, 0.06);
      const scrollOffset = window.scrollY * 0.3;
      heroBgImg.style.transform =
        `translate(${curPX}px, ${curPY + scrollOffset}px) scale(1.1)`;
    }
    requestAnimationFrame(animateParallax);
  }

  animateParallax();

  /* --------------------------------
     5. PORTFOLIO FILTERS
  -------------------------------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.style.transition = 'opacity 0.4s, transform 0.4s';
        card.style.opacity = match ? '1' : '0.15';
        card.style.transform = match ? 'scale(1)' : 'scale(0.97)';
        card.style.pointerEvents = match ? 'auto' : 'none';
      });
    });
  });

  /* --------------------------------
     6. COUNT-UP ANIMATION
  -------------------------------- */
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const raw = el.textContent.trim();
      const match = raw.match(/^(\d+(?:\.\d+)?)(.*)$/);
      if (!match) return;

      const endVal = parseFloat(match[1]);
      const suffix = match[2] || '';
      const duration = 1800;
      const startTime = performance.now();

      function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

      function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const current = Math.round(easeOut(progress) * endVal);
        el.textContent = current + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      statObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-value').forEach(el => statObserver.observe(el));

  /* --------------------------------
     7. MAGNETIC CTA BUTTON
  -------------------------------- */
  const ctaWrap = document.getElementById('ctaMagnetic');
  const ctaBtn = ctaWrap ? ctaWrap.querySelector('.btn-outline') : null;

  if (ctaWrap && ctaBtn && !isMobile()) {
    let btnX = 0, btnY = 0;
    let targetBtnX = 0, targetBtnY = 0;

    ctaWrap.addEventListener('mouseleave', () => {
      targetBtnX = 0;
      targetBtnY = 0;
    });

    ctaWrap.addEventListener('mousemove', e => {
      const rect = ctaWrap.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      targetBtnX = (e.clientX - cx) * 0.35;
      targetBtnY = (e.clientY - cy) * 0.35;
    });

    function animateMagnet() {
      btnX = lerp(btnX, targetBtnX, 0.1);
      btnY = lerp(btnY, targetBtnY, 0.1);
      ctaBtn.style.transform = `translate(${btnX}px, ${btnY}px)`;
      requestAnimationFrame(animateMagnet);
    }

    animateMagnet();
  }

  /* --------------------------------
     8. CUSTOM CURSOR (desktop only)
  -------------------------------- */
  if (!isMobile()) {
    const cursor = document.createElement('div');
    cursor.id = 'custom-cursor';
    cursor.style.cssText = `
      position:fixed;width:8px;height:8px;background:#535353;
      border-radius:50%;pointer-events:none;z-index:9999;
      transform:translate(-50%,-50%);
      transition:width .3s,height .3s,background .3s;
      mix-blend-mode:difference;
    `;
    document.body.appendChild(cursor);

    const cursorRing = document.createElement('div');
    cursorRing.style.cssText = `
      position:fixed;width:32px;height:32px;
      border:1px solid rgba(83,83,83,0.4);border-radius:50%;
      pointer-events:none;z-index:9998;transform:translate(-50%,-50%);
      transition:width .3s,height .3s,opacity .3s;
    `;
    document.body.appendChild(cursorRing);

    let cMX = 0, cMY = 0, rX = 0, rY = 0;

    document.addEventListener('mousemove', e => {
      cMX = e.clientX; cMY = e.clientY;
      cursor.style.left = cMX + 'px';
      cursor.style.top = cMY + 'px';
    });

    (function animateRing() {
      rX += (cMX - rX) * 0.12;
      rY += (cMY - rY) * 0.12;
      cursorRing.style.left = rX + 'px';
      cursorRing.style.top = rY + 'px';
      requestAnimationFrame(animateRing);
    })();

    document.querySelectorAll('a, .project-card, button').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.width = '12px'; cursor.style.height = '12px';
        cursorRing.style.width = '48px'; cursorRing.style.height = '48px';
        cursorRing.style.opacity = '0.6';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.width = '8px'; cursor.style.height = '8px';
        cursorRing.style.width = '32px'; cursorRing.style.height = '32px';
        cursorRing.style.opacity = '1';
      });
    });
  }

  /* --------------------------------
     9. SNAP SCROLL — inteligente por sección
     Reglas:
       - Hero (100vh): wheel abajo → snap a #portafolio
       - Portafolio: scroll NATIVO libre — el usuario ve todos los proyectos
       - Al llegar al fondo de portafolio + wheel abajo → snap a #servicios
       - En #servicios + wheel arriba → vuelve al fondo de #portafolio
       - Wheel arriba en el tope de portafolio → snap a #hero
  -------------------------------- */
  const secHero = document.getElementById('hero');
  const secPort = document.getElementById('portafolio');
  const secServ = document.getElementById('servicios');
  let snapping = false;

  function atTop(el, tolerance = 8) {
    return Math.abs(el.getBoundingClientRect().top) <= tolerance;
  }

  function portafolioScrolledToBottom() {
    const r = secPort.getBoundingClientRect();
    const rs = secServ.getBoundingClientRect();
    // Bottom of portfolio is visible AND top of services hasn't reached the top yet
    return r.bottom <= window.innerHeight + 8 && rs.top > 8;
  }

  function atTopOfServicios() {
    const r = secServ.getBoundingClientRect();
    return r.top >= -6 && r.top <= 6;
  }

  window.addEventListener('wheel', e => {
    if (isMobile() || snapping) return;

    const down = e.deltaY > 0;
    const up = e.deltaY < 0;

    // Hero → portafolio
    if (down && atTop(secHero)) {
      e.preventDefault();
      doSnapTo(secPort);
      return;
    }

    // Tope de portafolio → hero
    if (up && atTop(secPort)) {
      e.preventDefault();
      doSnapTo(secHero);
      return;
    }

    // Fondo de portafolio → servicios
    if (down && portafolioScrolledToBottom()) {
      e.preventDefault();
      doSnapTo(secServ);
      return;
    }

    // Tope de servicios → fondo de portafolio
    if (up && atTopOfServicios()) {
      // Solo snap up si estamos realmente en la franja superior de servicios
      e.preventDefault();
      const rPort = secPort.getBoundingClientRect();
      const diff = rPort.bottom - window.innerHeight;
      window.scrollBy({ top: diff, behavior: 'smooth' });
      snapping = true;
      setTimeout(() => { snapping = false; }, 1000);
      return;
    }

    // Resto: scroll nativo, no intervenir
  }, { passive: false });

  function doSnapTo(section) {
    snapping = true;
    section.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => { snapping = false; }, 1100);
  }

  /* --------------------------------
     10. PROJECT MODAL & SLIDER
  -------------------------------- */
  const modal = document.getElementById('projectModal');
  const track = document.getElementById('sliderTrack');
  let currentSlide = 0, totalSlides = 0;

  window.openModal = function (card) {
    const d = card.dataset;
    document.getElementById('modalTitle').textContent = d.title;
    document.getElementById('modalCategory').textContent = d.category;
    document.getElementById('modalDesc').textContent = d.desc;
    document.getElementById('modalLocation').textContent = d.location;
    document.getElementById('modalYear').textContent = d.year;
    document.getElementById('modalArea').textContent = d.area;

    track.innerHTML = '';
    const images = d.images.split(',');
    totalSlides = images.length;
    currentSlide = 0;
    images.forEach(src => {
      const slide = document.createElement('div');
      slide.className = 'slider-slide';
      slide.innerHTML = `<img src="${src.trim()}" alt="${d.title}">`;
      track.appendChild(slide);
    });
    updateSlider();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeModal = function () {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  window.nextSlide = function () {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateSlider();
  };

  window.prevSlide = function () {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateSlider();
  };

  function updateSlider() {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
  }

  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => window.openModal(card));
  });

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

});

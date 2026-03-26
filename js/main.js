/* ================================
   SGI ARQUITECTURA — main.js
   Animaciones con IntersectionObserver
   (reemplaza Framer Motion del proyecto React original)
================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* --------------------------------
     1. SCROLL ANIMATIONS
     Observa elementos con .reveal, .reveal-fade y .line-reveal
  -------------------------------- */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // solo una vez (once: true)
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '-80px 0px'
  });

  document.querySelectorAll('.reveal, .reveal-fade, .line-reveal').forEach(el => {
    observer.observe(el);
  });

  /* --------------------------------
     2. SMOOTH SCROLL — links de navegación
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
     3. NAVBAR — ocultar/mostrar en scroll & menú responsive
  -------------------------------- */
  const nav = document.querySelector('nav');
  const hamburger = document.querySelector('.hamburger');
  const navLinksContainer = document.querySelector('.nav-links');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinksContainer.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinksContainer.classList.remove('active');
      });
    });
  }

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    if (current > 100) {
      nav.classList.add('nav-scrolled');
      nav.style.top = current > lastScroll ? '-120px' : '0';
    } else {
      nav.classList.remove('nav-scrolled');
      nav.style.top = '0';
    }
    lastScroll = current;
  }, { passive: true });

  /* --------------------------------
     4. PORTFOLIO — filtros de categoría
  -------------------------------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Estado activo del botón
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.style.transition = 'opacity 0.4s, transform 0.4s';
        if (match) {
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
          card.style.pointerEvents = 'auto';
        } else {
          card.style.opacity = '0.2';
          card.style.transform = 'scale(0.97)';
          card.style.pointerEvents = 'none';
        }
      });
    });
  });

  /* --------------------------------
     5. CURSOR PERSONALIZADO (desktop)
  -------------------------------- */
  if (window.innerWidth > 768) {
    const cursor = document.createElement('div');
    cursor.id = 'custom-cursor';
    cursor.style.cssText = `
      position: fixed;
      width: 8px;
      height: 8px;
      background: #535353;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      transition: transform 0.15s ease, width 0.3s ease, height 0.3s ease, background 0.3s ease;
      mix-blend-mode: difference;
    `;
    document.body.appendChild(cursor);

    const cursorRing = document.createElement('div');
    cursorRing.style.cssText = `
      position: fixed;
      width: 32px;
      height: 32px;
      border: 1px solid rgba(83,83,83,0.4);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9998;
      transform: translate(-50%, -50%);
      transition: transform 0.4s ease, width 0.3s ease, height 0.3s ease, opacity 0.3s ease;
    `;
    document.body.appendChild(cursorRing);

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = mouseX + 'px';
      cursor.style.top = mouseY + 'px';
    });

    // Ring lag effect
    function animateRing() {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover en links y cards
    document.querySelectorAll('a, .project-card, button').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.width = '12px';
        cursor.style.height = '12px';
        cursorRing.style.width = '48px';
        cursorRing.style.height = '48px';
        cursorRing.style.opacity = '0.6';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.width = '8px';
        cursor.style.height = '8px';
        cursorRing.style.width = '32px';
        cursorRing.style.height = '32px';
        cursorRing.style.opacity = '1';
      });
    });
  }

  /* --------------------------------
     6. CUSTOM PAGE SCROLL
     Snap-scrolls only the first 3 sections (hero, portafolio, servicios).
     Once past those, native scrolling takes over.
  -------------------------------- */
  const SNAPPED_SECTIONS = 3; // hero(0), portafolio(1), servicios(2)
  let isScrolling = false;
  let currentSectionIndex = 0;
  const sections = Array.from(document.querySelectorAll('section'));

  function updateCurrentSectionIndex() {
    let closestIndex = 0;
    let minDiff = Infinity;
    sections.forEach((section, index) => {
      const diff = Math.abs(section.getBoundingClientRect().top);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = index;
      }
    });
    currentSectionIndex = closestIndex;
  }

  function isInSnapZone() {
    // We're in snap zone if: viewing one of the first N sections,
    // OR we're at the top of section N (scrolling back up into snap zone).
    updateCurrentSectionIndex();
    return currentSectionIndex < SNAPPED_SECTIONS;
  }

  // Sync index on anchor link clicks
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      const targetId = link.getAttribute('href').substring(1);
      const idx = sections.findIndex(s => s.id === targetId);
      if (idx !== -1) currentSectionIndex = idx;
    });
  });

  window.addEventListener('wheel', (e) => {
    if (window.innerWidth <= 768) return;
    if (!isInSnapZone()) return; // let browser handle it natively
    e.preventDefault();
    if (isScrolling) return;
    if (Math.abs(e.deltaY) < 15) return;

    if (e.deltaY > 0) {
      // Scrolling down into a free section — release native scroll
      if (currentSectionIndex >= SNAPPED_SECTIONS - 1) {
        // Snap to the last snapped section boundary cleanly, then release
        if (currentSectionIndex === SNAPPED_SECTIONS - 1) {
          currentSectionIndex = SNAPPED_SECTIONS;
          scrollToCurrentSection(); // jump to #estudio top, then native takes over
        }
        return;
      }
      currentSectionIndex++;
      scrollToCurrentSection();
    } else if (e.deltaY < 0) {
      if (currentSectionIndex > 0) {
        currentSectionIndex--;
        scrollToCurrentSection();
      }
    }
  }, { passive: false });

  let touchStartY = 0;
  window.addEventListener('touchstart', e => {
    if (window.innerWidth <= 768) return;
    if (!isScrolling) {
      updateCurrentSectionIndex();
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchend', e => {
    if (window.innerWidth <= 768) return;
    if (isScrolling || !isInSnapZone()) return;
    const deltaY = touchStartY - e.changedTouches[0].clientY;
    if (deltaY > 50 && currentSectionIndex < sections.length - 1) {
      currentSectionIndex++;
      scrollToCurrentSection();
    } else if (deltaY < -50 && currentSectionIndex > 0) {
      currentSectionIndex--;
      scrollToCurrentSection();
    }
  }, { passive: true });

  function scrollToCurrentSection() {
    isScrolling = true;
    sections[currentSectionIndex].scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => { isScrolling = false; }, 1100);
  }

  /* --------------------------------
     7. PROJECT MODAL & SLIDER
  -------------------------------- */
  const modal = document.getElementById('projectModal');
  const sliderTrack = id => document.getElementById(id);
  const track = sliderTrack('sliderTrack');
  let currentSlide = 0;
  let totalSlides = 0;

  // Global functions to be accessible from HTML onclick (or attached via JS)
  window.openModal = function(card) {
    const data = card.dataset;
    
    // Fill text content
    document.getElementById('modalTitle').textContent = data.title;
    document.getElementById('modalCategory').textContent = data.category;
    document.getElementById('modalDesc').textContent = data.desc;
    document.getElementById('modalLocation').textContent = data.location;
    document.getElementById('modalYear').textContent = data.year;
    document.getElementById('modalArea').textContent = data.area;

    // Build slider
    track.innerHTML = '';
    const images = data.images.split(',');
    totalSlides = images.length;
    currentSlide = 0;
    
    images.forEach(imgSrc => {
      const slide = document.createElement('div');
      slide.className = 'slider-slide';
      slide.innerHTML = `<img src="${imgSrc.trim()}" alt="${data.title}">`;
      track.appendChild(slide);
    });

    updateSlider();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock scroll
  };

  window.closeModal = function() {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Unlock scroll
  };

  window.nextSlide = function() {
    if (currentSlide < totalSlides - 1) {
      currentSlide++;
      updateSlider();
    } else {
      currentSlide = 0; // Loop to start
      updateSlider();
    }
  };

  window.prevSlide = function() {
    if (currentSlide > 0) {
      currentSlide--;
      updateSlider();
    } else {
      currentSlide = totalSlides - 1; // Loop to end
      updateSlider();
    }
  };

  function updateSlider() {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
  }

  // Attach click listener to cards since I used onclick in HTML template but better logic is card-based
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => window.openModal(card));
  });

  // Close on ESC key
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

});

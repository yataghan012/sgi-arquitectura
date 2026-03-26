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
     3. NAVBAR — ocultar/mostrar en scroll
  -------------------------------- */
  const nav = document.querySelector('nav');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    if (current > 100) {
      nav.style.position = 'fixed';
      nav.style.top = current > lastScroll ? '-100px' : '0';
      nav.style.transition = 'top 0.4s ease';
      nav.style.background = 'rgba(18,18,18,0.9)';
      nav.style.backdropFilter = 'blur(12px)';
      nav.style.padding = '16px 96px';
    } else {
      nav.style.position = 'absolute';
      nav.style.background = 'transparent';
      nav.style.backdropFilter = 'none';
      nav.style.padding = '24px 96px';
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
      cursor.style.top  = mouseY + 'px';
    });

    // Ring lag effect
    function animateRing() {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top  = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover en links y cards
    document.querySelectorAll('a, .project-card, button').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.width  = '12px';
        cursor.style.height = '12px';
        cursorRing.style.width  = '48px';
        cursorRing.style.height = '48px';
        cursorRing.style.opacity = '0.6';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.width  = '8px';
        cursor.style.height = '8px';
        cursorRing.style.width  = '32px';
        cursorRing.style.height = '32px';
        cursorRing.style.opacity = '1';
      });
    });
  }

});

/* ==========================================================
   Festa da Empanada — comportamiento do sitio
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. Menú móbil ---------- */
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      navToggle.setAttribute('aria-label', isOpen ? 'Pechar menú' : 'Abrir menú');
    });

    // Pechar o menú móbil ao seleccionar unha ligazón (agás o acordeón "Empanada")
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Abrir menú');
      });
    });
  }

  /* ---------- 1b. Desplegable "Empanada" (escritorio) ---------- */
  document.querySelectorAll('.has-dropdown').forEach(wrap => {
    const toggle = wrap.querySelector('.dropdown-toggle');
    const menu = wrap.querySelector('.dropdown-menu');
    if (!toggle || !menu) return;

    const closeDropdown = () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    };
    const openDropdown = () => {
      menu.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
    };

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menu.classList.contains('open');
      document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
      document.querySelectorAll('.dropdown-toggle[aria-expanded="true"]').forEach(t => t.setAttribute('aria-expanded', 'false'));
      if (!isOpen) openDropdown(); else closeDropdown();
    });

    // Pechar ao facer click nunha opción
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDropdown));
  });

  // Pechar calquera desplegable ao facer click fóra ou premer Escape
  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
    document.querySelectorAll('.dropdown-toggle[aria-expanded="true"]').forEach(t => t.setAttribute('aria-expanded', 'false'));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
      document.querySelectorAll('.dropdown-toggle[aria-expanded="true"]').forEach(t => t.setAttribute('aria-expanded', 'false'));
    }
  });

  /* ---------- 1c. Acordeóns móbiles (Empanada, Empanada Fest...) ---------- */
  document.querySelectorAll('.mobile-dropdown-toggle').forEach(toggle => {
    const submenu = toggle.nextElementSibling;
    if (!submenu || !submenu.classList.contains('mobile-submenu')) return;
    toggle.addEventListener('click', () => {
      const isOpen = submenu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });

  /* ---------- 1d. Pestañas de días (Programación) ---------- */
  const dayTabs = document.querySelectorAll('.day-tabs button');
  if (dayTabs.length) {
    dayTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-day');
        dayTabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.day-panel').forEach(p => {
          p.classList.toggle('active', p.getAttribute('data-day') === target);
        });
      });
    });
  }

  /* ---------- 2. Cabeceira con sombra ao facer scroll ---------- */
  const header = document.getElementById('site-header');
  if (header) {
    const updateHeader = () => {
      header.classList.toggle('scrolled', window.scrollY > 12);
    };
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  /* ---------- 3. Animación de aparición ao facer scroll ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

      revealEls.forEach(el => io.observe(el));
    } else {
      // Fallback: sen soporte para IntersectionObserver, amosar todo
      revealEls.forEach(el => el.classList.add('is-visible'));
    }
  }

  /* ---------- 4. Vídeo: cargar YouTube só ao facer click ---------- */
  const videoFrame = document.getElementById('videoFrame');
  if (videoFrame) {
    const playVideo = () => {
      const videoId = videoFrame.getAttribute('data-video-id');
      if (!videoId) return;
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
      iframe.title = 'A Festa da Empanada en 3 minutos';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      videoFrame.innerHTML = '';
      videoFrame.appendChild(iframe);
      videoFrame.removeAttribute('role');
      videoFrame.removeAttribute('tabindex');
    };

    videoFrame.addEventListener('click', playVideo);
    videoFrame.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        playVideo();
      }
    });
  }

  /* ---------- 5. Ano automático no copyright (opcional, xa fixo en HTML) ---------- */
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ---------- 6. Carrusel de fotos automático ---------- */
  document.querySelectorAll('.carousel').forEach((carousel) => {
    const slides = carousel.querySelectorAll('.carousel-slide');
    const dots = carousel.querySelectorAll('.carousel-dots button');
    if (slides.length < 2) return;

    let current = 0;
    const interval = parseInt(carousel.getAttribute('data-interval'), 10) || 4500;
    let timer;

    const goTo = (index) => {
      slides[current].classList.remove('active');
      if (dots[current]) dots[current].classList.remove('active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('active');
      if (dots[current]) dots[current].classList.add('active');
    };

    const start = () => { timer = setInterval(() => goTo(current + 1), interval); };
    const stop = () => clearInterval(timer);

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        goTo(i);
        stop();
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);

    start();
  });

});
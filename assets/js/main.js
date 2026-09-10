/**
 * ==========================================================================
 * MAIN SCRIPT: NAVEGACIÓN, TEMAS Y MICRO-INTERACCIONES REALISTAS
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. GESTIÓN DE TEMA (CLARO / OSCURO)
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('xr_food_theme') || (prefersDark ? 'dark' : 'light');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('xr_food_theme', theme);
    const themeLabel = document.getElementById('current-theme-name');
    if (themeLabel) {
      themeLabel.textContent = theme === 'dark' ? 'Modo Oscuro' : 'Modo Claro';
    }
  }

  // Aplicar tema inicial
  applyTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  }

  // 2. MENÚ LATERAL IZQUIERDO Y NAVEGACIÓN ACTIVA
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
  const sections = document.querySelectorAll('section[id]');
  const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
  const sidebar = document.querySelector('.sidebar');

  // Toggle móvil
  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });

    // Cerrar sidebar al hacer clic en un enlace en móvil
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 860) {
          sidebar.classList.remove('mobile-open');
        }
      });
    });
  }

  // IntersectionObserver para resaltar la sección visible
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const currentId = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${currentId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

  // 3. EFECTO RIPPLE (MICRO-ANIMACIÓN REALISTA EN BOTONES)
  const interactiveButtons = document.querySelectorAll('.btn, .btn-preset');

  interactiveButtons.forEach(button => {
    button.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      const existingRipple = this.querySelector('.ripple');
      if (existingRipple) {
        existingRipple.remove();
      }

      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  // 4. FILTRO / HIGHLIGHT INTERACTIVO DE TECNOLOGÍAS (RA, RV, RM)
  const techCards = document.querySelectorAll('.xr-card');
  techCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      techCards.forEach(c => {
        if (c !== card) c.style.opacity = '0.65';
      });
    });
    card.addEventListener('mouseleave', () => {
      techCards.forEach(c => c.style.opacity = '1');
    });
  });
});

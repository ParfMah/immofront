// ============================================================
// LOADER.JS — Hamburger corrigé + Loader + Animations
// ✅ Le menu mobile s'ouvre et se ferme correctement
// ============================================================

// ========== LOADER ==========
const Loader = (() => {
  const hide = () => {
    const el = document.getElementById('page-loader');
    if (el) el.classList.add('hidden');
  };
  const show = () => {
    const el = document.getElementById('page-loader');
    if (el) el.classList.remove('hidden');
  };
  const init = () => {
    if (document.readyState === 'complete') {
      setTimeout(hide, 250);
    } else {
      window.addEventListener('load', () => setTimeout(hide, 250));
    }
    // Afficher loader à chaque navigation interne
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href) return;
      if (
        href.startsWith('#') ||
        href.startsWith('javascript') ||
        href.startsWith('mailto') ||
        href.startsWith('tel') ||
        href.startsWith('http') ||
        link.target === '_blank' ||
        e.metaKey || e.ctrlKey || e.shiftKey
      ) return;
      e.preventDefault();
      show();
      setTimeout(() => { window.location.href = href; }, 120);
    });
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) hide();
    });
  };
  return { init, show, hide };
})();

// ========== HAMBURGER — VERSION CORRIGÉE ========== 
const MobileMenu = (() => {
  let isOpen = false;

  const getElements = () => ({
    hamburger: document.getElementById('hamburger'),
    nav: document.getElementById('mobileNav'),
  });

  const open = () => {
    const { hamburger, nav } = getElements();
    if (!hamburger || !nav) return;
    isOpen = true;
    hamburger.classList.add('open');
    nav.classList.add('open');
    document.body.style.overflow = 'hidden';
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Fermer le menu');
  };

  const close = () => {
    const { hamburger, nav } = getElements();
    if (!hamburger || !nav) return;
    isOpen = false;
    hamburger.classList.remove('open');
    nav.classList.remove('open');
    document.body.style.overflow = '';
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Ouvrir le menu');
  };

  const toggle = () => isOpen ? close() : open();

  const init = () => {
    const { hamburger, nav } = getElements();

    if (!hamburger) {
      console.warn('[MobileMenu] #hamburger introuvable');
      return;
    }
    if (!nav) {
      console.warn('[MobileMenu] #mobileNav introuvable');
      return;
    }

    // ✅ Clic sur hamburger
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle();
    });

    // ✅ Clic sur les liens du menu → fermer
    nav.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        // Fermer visuellement avant la navigation
        close();
      });
    });

    // ✅ Clic sur les boutons d'action dans le menu
    nav.querySelectorAll('.mobile-nav-actions a, .mobile-nav-actions button').forEach(el => {
      el.addEventListener('click', () => close());
    });

    // ✅ Touche Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) close();
    });

    // ✅ Clic en dehors du menu (sur l'overlay)
    nav.addEventListener('click', (e) => {
      // Fermer si clic direct sur le fond (pas sur les liens)
      if (e.target === nav) close();
    });

    // ✅ Redimensionnement → fermer si écran large
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && isOpen) close();
    });

    console.log('[MobileMenu] ✅ Initialisé');
  };

  return { init, open, close, toggle };
})();

// ========== HEADER SCROLL ==========
const HeaderScroll = (() => {
  const init = () => {
    const header = document.getElementById('siteHeader');
    if (!header) return;
    const update = () => header.classList.toggle('scrolled', window.scrollY > 30);
    update();
    window.addEventListener('scroll', update, { passive: true });
  };
  return { init };
})();

// ========== LIENS ACTIFS ==========
const NavActive = (() => {
  const init = () => {
    const currentPath = window.location.pathname;
    const currentFile = currentPath.split('/').pop().split('?')[0] || 'index.html';

    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
      const href = (link.getAttribute('href') || '').split('?')[0];
      const linkFile = href.split('/').pop() || 'index.html';

      if (!href) return;

      const isHome = (href === '/' || href === './index.html' || href === '../index.html' || linkFile === 'index.html');
      const isCurrentHome = (currentFile === '' || currentFile === 'index.html');

      if (isHome && isCurrentHome) {
        link.classList.add('active');
      } else if (!isHome && linkFile && linkFile === currentFile) {
        link.classList.add('active');
      }
    });
  };
  return { init };
})();

// ========== ANIMATIONS AU SCROLL ==========
const ScrollAnimations = (() => {
  const init = () => {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.anim-on-scroll').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
      observer.observe(el);
    });
  };
  return { init };
})();

// ========== TOAST ==========
const Toast = {
  show(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = `
        position:fixed; top:calc(var(--header-h,72px) + 12px); right:16px;
        z-index:99990; display:flex; flex-direction:column; gap:10px;
        max-width:min(360px,calc(100vw - 32px));
      `;
      document.body.appendChild(container);
    }
    const colors = {
      success: { bg:'rgba(34,197,94,0.12)',  c:'#22c55e', b:'rgba(34,197,94,0.2)' },
      error:   { bg:'rgba(239,68,68,0.12)',  c:'#fc8181', b:'rgba(239,68,68,0.2)' },
      warning: { bg:'rgba(245,158,11,0.12)', c:'#f59e0b', b:'rgba(245,158,11,0.2)' },
      info:    { bg:'rgba(96,165,250,0.12)', c:'#60a5fa', b:'rgba(96,165,250,0.2)' },
    };
    const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
    const col = colors[type] || colors.info;
    const toast = document.createElement('div');
    toast.style.cssText = `
      background:${col.bg}; color:${col.c}; border:1px solid ${col.b};
      padding:13px 16px; border-radius:12px; font-size:14px; font-weight:500;
      backdrop-filter:blur(20px); display:flex; align-items:center; gap:10px;
      box-shadow:0 8px 30px rgba(0,0,0,0.4); cursor:pointer;
      font-family:'DM Sans',sans-serif;
    `;
    toast.innerHTML = `<span>${icons[type]}</span><span style="flex:1">${message}</span><span style="opacity:0.5;font-size:18px;line-height:1;">×</span>`;
    toast.addEventListener('click', () => toast.remove());
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = '0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

// ========== CONFIRM ==========
const Confirm = async (title, message, confirmText = 'Confirmer', danger = false) => {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:99995;
      display:flex; align-items:center; justify-content:center; padding:20px;
      backdrop-filter:blur(8px);
    `;
    overlay.innerHTML = `
      <div style="
        background:#141428; border:1px solid rgba(255,255,255,0.08);
        border-radius:20px; padding:32px; max-width:min(400px,calc(100vw - 40px));
        width:100%; box-shadow:0 30px 80px rgba(0,0,0,0.6);
        font-family:'DM Sans',sans-serif;
      ">
        <h3 style="font-size:18px;font-weight:700;margin-bottom:12px;color:#eeeef5;">${title}</h3>
        <p style="color:#9898b8;font-size:14px;line-height:1.6;margin-bottom:24px;">${message}</p>
        <div style="display:flex;gap:12px;justify-content:flex-end;flex-wrap:wrap;">
          <button id="_cancelBtn" style="padding:10px 20px;border-radius:50px;border:1px solid rgba(255,255,255,0.08);background:transparent;cursor:pointer;font-size:14px;font-weight:600;color:#9898b8;font-family:inherit;">Annuler</button>
          <button id="_okBtn" style="padding:10px 20px;border-radius:50px;border:none;cursor:pointer;font-size:14px;font-weight:700;font-family:inherit;background:${danger?'#ef4444':'linear-gradient(135deg,#c9a96e,#a07840)'};color:${danger?'white':'#080810'};">${confirmText}</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#_cancelBtn').onclick = () => { overlay.remove(); resolve(false); };
    overlay.querySelector('#_okBtn').onclick     = () => { overlay.remove(); resolve(true);  };
    overlay.addEventListener('click', (e) => { if (e.target === overlay) { overlay.remove(); resolve(false); } });
  });
};

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
  Loader.init();
  MobileMenu.init();
  HeaderScroll.init();
  NavActive.init();
  ScrollAnimations.init();
});

window.Loader  = Loader;
window.Toast   = Toast;
window.Confirm = Confirm;
window.MobileMenu = MobileMenu;

// Client-side admin page gate. Real authorization remains enforced by every admin API.
(async () => {
  try {
    await api('admin-stats');
  } catch (e) {
    location.replace('/admin/login.html');
  }
})();

// Shared Admin Mobile Navigation & Interaction System
function initAdminNav() {
  const toggleBtn = document.getElementById('adminMobileNavToggle');
  const menuPanel = document.getElementById('adminMobileNavPanel');
  const mobileLogoutBtn = document.getElementById('mobileLogoutLink');

  if (toggleBtn && menuPanel) {
    const toggleMenu = (open) => {
      const isOpen = open !== undefined ? open : !menuPanel.classList.contains('open');
      menuPanel.classList.toggle('open', isOpen);
      toggleBtn.classList.toggle('is-open', isOpen);
      toggleBtn.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    document.addEventListener('click', (e) => {
      if (menuPanel.classList.contains('open') && !menuPanel.contains(e.target) && !toggleBtn.contains(e.target)) {
        toggleMenu(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuPanel.classList.contains('open')) {
        toggleMenu(false);
        toggleBtn.focus();
      }
    });

    menuPanel.querySelectorAll('a:not(#mobileLogoutLink)').forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });
  }

  if (mobileLogoutBtn) {
    mobileLogoutBtn.onclick = async (e) => {
      e.preventDefault();
      try { await api('admin-logout', { method: 'POST' }); } catch (_) {}
      location.href = '/admin/login.html';
    };
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdminNav);
} else {
  initAdminNav();
}

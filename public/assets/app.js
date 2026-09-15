// أدوات مشتركة لكل الصفحات الثابتة.
async function api(path, options = {}) {
  const res = await fetch('/api/' + path, {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  let data = {};
  try { data = await res.json(); } catch { /* no json body */ }
  if (!res.ok) throw Object.assign(new Error(data.error || res.statusText), { status: res.status, data });
  return data;
}

function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-copy]');
  if (b) {
    navigator.clipboard?.writeText(b.dataset.copy);
    b.textContent = 'Copied';
  }
});

function startTimer(el, seconds, onEnd) {
  const end = Date.now() + seconds * 1000;
  const tick = () => {
    const n = Math.max(0, Math.ceil((end - Date.now()) / 1000));
    el.textContent = String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');
    if (n) requestAnimationFrame(tick); else onEnd?.();
  };
  tick();
}


// Responsive TELC Voll navigation: compact mobile controls + vertical menu.
function initMobileHeader() {
  const top = document.querySelector('.top:not(.admin-nav)');
  if (!top || top.dataset.mobileReady === '1') return;
  const nav = top.querySelector('nav');
  if (!nav) return;
  top.dataset.mobileReady = '1';
  const actions = top.querySelector('.header-actions');

  const menuBtn = document.createElement('button');
  menuBtn.type = 'button';
  menuBtn.className = 'icon-btn mobile-menu-toggle';
  menuBtn.setAttribute('aria-label', 'فتح القائمة');
  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>';

  const panel = document.createElement('div');
  panel.className = 'mobile-menu-panel';
  panel.setAttribute('aria-hidden', 'true');

  [...nav.children].forEach((node) => {
    if (node.classList?.contains('header-actions')) return;
    if (node.classList?.contains('btn') && top.classList.contains('landing-top')) return;
    const clone = node.cloneNode(true);
    clone.removeAttribute('id');
    if (node.id === 'logoutLink' || node.id === 'logout') {
      clone.addEventListener('click', (e) => { e.preventDefault(); node.click(); closeMenu(); });
    } else {
      clone.addEventListener('click', closeMenu);
    }
    panel.appendChild(clone);
  });

  function closeMenu() {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
  function toggleMenu() {
    const open = !panel.classList.contains('open');
    panel.classList.toggle('open', open);
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    menuBtn.setAttribute('aria-expanded', String(open));
  }
  menuBtn.addEventListener('click', toggleMenu);
  document.addEventListener('click', (e) => {
    if (!top.contains(e.target) && !panel.contains(e.target)) closeMenu();
  });

  // Landing page keeps the main login action visible as a dedicated mobile icon.
  if (top.classList.contains('landing-top')) {
    const login = nav.querySelector('a.btn');
    if (login) {
      const loginBtn = document.createElement('a');
      loginBtn.className = 'icon-btn mobile-login';
      loginBtn.href = login.getAttribute('href') || '#access';
      loginBtn.setAttribute('aria-label', login.textContent.trim() || 'الدخول');
      loginBtn.title = login.textContent.trim() || 'الدخول';
      loginBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17l5-5-5-5"></path><path d="M15 12H3"></path><path d="M21 19V5a2 2 0 0 0-2-2h-6"></path></svg>';
      top.insertBefore(loginBtn, actions || nav);
    }
  }

  top.insertBefore(menuBtn, actions || nav);
  top.appendChild(panel);
  applyI18n(panel);
  document.addEventListener('langchange', () => applyI18n(panel));
}

document.addEventListener('DOMContentLoaded', initMobileHeader);

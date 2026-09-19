// أدوات مشتركة لكل الصفحات الثابتة.
async function api(path, options = {}) {
  const token = localStorage.getItem('telc_student_token') || localStorage.getItem('telc_admin_token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token && !headers['Authorization']) {
    headers['Authorization'] = 'Bearer ' + token;
  }
  const controller = new AbortController();
  const timeoutMs = options.timeout || 12000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch('/api/' + path, {
      method: options.method || 'GET',
      headers,
      credentials: 'include',
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: options.signal || controller.signal,
    });
    clearTimeout(timeoutId);
    let data = {};
    try { data = await res.json(); } catch { /* no json body */ }
    if (!res.ok) throw Object.assign(new Error(data.error || res.statusText), { status: res.status, data });
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const isDe = typeof getLang === 'function' && getLang() === 'de';
      throw Object.assign(new Error(isDe ? 'Zeitüberschreitung der Anfrage. Bitte erneut versuchen.' : 'استغرق الطلب وقتاً طويلاً. يرجى إعادة المحاولة.'), { status: 408 });
    }
    throw err;
  }
}

function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

window.text = window.text || function(ar, de) {
  return (typeof getLang === 'function' && getLang() === 'de') ? de : ar;
};

window.sectionIcon = window.sectionIcon || function(s) {
  const icons = {
    Lesen: '📖',
    Hören: '🎧',
    Sprachbausteine: '🧩',
    Schreiben: '✍️',
    Sprechen: '🎙️'
  };
  return icons[s] || '📄';
};

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-copy]');
  if (b) {
    navigator.clipboard?.writeText(b.dataset.copy);
    b.textContent = 'Copied';
  }
});



// Local exercise completion marker — cookie only, no database dependency.
const TELC_COMPLETED_COOKIE = 'telc_completed_v1';
const TELC_COMPLETED_MAX = 180;
function telcExerciseHash(value) {
  // Compact deterministic 64-bit FNV-1a hash for keeping the cookie small.
  let h = 1469598103934665603n;
  for (const ch of String(value ?? '')) {
    h ^= BigInt(ch.codePointAt(0));
    h = BigInt.asUintN(64, h * 1099511628211n);
  }
  return h.toString(16).padStart(16, '0');
}
function getCompletedExerciseHashes() {
  try {
    const m = document.cookie.match(/(?:^|;\s*)telc_completed_v1=([^;]*)/);
    if (!m) return new Set();
    return new Set(decodeURIComponent(m[1]).split(',').filter(Boolean));
  } catch { return new Set(); }
}
function isExerciseCompleted(exerciseId) {
  return getCompletedExerciseHashes().has(telcExerciseHash(exerciseId));
}
function markExerciseCompleted(exerciseId) {
  if (!exerciseId) return;
  const set = getCompletedExerciseHashes();
  const hash = telcExerciseHash(exerciseId);
  set.delete(hash);
  set.add(hash);
  const values = [...set].slice(-TELC_COMPLETED_MAX);
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${TELC_COMPLETED_COOKIE}=${encodeURIComponent(values.join(','))}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
}

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

// Responsive administration navigation: same TELC Voll identity on desktop/mobile.
function initAdminHeader() {
  const top = document.querySelector('.top.admin-nav');
  if (!top || top.dataset.adminReady === '1') return;
  top.dataset.adminReady = '1';
  const nav = top.querySelector('nav');
  if (!nav) return;

  const menuBtn = document.createElement('button');
  menuBtn.type = 'button';
  menuBtn.className = 'admin-mobile-toggle';
  menuBtn.setAttribute('aria-label', 'فتح قائمة الإدارة');
  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.innerHTML = '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>';

  const panel = document.createElement('div');
  panel.className = 'admin-mobile-menu';
  panel.setAttribute('aria-hidden', 'true');
  [...nav.children].forEach((node) => {
    if (node.classList?.contains('header-actions')) return;
    const clone = node.cloneNode(true);
    clone.removeAttribute('id');
    if (node.id === 'logoutLink') clone.addEventListener('click', (e) => { e.preventDefault(); node.click(); closeMenu(); });
    else clone.addEventListener('click', closeMenu);
    panel.appendChild(clone);
  });

  function closeMenu(){ panel.classList.remove('open'); panel.setAttribute('aria-hidden','true'); menuBtn.setAttribute('aria-expanded','false'); }
  function toggleMenu(){ const open=!panel.classList.contains('open'); panel.classList.toggle('open',open); panel.setAttribute('aria-hidden',String(!open)); menuBtn.setAttribute('aria-expanded',String(open)); }
  menuBtn.addEventListener('click', toggleMenu);
  document.addEventListener('click',(e)=>{ if(!top.contains(e.target) && !panel.contains(e.target)) closeMenu(); });

  const actions = top.querySelector('.header-actions');
  top.insertBefore(menuBtn, actions || null);
  top.appendChild(panel);
}

document.addEventListener('DOMContentLoaded', initAdminHeader);

function initAdminLoginTools() {
  if (!document.body?.classList.contains('admin-shell') || document.querySelector('.admin-nav') || document.querySelector('.admin-login-tools')) return;
  const wrap=document.createElement('div');
  wrap.className='admin-login-tools';
  const lang=document.createElement('button');
  lang.type='button'; lang.className='icon-btn'; lang.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18"></path><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"></path></svg>';
  lang.title='تغيير اللغة'; lang.setAttribute('aria-label','تغيير اللغة');
  lang.onclick=()=>{ if(typeof setLang==='function') setLang(getLang()==='ar'?'de':'ar'); };
  const theme=document.createElement('button');
  theme.type='button'; theme.className='icon-btn'; theme.id='adminLoginThemeBtn';
  theme.onclick=()=>{ if(typeof setTheme==='function') setTheme(getTheme()==='dark'?'light':'dark'); };
  wrap.append(lang,theme); document.body.appendChild(wrap);
  if(typeof applyTheme==='function') applyTheme();
}

document.addEventListener('DOMContentLoaded', initAdminLoginTools);



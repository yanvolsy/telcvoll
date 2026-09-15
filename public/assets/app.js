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

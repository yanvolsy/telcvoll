// Admin Mode overlay — same learner UI, extra controls on top, admin-only.
// Students never see any of this: everything here is gated by /api/session.
(function () {
  const params = new URLSearchParams(location.search);
  const isPreview = params.get('preview') === '1';

  async function getRole() {
    try {
      const res = await fetch('/api/session', { credentials: 'same-origin' });
      const data = await res.json();
      return data.role;
    } catch {
      return null;
    }
  }

  function css() {
    const style = document.createElement('style');
    style.textContent = `
      #adminBar{position:sticky;top:0;z-index:9999;background:#0F1B1A;color:#F5F7F6;
        font:13px/1.4 'Inter','Cairo',system-ui,sans-serif;display:flex;flex-wrap:wrap;align-items:center;
        gap:10px;padding:8px 16px;direction:rtl;border-bottom:1px solid #223634}
      #adminBar b{color:#FF7A2F;letter-spacing:.5px;font-weight:900}
      #adminBar a{color:#F5F7F6;text-decoration:none;padding:5px 11px;border-radius:8px;background:#172624;border:1px solid #233734;font-weight:600;transition:all .15s}
      #adminBar a:hover{background:#FF7A2F;color:#fff;border-color:#FF7A2F}
      #adminTopicBar{background:#FDE9DC;border:1px solid rgba(255,122,47,.25);border-radius:12px;
        margin:14px 0;padding:12px 16px;font:13px/1.5 'Cairo',system-ui,sans-serif;direction:rtl}
      #adminTopicBar .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
      #adminTopicBar button,#adminTopicBar a.btn-a{cursor:pointer;border:0;border-radius:8px;
        padding:7px 14px;font-size:13px;font-weight:800;background:#FF7A2F;color:#fff;transition:all .15s}
      #adminTopicBar button:hover,#adminTopicBar a.btn-a:hover{background:#E56317}
      #adminTopicBar button.danger{background:#D93829}
      #adminTopicBar button.secondary{background:#5E6E6A}
      #adminTopicBar .meta{color:#0F1B1A;margin-inline-end:auto;font-weight:700}
      #adminPreviewFlag{position:fixed;bottom:14px;inset-inline-end:14px;z-index:9999;
        background:#FF7A2F;color:#fff;padding:7px 14px;border-radius:999px;font:12px 'Inter','Cairo',sans-serif;font-weight:800;box-shadow:0 6px 18px rgba(255,122,47,.35)}
    `;
    document.head.appendChild(style);
  }

  function renderTopBar() {
    const bar = document.createElement('div');
    bar.id = 'adminBar';
    bar.innerHTML = `
      <b>ADMIN</b>
      <a href="/admin/content.html">Content Management</a>
      <a href="/admin/code-generator.html">Code Generator</a>
      <a href="/admin/codes.html">Codes</a>
      <a href="/admin/students.html">Users</a>
      <a href="/admin/statistics.html">Analytics</a>
      <a href="/admin/settings.html">Settings</a>
      <a href="/admin/index.html">Weitere Tools</a>
      <a href="${location.pathname}${location.search ? location.search + '&' : '?'}preview=1">Vorschau als Schüler</a>
      <a href="#" id="adminBarLogout" style="margin-inline-start:auto">Abmelden</a>
    `;
    document.body.prepend(bar);
    document.getElementById('adminBarLogout').onclick = async (e) => {
      e.preventDefault();
      await fetch('/api/admin-logout', { method: 'POST', credentials: 'same-origin' });
      location.href = '/admin/login.html';
    };
  }

  function renderPreviewFlag() {
    const flag = document.createElement('div');
    flag.id = 'adminPreviewFlag';
    flag.textContent = 'Vorschau als Schüler';
    document.body.appendChild(flag);
    const back = document.createElement('a');
    back.href = location.pathname;
    back.textContent = ' · Admin-Modus verlassen';
    back.style.marginInlineStart = '6px';
    back.style.color = '#1c1f26';
    flag.appendChild(back);
  }

  // Per-topic toolbar: looked for a host element the page marks with
  // data-admin-topic="<exercise_id>" right where the toolbar should render.
  async function renderTopicToolbar(host) {
    const id = host.dataset.adminTopic;
    if (!id) return;
    let exercise;
    try {
      const res = await fetch(`/api/admin-topic?id=${id}`, { credentials: 'same-origin' });
      if (!res.ok) return;
      ({ exercise } = await res.json());
    } catch { return; }
    if (!exercise) return;

    const box = document.createElement('div');
    box.id = 'adminTopicBar';
    box.innerHTML = `
      <div class="row">
        <span class="meta">Status: <b>${exercise.status === 'published' ? 'Veröffentlicht' : 'Entwurf'}</b>
          · Zugriff: ${exercise.access_mode === 'free' ? 'Frei' : 'Code erforderlich'}
          · Niveau: ${exercise.level} · Bereich: ${exercise.section}</span>
        <a class="btn-a" href="/admin/content.html?id=${id}">Bearbeiten</a>
        <button data-act="duplicate">Duplizieren</button>
        <button data-act="publish">${exercise.status === 'published' ? 'Zurückziehen' : 'Veröffentlichen'}</button>
        <button data-act="delete" class="danger">Löschen</button>
      </div>`;
    host.replaceWith(box);

    box.querySelector('[data-act="duplicate"]').onclick = async () => {
      const r = await fetch('/api/admin-topic', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'duplicate', id }),
      });
      const d = await r.json();
      if (d.ok) location.href = `/admin/content.html?id=${d.id}`;
    };
    box.querySelector('[data-act="publish"]').onclick = async () => {
      await fetch('/api/admin-topic', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: exercise.status === 'published' ? 'unpublish' : 'publish', id }),
      });
      location.reload();
    };
    box.querySelector('[data-act="delete"]').onclick = async () => {
      if (!confirm('Dieses Thema wirklich löschen?')) return;
      await fetch('/api/admin-topic', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });
      location.href = '/dashboard.html';
    };
  }

  let isAdmin = null;

  function scanTopicToolbars() {
    if (!isAdmin || isPreview) return;
    document.querySelectorAll('[data-admin-topic]').forEach(renderTopicToolbar);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const role = await getRole();
    isAdmin = role === 'admin';
    if (!isAdmin) return; // students see nothing — always.

    css();
    if (isPreview) {
      renderPreviewFlag();
      return; // exact learner experience, no admin controls at all.
    }
    renderTopBar();
    scanTopicToolbars();
    document.dispatchEvent(new CustomEvent('admin-mode-ready'));
  });

  // Pages that build their content asynchronously (fetch then innerHTML)
  // dispatch this once their DOM is in place, so the per-topic toolbar can
  // attach to elements that didn't exist at DOMContentLoaded time.
  document.addEventListener('admin-bar:refresh', scanTopicToolbars);
})();

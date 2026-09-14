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
      #adminBar{position:sticky;top:0;z-index:9999;background:#1c1f26;color:#f4f4f4;
        font:13px/1.4 system-ui,sans-serif;display:flex;flex-wrap:wrap;align-items:center;
        gap:10px;padding:8px 14px;direction:rtl}
      #adminBar b{color:#ffce54;letter-spacing:.5px}
      #adminBar a{color:#f4f4f4;text-decoration:none;padding:4px 9px;border-radius:6px;background:#33384a}
      #adminBar a:hover{background:#454b63}
      #adminTopicBar{background:#eef7f0;border:1px solid #bfe3c9;border-radius:10px;
        margin:14px 0;padding:10px 14px;font:13px/1.5 system-ui,sans-serif;direction:rtl}
      #adminTopicBar .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
      #adminTopicBar button,#adminTopicBar a.btn-a{cursor:pointer;border:0;border-radius:6px;
        padding:6px 12px;font-size:13px;background:#0b7f52;color:#fff}
      #adminTopicBar button.danger{background:#c0392b}
      #adminTopicBar button.secondary{background:#5a6472}
      #adminTopicBar .meta{color:#40514a;margin-inline-end:auto}
      #adminPreviewFlag{position:fixed;bottom:12px;inset-inline-end:12px;z-index:9999;
        background:#ffce54;color:#1c1f26;padding:6px 12px;border-radius:20px;font:12px system-ui,sans-serif}
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

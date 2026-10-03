function header(event, name) {
  const h = event.headers || {};
  const key = Object.keys(h).find(k => k.toLowerCase() === name.toLowerCase());
  return key ? String(h[key] || '') : '';
}

function allowedOrigins() {
  const set = new Set([
    'https://telcvoll.de',
    'https://www.telcvoll.de',
    'https://telcvoll.app',
    'https://www.telcvoll.app',
    'http://localhost:8888',
    'http://127.0.0.1:8888',
  ]);
  const configured = String(process.env.SITE_ORIGIN || '').trim();
  if (configured) {
    configured.split(',').map(s => s.trim()).filter(Boolean).forEach(o => set.add(o.replace(/\/+$/, '')));
  }
  return set;
}

// Browser state-changing requests must originate from an explicitly trusted
// origin. Never trust arbitrary Host/X-Forwarded-Host or wildcard *.netlify.app
// origins because an unrelated site can otherwise become a CSRF origin.
function requireSameOrigin(event) {
  const method = String(event.httpMethod || 'GET').toUpperCase();
  const unsafe = !['GET', 'HEAD', 'OPTIONS'].includes(method);
  if (!unsafe) return true;

  const fetchSite = header(event, 'sec-fetch-site').trim().toLowerCase();
  if (fetchSite === 'cross-site') return false;

  const origin = header(event, 'origin').trim().replace(/\/+$/, '');
  if (!origin || origin === 'null') {
    // Non-browser/server-to-server clients do not send Origin. Authentication
    // and endpoint-specific authorization still remain mandatory.
    return true;
  }

  return allowedOrigins().has(origin);
}

function requestSize(event, maxBytes = 1024 * 1024) {
  const raw = header(event, 'content-length');
  const n = Number(raw);
  if (Number.isFinite(n)) return n <= maxBytes;
  const body = event && typeof event.body === 'string' ? event.body : '';
  return Buffer.byteLength(body, 'utf8') <= maxBytes;
}

module.exports = { header, requireSameOrigin, requestSize };

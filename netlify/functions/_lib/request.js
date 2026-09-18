function header(event, name) {
  const h = event.headers || {};
  const key = Object.keys(h).find(k => k.toLowerCase() === name.toLowerCase());
  return key ? String(h[key] || '') : '';
}

function allowedOrigins(event) {
  const configured = String(process.env.SITE_ORIGIN || '').trim();
  if (configured) return configured.split(',').map(s => s.trim()).filter(Boolean);
  const host = header(event, 'host');
  const proto = header(event, 'x-forwarded-proto') || 'https';
  return host ? [`${proto.split(',')[0].trim()}://${host}`] : [];
}

// Browser POST/PUT/PATCH/DELETE requests carry Origin. Reject an explicitly
// cross-site origin while allowing non-browser/server-to-server calls where
// Origin is absent. This adds a CSRF barrier without requiring a readable token.
function requireSameOrigin(event) {
  const origin = header(event, 'origin').trim();
  if (!origin) return true;
  return allowedOrigins(event).includes(origin);
}

function requestSize(event, maxBytes = 1024 * 1024) {
  const n = Number(header(event, 'content-length'));
  return !Number.isFinite(n) || n <= maxBytes;
}

module.exports = { header, requireSameOrigin, requestSize };

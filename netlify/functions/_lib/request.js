function header(event, name) {
  const h = event.headers || {};
  const key = Object.keys(h).find(k => k.toLowerCase() === name.toLowerCase());
  return key ? String(h[key] || '') : '';
}

function allowedOrigins(event) {
  const set = new Set();
  const configured = String(process.env.SITE_ORIGIN || '').trim();
  if (configured) {
    configured.split(',').map(s => s.trim()).filter(Boolean).forEach(o => set.add(o.replace(/\/+$/, '')));
  }
  // Known official domains
  set.add('https://telcvoll.de');
  set.add('http://telcvoll.de');
  set.add('https://www.telcvoll.de');
  set.add('http://www.telcvoll.de');
  set.add('https://telcvoll.app');
  set.add('http://telcvoll.app');
  set.add('https://www.telcvoll.app');
  set.add('http://www.telcvoll.app');

  const host = header(event, 'host').trim();
  if (host) {
    set.add(`https://${host}`);
    set.add(`http://${host}`);
  }
  const xForwardedHost = header(event, 'x-forwarded-host').trim();
  if (xForwardedHost) {
    set.add(`https://${xForwardedHost}`);
    set.add(`http://${xForwardedHost}`);
  }
  return [...set];
}

// Browser POST/PUT/PATCH/DELETE requests carry Origin. Reject an explicitly
// cross-site origin while allowing legitimate project origins and non-browser calls.
function requireSameOrigin(event) {
  const origin = header(event, 'origin').trim().replace(/\/+$/, '');
  if (!origin || origin === 'null') return true;
  const origins = allowedOrigins(event);
  if (origins.includes(origin)) return true;

  try {
    const originUrl = new URL(origin);
    const originHost = originUrl.hostname.toLowerCase();
    const reqHost = (header(event, 'host') || '').split(':')[0].toLowerCase();
    if (reqHost && (originHost === reqHost || originHost.endsWith('.' + reqHost) || reqHost.endsWith('.' + originHost))) {
      return true;
    }
    if (originHost === 'telcvoll.de' || originHost === 'www.telcvoll.de' ||
        originHost === 'telcvoll.app' || originHost === 'www.telcvoll.app' ||
        originHost.endsWith('.netlify.app') || originHost === 'localhost' || originHost === '127.0.0.1') {
      return true;
    }
  } catch (_) {}

  return false;
}

function requestSize(event, maxBytes = 1024 * 1024) {
  const n = Number(header(event, 'content-length'));
  return !Number.isFinite(n) || n <= maxBytes;
}

module.exports = { header, requireSameOrigin, requestSize };


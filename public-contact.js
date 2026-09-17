const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');

const DEFAULTS = [
  { id: 'facebook', label: 'Facebook', value: 'TELC Voll', url: 'https://www.facebook.com/TELCVoll', icon: 'facebook', active: true },
  { id: 'messenger', label: 'Messenger', value: 'TELC Voll', url: 'https://m.me/TELCVoll', icon: 'messenger', active: true },
];

exports.handler = async () => {
  try {
    const pool = db();
    const r = await pool.query("SELECT value FROM settings WHERE key='contact_accounts_json' LIMIT 1");
    let accounts = [];
    try { accounts = JSON.parse(r.rows[0]?.value || '[]'); } catch {}
    accounts = Array.isArray(accounts) ? accounts.filter(a => a && a.active !== false) : [];
    for (const d of DEFAULTS) {
      if (!accounts.some(a => String(a.url || '').replace(/\/$/, '') === d.url)) accounts.push(d);
    }
    return json(200, { accounts });
  } catch (e) {
    // The public contact page must still expose the official contact methods
    // even if the settings table/configuration is temporarily unavailable.
    return json(200, { accounts: DEFAULTS });
  }
};

const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');

exports.handler = async () => {
  try {
    const r = await db().query("SELECT value FROM settings WHERE key='contact_accounts_json' LIMIT 1");
    let accounts = [];
    try { accounts = JSON.parse(r.rows[0]?.value || '[]'); } catch {}
    accounts = Array.isArray(accounts) ? accounts.filter(a => a && a.active !== false) : [];
    return json(200, { accounts });
  } catch (e) {
    return json(500, { error: 'Unable to load contact accounts' });
  }
};

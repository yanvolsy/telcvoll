const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
exports.handler = async () => { try { const pool=db(); const rows=(await pool.query('SELECT id, plan_key, name, duration_days, max_attempts, ai_enabled FROM plans WHERE active=TRUE ORDER BY duration_days')).rows; return json(200,{plans:rows}); } catch(e) { return json(500,{error:'Unable to load plans'}); } };

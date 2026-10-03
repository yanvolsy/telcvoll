const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireStudent } = require('./_lib/guard');

exports.handler = async (event) => {
  const student = await requireStudent(event);
  if (!student) return json(401, { error: 'unauthenticated' });
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch {}

  const pool = db();

  try {
    if (body.all) {
      await pool.query('UPDATE notifications SET read_at=NOW() WHERE student_id=$1 AND read_at IS NULL', [student.student_id]);
      // Also mark all active admin notifications as read in admin_notification_reads
      await pool.query(`
        INSERT INTO admin_notification_reads(notification_id, student_id, read_at)
        SELECT an.id, $1, NOW()
        FROM admin_notifications an
        WHERE an.is_active=TRUE
        ON CONFLICT (notification_id, student_id) DO UPDATE SET read_at=NOW()
      `, [student.student_id]);
    } else if (body.source === 'admin' || body.admin_id) {
      const notifId = parseInt(body.admin_id || body.id, 10);
      if (notifId) {
        await pool.query(
          `INSERT INTO admin_notification_reads(notification_id, student_id, read_at)
           VALUES($1, $2, NOW())
           ON CONFLICT (notification_id, student_id) DO UPDATE SET read_at=NOW()`,
          [notifId, student.student_id]
        );
      }
    } else if (body.id) {
      await pool.query('UPDATE notifications SET read_at=NOW() WHERE id=$1 AND student_id=$2', [body.id, student.student_id]);
    }

    return json(200, { ok: true });
  } catch (err) {
    console.error('[NOTIF READ ERROR]', err);
    return json(500, { error: err.message });
  }
};

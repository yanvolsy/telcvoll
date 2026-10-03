const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireStudent } = require('./_lib/guard');

exports.handler = async (event) => {
  const student = await requireStudent(event);
  if (!student) return json(401, { error: 'unauthenticated' });
  const pool = db();

  try {
    const sub = await pool.query(
      `SELECT o.expires_at, o.plan_id, COALESCE(p.name, o.plan_name) AS plan_name,
              p.duration_days, s.email, s.id AS s_id
       FROM orders o
       LEFT JOIN plans p ON p.id=o.plan_id
       JOIN students s ON s.id=o.student_id
       WHERE o.student_id=$1 AND o.status='CONFIRMED'
       ORDER BY o.expires_at DESC, o.id DESC LIMIT 1`, [student.student_id]
    );
    const c = sub.rows[0];

    if (c) {
      const ms = new Date(c.expires_at).getTime() - Date.now();
      const days = Math.ceil(ms / 86400000);
      if (ms > 0 && days <= 2) {
        await pool.query(
          `INSERT INTO notifications(student_id,type,title,message)
           VALUES($1,'subscription_expiry','تجديد الاشتراك',$2)
           ON CONFLICT (student_id,type) DO UPDATE SET message=EXCLUDED.message`,
          [student.student_id, `تبقى ${days} ${days === 1 ? 'يوم' : 'يومين'} على انتهاء خطة ${c.plan_name || 'TELC Voll'}. يمكنك التجديد من صفحة الخطط.`]
        );
      }
      if (ms <= 0) {
        await pool.query(
          `INSERT INTO notifications(student_id,type,title,message)
           VALUES($1,'subscription_expired','انتهى الاشتراك',$2)
           ON CONFLICT (student_id,type) DO UPDATE SET message=EXCLUDED.message`,
          [student.student_id, `انتهت صلاحية خطة ${c.plan_name || 'TELC Voll'}. يمكنك تجديد الاشتراك من صفحة الخطط.`]
        );
      }
    }


    // 1. Fetch personal / system notifications
    const sysRows = await pool.query(
      `SELECT id, type, title, message, read_at, created_at, 'system' AS source
       FROM notifications
       WHERE student_id=$1
       ORDER BY created_at DESC LIMIT 20`, [student.student_id]
    );

    // 2. Fetch active admin notifications matching student targeting
    let adminList = [];
    try {
      const ms = c ? new Date(c.expires_at).getTime() - Date.now() : 0;
      const isExpired = !c || ms <= 0;
      const isExpiringSoon = !!c && ms > 0 && ms <= 3 * 86400000;

      const adminQuery = `
        SELECT an.id, an.title, an.message, an.type, an.priority, an.created_at,
               an.target_type, an.target_value,
               r.read_at, 'admin' AS source
        FROM admin_notifications an
        LEFT JOIN admin_notification_reads r
          ON r.notification_id = an.id AND r.student_id = $1
        WHERE an.is_active = TRUE
          AND an.channel IN ('in_app', 'both')
          AND an.start_at <= NOW()
          AND (an.end_at IS NULL OR an.end_at > NOW())
        ORDER BY an.id DESC LIMIT 30
      `;
      const adminRes = await pool.query(adminQuery, [student.student_id]);

      // Filter matching criteria
      adminList = adminRes.rows.filter(an => {
        switch (an.target_type) {
          case 'all': return true;
          case 'active': return !isExpired;
          case 'expired': return isExpired;
          case 'expiring_soon': return isExpiringSoon;
          case 'plan': return c && String(c.plan_id) === String(an.target_value);
          case 'duration': return c && String(c.duration_days) === String(an.target_value);
          case 'specific_student':
            return c && (
              String(c.email || '').toLowerCase() === String(an.target_value || '').toLowerCase() ||
              String(c.s_id) === String(an.target_value)
            );
          case 'specific_code':
            return false;
          default: return true;
        }
      });
    } catch (anErr) {
      console.warn('[ADMIN NOTIF READ NON-FATAL]', anErr.message);
    }

    // Combine both lists and sort by date descending
    const combined = [...sysRows.rows, ...adminList].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const unread = combined.filter(x => !x.read_at).length;

    return json(200, { notifications: combined, unread });
  } catch (e) {
    console.error(e);
    return json(500, { error: 'Unable to load notifications' });
  }
};

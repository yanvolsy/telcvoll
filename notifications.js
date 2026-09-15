const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireStudent } = require('./_lib/guard');

exports.handler = async (event) => {
  const student = await requireStudent(event);
  if (!student) return json(401, { error: 'unauthenticated' });
  const pool = db();
  try {
    const sub = await pool.query(
      `SELECT c.expires_at,p.name AS plan_name
       FROM access_codes c JOIN plans p ON p.id=c.plan_id
       WHERE c.id=$1`, [student.code_id]
    );
    const c = sub.rows[0];
    if (c) {
      const ms = new Date(c.expires_at).getTime() - Date.now();
      const days = Math.ceil(ms / 86400000);
      if (ms > 0 && days <= 2) {
        await pool.query(
          `INSERT INTO notifications(student_id,type,title,message)
           VALUES($1,'code_expiry','تجديد رمز الدخول',$2)
           ON CONFLICT (student_id,type) DO UPDATE SET message=EXCLUDED.message`,
          [student.student_id, `تبقى ${days} ${days === 1 ? 'يوم' : 'يومين'} على انتهاء خطة ${c.plan_name}. تواصل معنا لتجديد رمز الدخول قبل انتهاء الوصول.`]
        );
      }
      if (ms <= 0) {
        await pool.query(
          `INSERT INTO notifications(student_id,type,title,message)
           VALUES($1,'code_expired','انتهى رمز الدخول',$2)
           ON CONFLICT (student_id,type) DO UPDATE SET message=EXCLUDED.message`,
          [student.student_id, `انتهت صلاحية خطة ${c.plan_name}. يمكنك التواصل معنا لتجديد الاشتراك.`]
        );
      }
    }
    const rows = await pool.query(
      `SELECT id,type,title,message,read_at,created_at FROM notifications
       WHERE student_id=$1 ORDER BY created_at DESC LIMIT 20`, [student.student_id]
    );
    const unread = rows.rows.filter(x => !x.read_at).length;
    return json(200, { notifications: rows.rows, unread });
  } catch (e) {
    console.error(e);
    return json(500, { error: 'Unable to load notifications' });
  }
};

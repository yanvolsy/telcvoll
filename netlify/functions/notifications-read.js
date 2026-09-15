const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireStudent } = require('./_lib/guard');
exports.handler = async (event) => {
  const student = await requireStudent(event);
  if (!student) return json(401,{error:'unauthenticated'});
  if (event.httpMethod !== 'POST') return json(405,{error:'Method not allowed'});
  let body={}; try{body=JSON.parse(event.body||'{}')}catch{}
  const pool=db();
  if(body.all){ await pool.query('UPDATE notifications SET read_at=NOW() WHERE student_id=$1 AND read_at IS NULL',[student.student_id]); }
  else if(body.id){ await pool.query('UPDATE notifications SET read_at=NOW() WHERE id=$1 AND student_id=$2',[body.id,student.student_id]); }
  return json(200,{ok:true});
};

const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireStudent } = require('./_lib/guard');
const { requireSameOrigin, requestSize } = require('./_lib/request');
const { rateLimit } = require('./_lib/ratelimit');

const MAX_BY_SECTION = { Lesen:75, Sprachbausteine:30, Hören:75 };

exports.handler = async (event) => {
  if (!requireSameOrigin(event)) return json(403, { error: 'Cross-origin request blocked.' });
  if (!requestSize(event)) return json(413, { error: 'Request too large.' });
  if(event.httpMethod!=='POST') return json(405,{error:'Method not allowed'});
  const student=await requireStudent(event); if(!student) return json(401,{error:'unauthenticated'});
  if (!(await rateLimit('mock_submit', 20, 3600, String(student.student_id)))) return json(429,{error:'Too many exam submissions. Please try again later.'});
  let body={}; try{body=JSON.parse(event.body||'{}')}catch{return json(400,{error:'Bad request'});}
  const tasks=Array.isArray(body.tasks)?body.tasks:[];
  if(!tasks.length) return json(400,{error:'No exam tasks'});
  const pool=db();
  try{
    const sectionRaw={}; const details=[];
    for(const task of tasks){
      const id=parseInt(task.id,10); if(!id) continue;
      const ex=(await client.query("SELECT id,level,section,teil,title,status FROM exercises WHERE id=$1 AND status='published' AND deleted_at IS NULL",[id])).rows[0];
      if(!ex) continue;
      const items=(await client.query('SELECT id,position_no,prompt,correct_answer,points FROM items WHERE exercise_id=$1 ORDER BY position_no',[id])).rows;
      const given=task.answers&&typeof task.answers==='object'?task.answers:{};
      let rawScore=0, rawMax=0;
      for(const it of items){
        const ans=String(given[it.id] ?? given[it.position_no] ?? '').trim();
        const pts=Number(it.points)||1; rawMax+=pts;
        const ok=ans!=='' && ans===String(it.correct_answer??''); if(ok) rawScore+=pts;
        details.push({exercise_id:id,section:ex.section,teil:ex.teil,prompt:it.prompt,given:ans,ok,points:ok?pts:0,max_points:pts});
      }
      if(MAX_BY_SECTION[ex.section]){
        const a=sectionRaw[ex.section] ||= {raw:0,max:0,tasks:[]}; a.raw+=rawScore; a.max+=rawMax; a.tasks.push({id,teil:ex.teil,raw:rawScore,max:rawMax});
      }
    }
    const sections={};
    for(const [section,v] of Object.entries(sectionRaw)){
      const max=MAX_BY_SECTION[section]; const score=v.max?Math.round((v.raw/v.max)*max*100)/100:0;
      sections[section]={score,max,percent:max?Math.round(score/max*10000)/100:0,tasks:v.tasks};
    }
    return json(200,{level:body.level||'',sections,details});
  }catch(e){console.error('mock-submit failed',e);return json(500,{error:'تعذر إنهاء المحاكاة.'});}finally{client.release();}
};

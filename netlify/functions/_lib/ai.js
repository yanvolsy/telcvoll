const { db } = require('./db');
function clip(v,n){return String(v||'').slice(0,n);}
async function logAiError(feature,error,studentId=null){try{await db().query('INSERT INTO ai_logs(student_id,kind,input_text,output_text) VALUES($1,$2,$3,$4)',[studentId,clip(feature,50),'',clip(error,1000)]);}catch{}}
module.exports={clip,logAiError};

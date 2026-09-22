const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireAdmin } = require('./_lib/guard');
const { requireSameOrigin, requestSize } = require('./_lib/request');

function parseBody(event) {
  try { return JSON.parse(event.body || '{}'); }
  catch { return null; }
}

function normalizePayload(body) {
  const audio_url = String(
    body.audio_url || body.audioUrl || body.audio ||
    body.sound_url || body.sound || body.audio_file ||
    body.media_url || body.mediaUrl || body.audio_path ||
    body.audioLink || body.audio_link || body.soundUrl || ''
  ).trim();

  const task_type = String(body.task_type || '').trim();

  return {
    level: ['B1','B2','C1'].includes(String(body.level || '').trim()) ? String(body.level).trim() : 'B2',
    section: String(body.section || '').trim(),
    teil: String(body.teil || '').trim(),
    title: String(body.title || '').trim(),
    task_type,
    body: String(body.body || ''),
    translation: String(body.translation || ''),
    audio_url,
    allow_replay: !!body.allow_replay,
    writing_situation: String(body.writing_situation || ''),
    writing_task: String(body.writing_task || ''),
    // Wichtig: leere Zeilen NICHT herausfiltern — sonst verschiebt sich der
    // Buchstaben-Index (A,B,C…) gegenüber dem, was im Admin-Formular angezeigt wurde.
    headings: Array.isArray(body.headings) ? body.headings.map(String).map(x => x.trim()) : [],
    settings: body.settings && typeof body.settings === 'object' ? body.settings : {},
    items: Array.isArray(body.items) ? body.items.map(it => {
      let options = it.options && typeof it.options === 'object' ? it.options : {};
      let correct = String(it.correct || it.correct_answer || '').trim();
      const prompt = String(it.prompt || it.text || it.question || '').trim();

      if (task_type === 'AUDIO_TF' || (!Object.keys(options).length && /^(richtig|falsch|true|false|r|f|0|1)$/i.test(correct))) {
        options = { Richtig: 'Richtig', Falsch: 'Falsch' };
        if (/^(falsch|false|f|0)$/i.test(correct)) correct = 'Falsch';
        else if (/^(richtig|true|r|1)$/i.test(correct)) correct = 'Richtig';
      }

      return {
        prompt,
        correct,
        points: Number.parseFloat(it.points ?? 1) || 1,
        explanation: String(it.explanation || ''),
        options,
      };
    }).filter(it => it.prompt) : [],
  };
}

async function saveExercise(client, id, body) {
  const p = normalizePayload(body);
  if (!p.section || !p.teil || !p.title || !p.task_type) {
    return { error: 'يرجى إكمال نوع القسم والجزء والعنوان ونوع المهمة.' };
  }

  const settings = {
    ...(p.settings || {}),
    headings: p.headings,
    allow_audio_replay: p.allow_replay,
    situation_text: p.writing_situation,
    task_text: p.writing_task,
  };

  let exerciseId = id;
  if (id) {
    await client.query(
      `UPDATE exercises
       SET level=$1, section=$2, teil=$3, title=$4, task_type=$5, body=$6, translation=$7,
           audio_url=$8, settings_json=$9, updated_at=NOW()
       WHERE id=$10`,
      [p.level,p.section,p.teil,p.title,p.task_type,p.body,p.translation,p.audio_url,JSON.stringify(settings),id]
    );
    await client.query(
      'DELETE FROM items WHERE exercise_id=$1',
      [id]
    );
  } else {
    const r = await client.query(
      `INSERT INTO exercises(level,section,teil,title,task_type,body,translation,audio_url,settings_json,status)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,'published') RETURNING id`,
      [p.level,p.section,p.teil,p.title,p.task_type,p.body,p.translation,p.audio_url,JSON.stringify(settings)]
    );
    exerciseId = r.rows[0].id;
  }

  // Für MATCHING (Lesen 1/3, Hören 3, Sprachbausteine 1) teilen sich alle Elemente
  // dieselbe Options-Liste (die "headings"), statt eigener Optionen pro Element.
  let sharedOptions = null;
  if (p.task_type === 'MATCHING' && p.headings.length) {
    sharedOptions = {};
    p.headings.forEach((text, idx) => { sharedOptions[String.fromCharCode(65 + idx)] = text; });
  }

  for (let i=0; i<p.items.length; i++) {
    const it=p.items[i];
    const itemRes=await client.query(
      `INSERT INTO items(exercise_id,position_no,prompt,correct_answer,points,explanation,settings_json)
       VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [exerciseId,i+1,it.prompt,it.correct,it.points,it.explanation,JSON.stringify({})]
    );
    const itemId=itemRes.rows[0].id;
    const options=sharedOptions || it.options || {};
    let sort=1;
    for (const key of Object.keys(options)) {
      const txt=String(options[key] ?? '').trim();
      if (!txt) continue;
      await client.query(
        `INSERT INTO item_options(item_id,option_key,option_text,is_correct,sort_order)
         VALUES($1,$2,$3,$4,$5)`,
        [itemId,String(key),txt,String(key)===it.correct,sort++]
      );
    }
  }
  return { id: exerciseId };
}

exports.handler = async (event) => {
  if (!requireSameOrigin(event)) return json(403, { error: 'Cross-origin request blocked.' });
  if (!requestSize(event)) return json(413, { error: 'Request too large.' });
  if (!requireAdmin(event)) return json(401, { error: 'unauthenticated' });
  const pool = db();

  if (event.httpMethod === 'GET') {
    const url = new URL(event.rawUrl || 'http://localhost' + (event.path || '/'), 'http://localhost');
    const id = url.searchParams.get('id');
    if (id) {
      const ex = await pool.query('SELECT * FROM exercises WHERE id=$1', [id]);
      if (!ex.rows.length) return json(404, { error: 'التمرين غير موجود.' });
      const items = await pool.query('SELECT * FROM items WHERE exercise_id=$1 ORDER BY position_no', [id]);
      for (const item of items.rows) {
        const opts = await pool.query('SELECT option_key,option_text,is_correct,sort_order FROM item_options WHERE item_id=$1 ORDER BY sort_order,id', [item.id]);
        item.options = opts.rows;
      }
      return json(200, { exercise: ex.rows[0], items: items.rows });
    }

    const level = url.searchParams.get('level');
    const section = url.searchParams.get('section');
    const teil = url.searchParams.get('teil');
    const includeDeleted = url.searchParams.get('include_deleted') === '1';

    const clauses = [];
    const params = [];
    if (!includeDeleted) clauses.push('e.deleted_at IS NULL');
    if (level && level !== 'ALL') {
      params.push(level);
      clauses.push(`UPPER(TRIM(e.level)) = UPPER(TRIM($${params.length}))`);
    }
    if (section && section !== 'ALL') {
      params.push(section);
      clauses.push(`LOWER(TRIM(e.section)) = LOWER(TRIM($${params.length}))`);
    }
    if (teil && teil !== 'ALL') {
      params.push(teil);
      clauses.push(`LOWER(REPLACE(TRIM(e.teil),' ','')) = LOWER(REPLACE(TRIM($${params.length}),' ',''))`);
    }
    const whereSql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const { rows } = await pool.query(`
      SELECT e.*,
        (SELECT COUNT(*) FROM items i WHERE i.exercise_id=e.id) AS item_count
      FROM exercises e
      ${whereSql}
      ORDER BY e.id DESC
    `, params);
    return json(200, { exercises: rows });
  }

  const body = parseBody(event);
  if (!body) return json(400, { error: 'طلب غير صالح.' });

  if (event.httpMethod === 'DELETE') {
    const id = Number(body.id);
    if (!id) return json(422, { error: 'معرّف التمرين مطلوب.' });
    await pool.query('DELETE FROM exercises WHERE id=$1', [id]);
    return json(200, { ok: true });
  }

  if (event.httpMethod === 'POST' && body && body.action === 'duplicate') {
    const sourceId = Number(body.id);
    if (!sourceId) return json(422, { error: 'معرّف التمرين مطلوب.' });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const src = await client.query('SELECT * FROM exercises WHERE id=$1', [sourceId]);
      if (!src.rows.length) { await client.query('ROLLBACK'); return json(404, { error: 'التمرين غير موجود.' }); }
      const e = src.rows[0];
      const created = await client.query(`INSERT INTO exercises(level,section,teil,title,task_type,body,translation,audio_url,settings_json,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`, [e.level,e.section,e.teil,e.title+' — نسخة',e.task_type,e.body,e.translation,e.audio_url,e.settings_json,e.status]);
      const newId=created.rows[0].id;
      const items=await client.query('SELECT * FROM items WHERE exercise_id=$1 ORDER BY position_no',[sourceId]);
      for(const it of items.rows){
        const ni=await client.query(`INSERT INTO items(exercise_id,position_no,prompt,correct_answer,points,explanation,settings_json) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id`,[newId,it.position_no,it.prompt,it.correct_answer,it.points,it.explanation,it.settings_json]);
        const opts=await client.query('SELECT option_key,option_text,is_correct,sort_order FROM item_options WHERE item_id=$1 ORDER BY sort_order,id',[it.id]);
        for(const o of opts.rows) await client.query(`INSERT INTO item_options(item_id,option_key,option_text,is_correct,sort_order) VALUES($1,$2,$3,$4,$5)`,[ni.rows[0].id,o.option_key,o.option_text,o.is_correct,o.sort_order]);
      }
      await client.query('COMMIT');
      return json(200,{ok:true,id:newId});
    } catch(e){await client.query('ROLLBACK');return json(500,{error:e.message});} finally{client.release();}
  }

  if (event.httpMethod === 'PATCH') {
    const id = Number(body.id);
    if (!id) return json(422, { error: 'معرّف التمرين مطلوب.' });
    const status = body.status === 'disabled' ? 'disabled' : 'published';
    await pool.query('UPDATE exercises SET status=$1,updated_at=NOW() WHERE id=$2', [status,id]);
    return json(200, { ok: true, status });
  }

  if (event.httpMethod === 'POST' || event.httpMethod === 'PUT') {
    const id = event.httpMethod === 'PUT' ? Number(body.id) : null;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await saveExercise(client,id,body);
      if (result.error) {
        await client.query('ROLLBACK');
        return json(422,{error:result.error});
      }
      await client.query('COMMIT');
      return json(200,{ok:true,id:result.id});
    } catch(e) {
      await client.query('ROLLBACK');
      return json(500,{error:e.message});
    } finally { client.release(); }
  }

  return json(405, { error: 'Method not allowed' });
};

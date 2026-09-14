const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireAdmin } = require('./_lib/guard');

// Backs the "Bearbeiten / Duplizieren / Löschen / Veröffentlichen" admin
// toolbar injected into the learner-facing pages, plus the Content
// Management browser. Every write here is a real DB operation — no fake UI.

async function replaceItems(client, exerciseId, items) {
  const existing = (await client.query('SELECT id FROM items WHERE exercise_id=$1', [exerciseId])).rows.map((r) => r.id);
  const keepIds = [];

  for (const it of items || []) {
    let itemId = it.id;
    if (itemId && existing.includes(itemId)) {
      await client.query(
        `UPDATE items SET position_no=$1, prompt=$2, correct_answer=$3, points=$4, explanation=$5, settings_json=$6
         WHERE id=$7`,
        [it.position_no, it.prompt, it.correct_answer, it.points || 1, it.explanation || null, it.settings_json || null, itemId]
      );
    } else {
      const r = await client.query(
        `INSERT INTO items(exercise_id,position_no,prompt,correct_answer,points,explanation,settings_json)
         VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
        [exerciseId, it.position_no, it.prompt, it.correct_answer, it.points || 1, it.explanation || null, it.settings_json || null]
      );
      itemId = r.rows[0].id;
    }
    keepIds.push(itemId);

    const existingOpts = (await client.query('SELECT id FROM item_options WHERE item_id=$1', [itemId])).rows.map((r) => r.id);
    const keepOptIds = [];
    for (const opt of it.options || []) {
      if (opt.id && existingOpts.includes(opt.id)) {
        await client.query(
          'UPDATE item_options SET option_key=$1, option_text=$2, is_correct=$3, sort_order=$4 WHERE id=$5',
          [opt.option_key, opt.option_text, !!opt.is_correct, opt.sort_order || 1, opt.id]
        );
        keepOptIds.push(opt.id);
      } else {
        const r = await client.query(
          'INSERT INTO item_options(item_id,option_key,option_text,is_correct,sort_order) VALUES($1,$2,$3,$4,$5) RETURNING id',
          [itemId, opt.option_key, opt.option_text, !!opt.is_correct, opt.sort_order || 1]
        );
        keepOptIds.push(r.rows[0].id);
      }
    }
    const toDeleteOpts = existingOpts.filter((id) => !keepOptIds.includes(id));
    if (toDeleteOpts.length) {
      await client.query('DELETE FROM item_options WHERE id = ANY($1::int[])', [toDeleteOpts]);
    }
  }

  const toDeleteItems = existing.filter((id) => !keepIds.includes(id));
  if (toDeleteItems.length) {
    await client.query('DELETE FROM items WHERE id = ANY($1::int[])', [toDeleteItems]);
  }
}

exports.handler = async (event) => {
  if (!requireAdmin(event)) return json(401, { error: 'unauthenticated' });
  const pool = db();

  if (event.httpMethod === 'GET') {
    const qs = event.queryStringParameters || {};

    if (qs.id) {
      const id = parseInt(qs.id, 10);
      const exRes = await pool.query('SELECT * FROM exercises WHERE id=$1', [id]);
      const exercise = exRes.rows[0];
      if (!exercise) return json(404, { error: 'Topic not found' });

      const itemsRes = await pool.query('SELECT * FROM items WHERE exercise_id=$1 ORDER BY position_no', [id]);
      const items = [];
      for (const it of itemsRes.rows) {
        const optsRes = await pool.query('SELECT * FROM item_options WHERE item_id=$1 ORDER BY sort_order,id', [it.id]);
        items.push({ ...it, options: optsRes.rows });
      }
      return json(200, { exercise, items });
    }

    // Content-tree browse: Level -> Section -> Part(Teil) -> Topics
    const level = qs.level || null;
    const section = qs.section || null;
    const includeDeleted = qs.include_deleted === '1';
    const clauses = [];
    const params = [];
    if (!includeDeleted) clauses.push('deleted_at IS NULL');
    if (level) { params.push(level); clauses.push(`level=$${params.length}`); }
    if (section) { params.push(section); clauses.push(`section=$${params.length}`); }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const rows = (await pool.query(
      `SELECT id, level, section, teil, title, task_type, status, access_mode, updated_at
       FROM exercises ${where}
       ORDER BY level, section, teil, id DESC`,
      params
    )).rows;
    return json(200, { topics: rows });
  }

  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Bad request' }); }
  const action = String(body.action || '');
  const client = await pool.connect();

  try {
    if (action === 'save') {
      const t = body.topic || {};
      await client.query('BEGIN');
      let id = parseInt(t.id || 0, 10);

      const fields = [
        t.level || 'B2', t.section, t.teil, t.title, t.task_type || 'custom',
        t.body || null, t.translation || null, t.instructions || null, t.vocabulary || null,
        t.difficulty || null, t.tags || null, t.audio_url || null, t.image_url || null,
        parseInt(t.time_limit_seconds || 0, 10), t.access_mode || 'code_required', t.status || 'draft',
      ];

      if (id) {
        await client.query(
          `UPDATE exercises SET level=$1, section=$2, teil=$3, title=$4, task_type=$5, body=$6,
             translation=$7, instructions=$8, vocabulary=$9, difficulty=$10, tags=$11, audio_url=$12,
             image_url=$13, time_limit_seconds=$14, access_mode=$15, status=$16, updated_at=NOW()
           WHERE id=$17`,
          [...fields, id]
        );
      } else {
        const r = await client.query(
          `INSERT INTO exercises(level,section,teil,title,task_type,body,translation,instructions,
             vocabulary,difficulty,tags,audio_url,image_url,time_limit_seconds,access_mode,status)
           VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING id`,
          fields
        );
        id = r.rows[0].id;
      }

      await replaceItems(client, id, t.items);
      await client.query('COMMIT');
      return json(200, { ok: true, id });
    }

    if (action === 'delete') {
      const id = parseInt(body.id || 0, 10);
      if (!id) return json(422, { error: 'id manquant' });
      // Soft-delete: never a hard DELETE from the admin toolbar, so accidental
      // clicks never lose data. Also unpublish immediately.
      await client.query("UPDATE exercises SET deleted_at=NOW(), status='draft' WHERE id=$1", [id]);
      return json(200, { ok: true, softDeleted: true });
    }

    if (action === 'restore') {
      const id = parseInt(body.id || 0, 10);
      await client.query('UPDATE exercises SET deleted_at=NULL WHERE id=$1', [id]);
      return json(200, { ok: true });
    }

    if (action === 'duplicate') {
      const id = parseInt(body.id || 0, 10);
      if (!id) return json(422, { error: 'id manquant' });
      await client.query('BEGIN');
      const srcRes = await client.query('SELECT * FROM exercises WHERE id=$1', [id]);
      const src = srcRes.rows[0];
      if (!src) { await client.query('ROLLBACK'); return json(404, { error: 'Topic not found' }); }

      const r = await client.query(
        `INSERT INTO exercises(level,section,teil,title,task_type,body,translation,instructions,
           vocabulary,difficulty,tags,audio_url,image_url,time_limit_seconds,access_mode,status)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'draft') RETURNING id`,
        [src.level, src.section, src.teil, `${src.title} (Kopie)`, src.task_type, src.body, src.translation,
          src.instructions, src.vocabulary, src.difficulty, src.tags, src.audio_url, src.image_url,
          src.time_limit_seconds, src.access_mode]
      );
      const newId = r.rows[0].id;

      const itemsRes = await client.query('SELECT * FROM items WHERE exercise_id=$1 ORDER BY position_no', [id]);
      for (const it of itemsRes.rows) {
        const itemRes = await client.query(
          `INSERT INTO items(exercise_id,position_no,prompt,correct_answer,points,explanation,settings_json)
           VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
          [newId, it.position_no, it.prompt, it.correct_answer, it.points, it.explanation, it.settings_json]
        );
        const newItemId = itemRes.rows[0].id;
        const optsRes = await client.query('SELECT * FROM item_options WHERE item_id=$1 ORDER BY sort_order,id', [it.id]);
        for (const opt of optsRes.rows) {
          await client.query(
            'INSERT INTO item_options(item_id,option_key,option_text,is_correct,sort_order) VALUES($1,$2,$3,$4,$5)',
            [newItemId, opt.option_key, opt.option_text, opt.is_correct, opt.sort_order]
          );
        }
      }
      await client.query('COMMIT');
      return json(200, { ok: true, id: newId });
    }

    if (action === 'publish' || action === 'unpublish') {
      const id = parseInt(body.id || 0, 10);
      await client.query('UPDATE exercises SET status=$1, updated_at=NOW() WHERE id=$2', [action === 'publish' ? 'published' : 'draft', id]);
      return json(200, { ok: true });
    }

    return json(400, { error: 'Unknown action' });
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    console.error(e);
    return json(500, { error: e.message });
  } finally {
    client.release();
  }
};

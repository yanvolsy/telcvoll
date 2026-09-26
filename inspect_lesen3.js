require('dotenv').config();
const { db } = require('./netlify/functions/_lib/db');
const pool = db();

(async () => {
  try {
    const res = await pool.query("SELECT id, title, section, teil, settings, headings, items_count FROM exercises WHERE section='Lesen' AND teil='Teil 3' LIMIT 2");
    console.log('Exercises found:', res.rows.length);
    for (const row of res.rows) {
      console.log('\n--- Exercise ID:', row.id, 'Title:', row.title, '---');
      console.log('Headings count:', Array.isArray(row.headings) ? row.headings.length : typeof row.headings);
      if (Array.isArray(row.headings)) {
        console.log('Headings sample:', row.headings.slice(0, 3));
      }
      const itemsRes = await pool.query('SELECT id, position_no, prompt, correct_answer, options FROM exercise_items WHERE exercise_id=$1 ORDER BY position_no', [row.id]);
      console.log('Items count:', itemsRes.rows.length);
      console.log('Items sample:', itemsRes.rows.slice(0, 3).map(it => ({
        pos: it.position_no,
        prompt: it.prompt ? it.prompt.slice(0, 70) : '',
        ans: it.correct_answer
      })));
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
})();

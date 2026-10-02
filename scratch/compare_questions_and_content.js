const fs = require('fs');

const qContent = fs.readFileSync('public/admin/questions.html', 'utf8');
const cContent = fs.readFileSync('public/admin/content.html', 'utf8');

console.log('=== Comparing questions.html vs content.html ===\n');

console.log('questions.html size:', (qContent.length / 1024).toFixed(1), 'KB, lines:', qContent.split('\n').length);
console.log('content.html size:', (cContent.length / 1024).toFixed(1), 'KB, lines:', cContent.split('\n').length);

const features = [
  { name: 'Sections: Lesen, Hören, Sprachbausteine, Schreiben, Sprechen', q: true, c: true },
  { name: 'Levels: B1, B2, C1', q: qContent.includes('B1') && qContent.includes('B2') && qContent.includes('C1'), c: cContent.includes('B1') && cContent.includes('B2') },
  { name: 'Teil 1, 2, 3 selection', q: qContent.includes('Teil 1') && qContent.includes('Teil 3'), c: cContent.includes('Teil 1') && cContent.includes('Teil 3') },
  { name: 'Item list editor / multiple questions per exercise', q: qContent.includes('item-row') || qContent.includes('items-list') || qContent.includes('questions-list'), c: cContent.includes('item-row') },
  { name: 'Task types (MCQ, MATCHING, GAP_FILL, etc.)', q: qContent.includes('task_type') || qContent.includes('TASK_TYPES'), c: cContent.includes('task_type') },
  { name: 'Audio URL / Audio uploader / Audio preview', q: qContent.includes('audio_url') || qContent.includes('audio'), c: cContent.includes('audio') },
  { name: 'JSON Import / Export', q: qContent.includes('JSON') || qContent.includes('import') || qContent.includes('export'), c: cContent.includes('JSON') },
  { name: 'AI Topic / Question Generator', q: qContent.includes('ai') || qContent.includes('generate'), c: cContent.includes('ai') || cContent.includes('generate') },
  { name: 'Model answer editor', q: qContent.includes('model_answer') || qContent.includes('solution'), c: cContent.includes('model_answer') || cContent.includes('solution') },
  { name: 'Duplicate exercise action', q: qContent.includes('duplicate') || qContent.includes('نسخ'), c: cContent.includes('duplicate') || cContent.includes('نسخ') },
  { name: 'Delete exercise action', q: qContent.includes('delete') || qContent.includes('حذف'), c: cContent.includes('delete') || cContent.includes('حذف') },
  { name: 'Publish / Draft status toggle', q: qContent.includes('published') || qContent.includes('draft'), c: cContent.includes('published') || cContent.includes('draft') },
  { name: 'Search & filter by Section/Level/Teil/Status', q: qContent.includes('filter') || qContent.includes('search'), c: cContent.includes('filter') || cContent.includes('search') }
];

console.log('Feature Analysis:');
features.forEach(f => {
  console.log(`- ${f.name}:`);
  console.log(`   questions.html: ${f.q ? 'YES' : 'NO'}`);
  console.log(`   content.html: ${f.c ? 'YES' : 'NO'}`);
});

console.log('\nAPIs called:');
console.log('questions.html:', Array.from(new Set(qContent.match(/api\(['"][^'"]+['"]/g) || [])));
console.log('content.html:', Array.from(new Set(cContent.match(/api\(['"][^'"]+['"]/g) || [])));

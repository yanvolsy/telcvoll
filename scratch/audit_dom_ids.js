const fs = require('fs');

const pages = [
  'public/index.html',
  'public/plans.html',
  'public/dashboard.html',
  'public/exercise.html',
  'public/speaking.html',
  'public/mock-exam.html',
  'public/self-test.html',
  'public/self-test-result.html'
];

console.log('=== Checking DOM ID References in User-Facing Pages ===\n');

pages.forEach(p => {
  const content = fs.readFileSync(p, 'utf8');
  
  // Extract all getElementById('...')
  const getByIdMatches = content.match(/getElementById\(['"]([a-zA-Z0-9_\-]+)['"]\)/g) || [];
  const referencedIds = getByIdMatches.map(m => m.match(/['"]([a-zA-Z0-9_\-]+)['"]/)[1]);

  const missingIds = [];
  referencedIds.forEach(id => {
    // Check if id exists in HTML or template strings
    const idDefRegex = new RegExp(`id=["'\`]${id}["'\`]`, 'i');
    if (!idDefRegex.test(content)) {
      missingIds.push(id);
    }
  });

  console.log(`${p}: ${referencedIds.length} ID lookups, ${missingIds.length} missing.`);
  if (missingIds.length > 0) {
    console.log('  Missing IDs:', missingIds);
  }
});

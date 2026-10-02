const fs = require('fs');
const assert = require('assert');

console.log('=== Checking Responsive Layout Rules across Phase 7D Files ===\n');

const selfTestHtml = fs.readFileSync('public/self-test.html', 'utf8');
const resultHtml = fs.readFileSync('public/self-test-result.html', 'utf8');

// 1. Check self-test.html mobile rules
console.log('1. Checking self-test.html mobile queries...');
assert.ok(selfTestHtml.includes('@media (max-width: 768px)'), 'Mobile media query missing in self-test.html');
assert.ok(selfTestHtml.includes('grid-template-columns: 1fr !important'), 'Rules grid 1-col mobile reflow missing');
assert.ok(selfTestHtml.includes('width: 100% !important'), 'Full-width button on mobile missing');
console.log('✓ self-test.html mobile rules verified.');

// 2. Check self-test-result.html mobile rules
console.log('2. Checking self-test-result.html mobile queries...');
assert.ok(resultHtml.includes('@media (max-width: 768px)'), 'Mobile media query missing in self-test-result.html');
assert.ok(resultHtml.includes('grid-template-columns: 1fr !important'), 'Result grid 1-col mobile reflow missing');
assert.ok(resultHtml.includes('flex-direction: column !important'), 'Action buttons stacked column on mobile missing');
assert.ok(resultHtml.includes('width: 100% !important'), 'Full-width action buttons on mobile missing');
console.log('✓ self-test-result.html mobile rules verified.');

// 3. Check Print media queries
console.log('3. Checking self-test-result.html print media rules...');
assert.ok(resultHtml.includes('@media print'), 'Print media query missing');
assert.ok(resultHtml.includes('header.top'), 'Print header suppression missing');
assert.ok(resultHtml.includes('page-break-inside: avoid'), 'Print page break avoidance missing');
assert.ok(resultHtml.includes('display: none !important'), 'Print element hiding missing');
console.log('✓ Print media rules verified.');

console.log('\n========================================================================');
console.log('  ALL RESPONSIVE & PRINT CHECKS PASSED!                                 ');
console.log('========================================================================\n');

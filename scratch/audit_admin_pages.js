const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, '..', 'public', 'admin');
const adminFiles = fs.readdirSync(adminDir).filter(f => f.endsWith('.html'));

console.log('=== Inspecting Admin Pages ===\n');

adminFiles.forEach(file => {
  const full = path.join(adminDir, file);
  const content = fs.readFileSync(full, 'utf8');
  const stat = fs.statSync(full);

  // Check for admin-bar.js or admin-guard.js
  const hasGuard = content.includes('admin-guard.js');
  const hasAdminBar = content.includes('admin-bar.js');
  const hasThemeColor = content.includes('data-theme') || content.includes('dark-mode') || content.includes('theme-toggle');
  
  // Navigation links
  const navMatches = content.match(/href=["'](\/[^"']+|[^"']+\.html)["']/g) || [];
  
  console.log(`Page: admin/${file} (${(stat.size/1024).toFixed(1)} KB)`);
  console.log(`  Guard: ${hasGuard ? 'YES' : 'NO'}, AdminBar: ${hasAdminBar ? 'YES' : 'NO'}`);
  console.log(`  Links count: ${navMatches.length}`);
});

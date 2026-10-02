const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const adminDir = path.join(rootDir, 'public', 'admin');
const files = fs.readdirSync(adminDir).filter(f => f.endsWith('.html'));

console.log('=== Running Full Admin Details Audit ===\n');

const auditResults = {};

files.forEach(f => {
  const p = path.join(adminDir, f);
  const content = fs.readFileSync(p, 'utf8');

  // 1. Cache buster
  const cacheMatch = content.match(/href=["']\/assets\/app\.css(?:\?v=([^"']+))?["']/i);
  const cacheVersion = cacheMatch ? (cacheMatch[1] || 'no-version') : 'no-app-css';

  // 2. Viewport
  const hasViewport = content.includes('name="viewport"');

  // 3. Dir attribute
  const dirMatch = content.match(/<html[^>]*dir=["']([^"']+)["']/i);
  const dir = dirMatch ? dirMatch[1] : 'not-set';

  // 4. Tables and responsive wrapper
  const hasTable = content.includes('<table');
  const hasTableWrap = content.includes('overflow:auto') || content.includes('overflow-x:auto') || content.includes('table-wrap') || content.includes('table-scroll') || content.includes('-webkit-overflow-scrolling');

  // 5. Media queries
  const mediaQueries = content.match(/@media[^{]+\{/g) || [];

  // 6. Buttons analysis
  const buttonTags = content.match(/<button[^>]*>[\s\S]*?<\/button>/gi) || [];
  const actionLinks = content.match(/<a[^>]*class=["'][^"']*(?:btn|button|action)[^"']*["'][^>]*>[\s\S]*?<\/a>/gi) || [];
  const totalInteractives = buttonTags.length + actionLinks.length;

  // 7. Legacy green occurrences
  const green2d = (content.match(/#2d9b68/gi) || []).length;
  const varGreen = (content.match(/var\(--green\b/g) || []).length;
  const varGreenSoft = (content.match(/var\(--green-soft\b/g) || []).length;
  const varGreenDark = (content.match(/var\(--green-dark\b/g) || []).length;

  // 8. Dark mode & light mode support
  const hasDarkStyles = content.includes('dark-mode') || content.includes('data-theme') || content.includes('var(--bg)') || content.includes('var(--ink)');
  const hardcodedWhiteBg = (content.match(/(?:background|background-color)\s*:\s*(?:#fff\b|#ffffff\b|white\b)/gi) || []).length;

  auditResults[f] = {
    cacheVersion,
    hasViewport,
    dir,
    hasTable,
    hasTableWrap,
    mediaQueryCount: mediaQueries.length,
    buttonsCount: buttonTags.length,
    actionLinksCount: actionLinks.length,
    totalInteractives,
    legacyGreen: {
      '#2d9b68': green2d,
      'var(--green)': varGreen,
      'var(--green-soft)': varGreenSoft,
      'var(--green-dark)': varGreenDark
    },
    hasDarkStyles,
    hardcodedWhiteBg
  };

  console.log(`Page: admin/${f}`);
  console.log(`  Cache Version: ${cacheVersion}`);
  console.log(`  Direction: ${dir}, Viewport: ${hasViewport}`);
  console.log(`  Has Table: ${hasTable}, Table Overflow Wrap: ${hasTableWrap}`);
  console.log(`  Media Queries: ${mediaQueries.length}`);
  console.log(`  Buttons/Interactive CTAs: ${totalInteractives}`);
  console.log(`  Legacy Green: #2d9b68: ${green2d}, var(--green): ${varGreen}, var(--green-soft): ${varGreenSoft}, var(--green-dark): ${varGreenDark}`);
  console.log(`  Dark Variables Used: ${hasDarkStyles}, Hardcoded White Bgs in styles: ${hardcodedWhiteBg}\n`);
});

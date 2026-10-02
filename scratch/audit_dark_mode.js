const fs = require('fs');
const path = require('path');

const userFacingPages = [
  'public/index.html',
  'public/plans.html',
  'public/dashboard.html',
  'public/exercise.html',
  'public/speaking.html',
  'public/self-test.html',
  'public/mock-exam.html',
  'public/self-test-result.html',
  'public/telc-chat.html',
  'public/profile.html',
  'public/login.html',
  'public/register.html',
  'public/forgot-password.html',
  'public/reset-password.html',
  'public/verify-email.html',
  'public/payment-success.html',
  'public/contact.html'
];

console.log('=== Checking Dark Mode & Light Mode Surface Consistency ===\n');

userFacingPages.forEach(p => {
  const content = fs.readFileSync(p, 'utf8');
  
  // Look for hardcoded style attributes with background: #fff or background: white or background: #ffffff
  const inlineWhite = content.match(/style=["'][^"']*background\s*:\s*(?:#fff\b|#ffffff\b|white\b)[^"']*["']/gi) || [];
  
  // Look for style tags with hardcoded white backgrounds
  const styleTags = content.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
  let styleWhite = [];
  styleTags.forEach(st => {
    const matches = st.match(/background\s*:\s*(?:#fff\b|#ffffff\b|white\b|rgba\(255,\s*255,\s*255,\s*0?\.[89]\d*\))/gi);
    if (matches) styleWhite = styleWhite.concat(matches);
  });

  // Check theme toggle support or dark mode class
  const hasDarkSupport = content.includes('data-theme') || content.includes('theme-toggle') || content.includes('pwa-theme.js') || content.includes('prefers-color-scheme') || content.includes('app.css');

  console.log(`Page: ${p}`);
  console.log(`  Inline style white background: ${inlineWhite.length}`);
  if (inlineWhite.length) console.log('   Inline:', inlineWhite);
  console.log(`  Style tag white backgrounds: ${styleWhite.length}`);
  if (styleWhite.length) console.log('   In style tag:', styleWhite);
});

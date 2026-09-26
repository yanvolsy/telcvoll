const fs = require('fs');

const css = fs.readFileSync('public/assets/app.css', 'utf8');

// Find all occurrences of "input", "select", "textarea" rules in app.css
const regex = /([^{}]+)\{([^}]+)\}/g;
let match;
const formRules = [];
while ((match = regex.exec(css)) !== null) {
  const selector = match[1].trim();
  const declarations = match[2].trim();
  if (selector.includes('input') || selector.includes('select') || selector.includes('textarea') || selector.includes('placeholder')) {
    formRules.push({ selector, declarations });
  }
}

console.log(`Found ${formRules.length} form-related CSS rules.`);
formRules.forEach(r => {
  if (r.selector.includes('dark') || r.declarations.includes('color:') || r.declarations.includes('background:')) {
    console.log('RULE:', r.selector.slice(0, 80));
    console.log('DECL:', r.declarations.slice(0, 100));
    console.log('---');
  }
});

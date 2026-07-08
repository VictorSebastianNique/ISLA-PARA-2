const fs = require('fs');

let file = 'src/index.css';
let code = fs.readFileSync(file, 'utf8');

// Update dark mode bg opacity
code = code.replace(/--top-nav-bg:\s*rgba\(15, 23, 42, 0\.6\);/g, '--top-nav-bg:       rgba(15, 23, 42, 0.75);');

// Update light mode bg opacity
code = code.replace(/--top-nav-bg:\s*rgba\(255, 255, 255, 0\.6\);/g, '--top-nav-bg:       rgba(255, 255, 255, 0.85);');

// Update .top-nav class for better glassmorphism
const oldTopNav = /\.top-nav \{\s*background: var\(--top-nav-bg\);\s*backdrop-filter: blur\(16px\);\s*-webkit-backdrop-filter: blur\(16px\);/g;
const newTopNav = `.top-nav {
  background: var(--top-nav-bg);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  will-change: transform;
  transform: translateZ(0);`;

code = code.replace(oldTopNav, newTopNav);

fs.writeFileSync(file, code);
console.log('Glassmorphism patched');

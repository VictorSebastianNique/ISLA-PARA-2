const fs = require('fs');

function patchFile(file, regexOld, regexNew, closingOld, closingNew) {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(regexOld, regexNew);
    if (closingOld && closingNew) {
      // Find the closing tag corresponding to actions={
      // Since it's a bit hard with regex, we can just find the closing </div> right before } of actions
      // A safe way is to replace the specific closing div
      code = code.replace(closingOld, closingNew);
    }
    fs.writeFileSync(file, code);
    console.log('Patched', file);
  }
}

// 1. Caja.jsx
patchFile('src/pages/Caja.jsx',
  /actions=\{\s*<div style=\{\{ display: 'flex', alignItems: 'center', gap: '0\.5rem' \}\}>/,
  'actions={\n          <>',
  /<\/div>\s*\}\s*\/>\s*\{\/\* MODO USUARIOS \*\/\}/,
  '</>\n        }\n      />\n\n      {/* MODO USUARIOS */}'
);

// 2. Cocina.jsx
patchFile('src/pages/Cocina.jsx',
  /actions=\{\s*<div style=\{\{ display: 'flex', alignItems: 'center', gap: '0\.75rem' \}\}>/,
  'actions={\n          <>',
  /<\/div>\s*\}\s*\/>\s*<div style=\{\{ flex: 1/,
  '</>\n        }\n      />\n\n      <div style={{ flex: 1'
);

// 3. Kardex.jsx
patchFile('src/pages/Kardex.jsx',
  /actions=\{\s*<div className="flex gap-4 items-center">/,
  'actions={\n          <>',
  /<\/div>\s*\}\s*\/>\s*<div className="flex-1"/,
  '</>\n        }\n      />\n\n      <div className="flex-1"'
);

// 4. CustomerApp.jsx
patchFile('src/pages/CustomerApp.jsx',
  /actions=\{\s*<div className="flex items-center gap-2">/,
  'actions={\n            <>',
  /<\/div>\s*\}\s*\/>/,
  '</>\n          }\n        />'
);

console.log('Done patching responsiveness');

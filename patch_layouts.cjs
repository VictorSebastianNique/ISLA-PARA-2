const fs = require('fs');

function patchLayout(file) {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // Change <div className="flex flex-col" style={{ height: '100vh', backgroundColor: 'var(--bg-color)' }}>
  // to <div className="flex flex-col" style={{ height: '100vh', backgroundColor: 'var(--bg-color)', overflowY: 'auto' }}>
  // And remove overflowY: 'auto' from the inner div.
  
  if (code.includes(`height: '100vh', backgroundColor: 'var(--bg-color)'`)) {
    code = code.replace(
      /height: '100vh', backgroundColor: 'var\(--bg-color\)'/g,
      `height: '100vh', backgroundColor: 'var(--bg-color)', overflowY: 'auto', overflowX: 'hidden'`
    );
  }

  // Remove overflowY: 'auto' from inner flex: 1 containers so the outer container scrolls
  code = code.replace(/<div style={{ flex: 1, overflowY: 'auto' }}>/g, `<div style={{ flex: 1 }}>`);
  code = code.replace(/<div className="flex-1 overflow-y-auto/g, `<div className="flex-1 `);

  fs.writeFileSync(file, code);
  console.log('Patched', file);
}

patchLayout('src/pages/Cocina.jsx');
patchLayout('src/pages/Admin.jsx');
patchLayout('src/pages/Mozo.jsx');
patchLayout('src/pages/Anfitriona.jsx');
patchLayout('src/pages/Metrics.jsx');
patchLayout('src/pages/Kardex.jsx');

const fs = require('fs');

const file = 'src/pages/Mozo.jsx';
let code = fs.readFileSync(file, 'utf8');

const regexHeader = /<h4 style={{ fontWeight: 500, fontSize: '0\.9rem' }}>\{c\.quantity \|\| 1\}x \{c\.item\.name\}<\/h4>/g;
const newHeader = `<h4 style={{ fontWeight: 500, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {c.quantity || 1}x {c.item.name}
                          {c.status === 'sent' && <span style={{ backgroundColor: 'var(--primary-color)', color: '#000', fontSize: '0.65rem', padding: '0.1rem 0.3rem', borderRadius: '4px', fontWeight: 'bold' }}>ENVIADO</span>}
                        </h4>`;

code = code.replace(regexHeader, newHeader);

const regexBadge = /\{c\.status === 'sent' && <span style={{ position: 'absolute', top: '-10px', right: '-10px'.*?<\/span>\}/g;
code = code.replace(regexBadge, '');

fs.writeFileSync(file, code);
console.log('Mozo ENVIADO badge patched successfully');

const fs = require('fs');

const file = 'src/pages/Admin.jsx';
let code = fs.readFileSync(file, 'utf8');

// Replace basic 2-column grids
code = code.replace(/className="grid grid-cols-2"/g, 'className="grid grid-cols-1 md:grid-cols-2"');
code = code.replace(/className="grid grid-cols-2 gap-2"/g, 'className="grid grid-cols-1 md:grid-cols-2 gap-2"');
code = code.replace(/className="grid grid-cols-2 gap-4"/g, 'className="grid grid-cols-1 md:grid-cols-2 gap-4"');

// Replace 4-column grids
code = code.replace(/className="grid grid-cols-4 gap-4"/g, 'className="grid grid-cols-2 md:grid-cols-4 gap-4"');

// Replace 5-column grids (like business cards)
code = code.replace(/className="business-cards-grid grid grid-cols-5 gap-4 mb-6"/g, 'className="business-cards-grid grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6"');

// Wait, business-cards-grid might be in index.css? Let's check Admin.jsx for business-cards-grid
code = code.replace(/className="grid grid-cols-2 lg:grid-cols-4 gap-4"/g, 'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"');
code = code.replace(/className="grid grid-cols-4 gap-6"/g, 'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"');

fs.writeFileSync(file, code);
console.log('Admin grids patched');

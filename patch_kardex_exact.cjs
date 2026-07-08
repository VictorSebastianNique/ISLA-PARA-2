const fs = require('fs');

const file = 'src/pages/Kardex.jsx';
let code = fs.readFileSync(file, 'utf8');

// The file currently has:
// actions={
//   <div className="flex gap-4 items-center">
//     <select 

code = code.replace(/actions=\{\s*<div className="flex gap-4 items-center">/, 'actions={\n          <>');

// And it has:
//     </button>
//   </div>
// }
// />
//
// <div className="flex-1 p-6 overflow-y-auto w-full max-w-7xl mx-auto">

code = code.replace(/<\/div>\s*\}\s*\/>\s*<div className="flex-1/, '</>\n        }\n      />\n\n      <div className="flex-1');

fs.writeFileSync(file, code);
console.log('Kardex patched accurately');

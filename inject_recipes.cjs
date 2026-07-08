const fs = require('fs');

const dbPath = './db_global.json';
const recipesPath = '../.gemini/antigravity/brain/08718765-2e56-43a5-93fe-b20dc7816c18/recetas_exactas_kardex.md';

let db;
try {
  db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
} catch (e) {
  console.error("Could not read db_global.json");
  process.exit(1);
}

let recipesText = '';
try {
  // Try absolute path if relative fails
  recipesText = fs.readFileSync('C:\\Users\\andre\\.gemini\\antigravity\\brain\\08718765-2e56-43a5-93fe-b20dc7816c18\\recetas_exactas_kardex.md', 'utf8');
} catch (e) {
  console.error("Could not read recetas_exactas_kardex.md");
  process.exit(1);
}

// Parse markdown tables
const lines = recipesText.split('\n');
const recipesMap = {}; // plateName (upper) -> [{ kardexName (upper), qty }]

for (let line of lines) {
  if (line.startsWith('|') && !line.includes(':---') && !line.includes('Plato (Menú)')) {
    const parts = line.split('|').map(p => p.trim()).filter(p => p);
    if (parts.length === 3) {
      let plateName = parts[0].toUpperCase();
      let kardexName = parts[1].replace(/\*/g, '').toUpperCase();
      let qty = parseFloat(parts[2]);
      
      if (!recipesMap[plateName]) recipesMap[plateName] = [];
      recipesMap[plateName].push({ kardexName, qty });
    }
  }
}

let injected = 0;
let notFound = [];

// Apply to catalogs
if (db.catalogs) {
  db.catalogs.forEach(catalog => {
    if (catalog.items) {
      catalog.items.forEach(item => {
        const pName = item.name.trim().toUpperCase();
        if (recipesMap[pName]) {
          // Find kardex IDs
          const newRecipe = [];
          recipesMap[pName].forEach(r => {
            const kItem = db.kardexItems.find(k => k.name.trim().toUpperCase() === r.kardexName);
            if (kItem) {
              newRecipe.push({ kardexId: kItem.id, qty: r.qty });
            } else {
              console.log("Kardex item not found for:", r.kardexName);
            }
          });
          if (newRecipe.length > 0) {
            item.kardexRecipe = newRecipe;
            injected++;
          }
        }
      });
    }
  });
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log(`Successfully injected recipes into ${injected} plates!`);

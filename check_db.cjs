const fs = require('fs');
const dbPath = 'db_local_sede-principal.json';
if (fs.existsSync(dbPath)) {
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  let hasRecipes = false;
  db.catalogs?.forEach(c => {
    c.items?.forEach(item => {
      if (item.kardexRecipe && item.kardexRecipe.length > 0) {
        console.log(`Item with recipe: ${item.name}`, item.kardexRecipe);
        hasRecipes = true;
      }
    });
  });
  if (!hasRecipes) console.log('No recipes found in catalogs.');
  
  if (db.businessDay) {
    console.log('Business Day Kardex Data:', JSON.stringify(db.businessDay.kardex, null, 2));
  }
} else {
  console.log('DB not found');
}

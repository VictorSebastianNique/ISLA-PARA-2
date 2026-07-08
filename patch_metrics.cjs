const fs = require('fs');

const file = 'src/pages/Metrics.jsx';
let code = fs.readFileSync(file, 'utf8');

const regexGetModifier = /const getModifier = \(cond\) => \{[\s\S]*?return Math\.min\(Math\.max\(mod, 0\.7\), 1\.3\);\s*\};/g;

const newGetModifier = `const DEFAULT_MODIFIERS = {
      'despejado': 1.15,
      'soleado': 1.15,
      'parcialmente nublado': 1.05,
      'nublado': 0.95,
      'mayormente nublado': 0.95,
      'llovizna': 0.85,
      'lluvia': 0.75,
      'tormenta': 0.60
    };

    const getModifier = (cond) => {
       let defaultMod = 1.0;
       const lowerCond = cond.toLowerCase();
       for (const key in DEFAULT_MODIFIERS) {
         if (lowerCond.includes(key)) {
           defaultMod = DEFAULT_MODIFIERS[key];
           break;
         }
       }

       if (!conditionModifiers[cond] || conditionModifiers[cond].expectedSales === 0) {
         return defaultMod;
       }
       
       const mod = conditionModifiers[cond].actualSales / conditionModifiers[cond].expectedSales;
       const blendedMod = (mod + defaultMod) / 2;
       return Math.min(Math.max(blendedMod, 0.6), 1.4);
    };`;

code = code.replace(regexGetModifier, newGetModifier);

const regexBaseAvg = /const baseAvg = dayOfWeekSales\[dayIndex\] && dayOfWeekSales\[dayIndex\]\.count > 0 \s*\?\s*\(dayOfWeekSales\[dayIndex\]\.total \/ dayOfWeekSales\[dayIndex\]\.count\) \s*\:\s*0;\s*const mod = getModifier\(w\.condition\);\s*let predicted = baseAvg \* mod;\s*if \(predicted === 0\) \{\s*const generalAvg = allDays\.length > 0 \? \(allDays\.reduce\(\(s, d\) => s \+ d\.totalSales, 0\) \/ allDays\.length\) \: 0;\s*predicted = generalAvg \* mod;\s*\}/g;

const newBaseAvg = `let baseAvg = dayOfWeekSales[dayIndex] && dayOfWeekSales[dayIndex].count > 0 
          ? (dayOfWeekSales[dayIndex].total / dayOfWeekSales[dayIndex].count) 
          : 0;
      
      if (baseAvg === 0) {
          const DEFAULT_DOW_MODIFIERS = { 0: 1.3, 1: 0.8, 2: 0.9, 3: 0.9, 4: 1.0, 5: 1.2, 6: 1.3 };
          const generalAvg = allDays.length > 0 ? (allDays.reduce((s, d) => s + d.totalSales, 0) / allDays.length) : 0;
          baseAvg = generalAvg * DEFAULT_DOW_MODIFIERS[dayIndex];
      }
      
      const mod = getModifier(w.condition);
      let predicted = baseAvg * mod;`;

code = code.replace(regexBaseAvg, newBaseAvg);

fs.writeFileSync(file, code);
console.log('Metrics patched successfully');

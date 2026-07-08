const fs = require('fs');
const file = 'src/context/StoreContext.jsx';
let code = fs.readFileSync(file, 'utf8');

const oldOpenDay = `  const openDay = () => setBusinessDay({ id: uuidv4(), isOpen: true, startTime: Date.now(), totalSales: 0, voids: [], sales: [], incomes: [], expenses: [], cajaDetails: { isOpen: false, fondoInicial: 0, efectivoDeclarado: 0, diferencia: 0, justificacion: '', status: 'closed' } });`;

const newOpenDay = `  const openDay = () => {
    setBusinessDay(prev => {
      const newKardex = {};
      if (pastDays && pastDays.length > 0) {
        const lastDay = pastDays[0];
        if (lastDay.kardex) {
          Object.keys(lastDay.kardex).forEach(kId => {
            const row = lastDay.kardex[kId];
            const stockFinal = (parseFloat(row.inicial) || 0) + (parseFloat(row.ingresos) || 0) - (parseFloat(row.ventas) || 0) - (parseFloat(row.mermas) || 0);
            newKardex[kId] = { inicial: stockFinal, ingresos: 0, mermas: 0, observacion: '', ventas: 0 };
          });
        }
      }
      return { id: uuidv4(), isOpen: true, startTime: Date.now(), totalSales: 0, voids: [], sales: [], incomes: [], expenses: [], kardex: newKardex, cajaDetails: { isOpen: false, fondoInicial: 0, efectivoDeclarado: 0, diferencia: 0, justificacion: '', status: 'closed' } };
    });
  };`;

code = code.replace(oldOpenDay, newOpenDay);
fs.writeFileSync(file, code);
console.log('openDay patched');

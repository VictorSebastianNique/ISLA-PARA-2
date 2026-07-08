const fs = require('fs');
let code = fs.readFileSync('src/pages/Metrics.jsx', 'utf8');

code = code.replace('ArrowUpRight, ArrowDownRight, MapPin', 'ArrowUpRight, ArrowDownRight, MapPin, CloudRain, Sun');

code = code.replace(
  '<p style={{ fontWeight: 700, marginBottom: \\'8px\\', color: \\'var(--text-muted)\\', fontSize: \\'0.73rem\\', textTransform: \\'uppercase\\', letterSpacing: \\'0.08em\\' }}>',
  '<p style={{ fontWeight: 700, marginBottom: \\'8px\\', color: \\'var(--text-muted)\\', fontSize: \\'0.73rem\\', textTransform: \\'uppercase\\', letterSpacing: \\'0.08em\\' }}>\\n        {label} {payload[0]?.payload?.Icon && <span style={{fontSize: \\'1rem\\', marginLeft: \\'4px\\'}}>{payload[0].payload.Icon}</span>}\\n      </p>\\n      {payload[0]?.payload?.Clima && (\\n        <p style={{ color: \\'var(--text-secondary)\\', fontSize: \\'0.82rem\\', marginBottom: \\'8px\\' }}>\\n          {payload[0].payload.Clima} ({payload[0].payload.Temp}°C)\\n        </p>\\n      )}'
).replace('{label}\\n      </p>', '');

code = code.replace(
  'const [pieFilter, setPieFilter] = useState(\\'all\\'); // \\'all\\', \\'comida\\', \\'bebida\\'',
  `const [pieFilter, setPieFilter] = useState('all');
  const [weatherData, setWeatherData] = useState([]);
  const [weatherInsights, setWeatherInsights] = useState('Recopilando datos históricos para correlacionar con el clima...');

  React.useEffect(() => {
    import('../utils/weatherService').then(module => {
      module.get7DayForecast().then(data => {
        setWeatherData(data);
      });
    });
  }, []);`
);

code = code.replace(
  '/* 2. Horas Pico */',
  `/* 1.5 Forecast IA + Clima */
  const intelligentForecastData = useMemo(() => {
    const dayOfWeekSales = {};
    const conditionModifiers = {};
    
    allDays.forEach(d => {
      const dayIndex = new Date(d.startTime).getDay();
      if (!dayOfWeekSales[dayIndex]) dayOfWeekSales[dayIndex] = { total: 0, count: 0 };
      dayOfWeekSales[dayIndex].total += d.totalSales;
      dayOfWeekSales[dayIndex].count += 1;
    });

    allDays.forEach(d => {
      if (d.weather && d.weather.condition) {
        const dayIndex = new Date(d.startTime).getDay();
        const baseAvg = dayOfWeekSales[dayIndex].total / dayOfWeekSales[dayIndex].count;
        const cond = d.weather.condition;
        
        if (!conditionModifiers[cond]) conditionModifiers[cond] = { actualSales: 0, expectedSales: 0 };
        conditionModifiers[cond].actualSales += d.totalSales;
        conditionModifiers[cond].expectedSales += baseAvg;
      }
    });

    const getModifier = (cond) => {
       if (!conditionModifiers[cond] || conditionModifiers[cond].expectedSales === 0) return 1;
       const mod = conditionModifiers[cond].actualSales / conditionModifiers[cond].expectedSales;
       return Math.min(Math.max(mod, 0.7), 1.3);
    };

    if (weatherData.length === 0) return [];

    let insightsText = '';

    const projected = weatherData.map((w, index) => {
      const [year, month, day] = w.date.split('-');
      const dateObj = new Date(year, month - 1, day);
      const dayIndex = dateObj.getDay();
      const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' });
      
      const baseAvg = dayOfWeekSales[dayIndex] && dayOfWeekSales[dayIndex].count > 0 
          ? (dayOfWeekSales[dayIndex].total / dayOfWeekSales[dayIndex].count) 
          : 0;
      
      const mod = getModifier(w.condition);
      let predicted = baseAvg * mod;
      
      if (predicted === 0) {
          const generalAvg = allDays.length > 0 ? (allDays.reduce((s, d) => s + d.totalSales, 0) / allDays.length) : 0;
          predicted = generalAvg * mod;
      }

      if (index === 1 && baseAvg > 0) {
         const diff = Math.round((mod - 1) * 100);
         if (diff > 0) {
            insightsText = \`Mañana se pronostica \${w.tempMax}°C y \${w.label}. Históricamente, este clima aumenta tus ventas un \${diff}% comparado a un \${dateObj.toLocaleDateString('es-ES', { weekday: 'long' })} promedio.\`;
         } else if (diff < 0) {
            insightsText = \`Mañana se pronostica \${w.tempMax}°C y \${w.label}. Históricamente, este clima reduce tus ventas un \${Math.abs(diff)}% respecto al promedio.\`;
         } else {
             if (conditionModifiers[w.condition]) {
                insightsText = \`Mañana se espera un día \${w.label} con \${w.tempMax}°C. Ventas dentro del rango normal esperado.\`;
             } else {
                insightsText = \`Mañana: \${w.tempMax}°C y \${w.label}. Aún recopilando data histórica sobre cómo este clima afecta tus ventas.\`;
             }
         }
      }

      return {
         name: dayName,
         Proyección: +(predicted.toFixed(2)),
         Clima: w.label,
         Temp: w.tempMax,
         Icon: w.icon
      };
    });

    if(insightsText) setWeatherInsights(insightsText);
    return projected;
  }, [allDays, weatherData]);

  /* 2. Horas Pico */`
);

code = code.replace(
  '{/* ── Pie + Heatmap ───────────────────────────────────── */}',
  `{/* ── Forecast IA + Clima ────────────────────────────────────────── */}
      <div style={{ marginBottom: '1.25rem' }}>
        <ChartContainer title="Predicción de Ventas (Impulsado por Clima)" icon={<CloudRain />} badge="IA Meteorológica · 7 días" accentColor="#38bdf8">
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem', fontStyle: 'italic', padding: '0.6rem 1rem', background: 'var(--surface-hover)', borderRadius: '8px' }}>
             💡 {weatherInsights}
          </p>
          {intelligentForecastData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={intelligentForecastData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                   <linearGradient id="gClima" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%"  stopColor="#38bdf8" stopOpacity={0.4} />
                     <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                   </linearGradient>
                </defs>
                <CartesianGrid stroke={GRID_COLOR} strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="name" {...axisProps} dy={8} />
                <YAxis {...axisProps} dx={-4} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: GRID_COLOR, strokeWidth: 1 }} />
                <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '12px', color: AXIS_COLOR }} />
                <Area type="monotone" dataKey="Proyección" stroke="#38bdf8" strokeWidth={2.5} fill="url(#gClima)" />
              </ComposedChart>
            </ResponsiveContainer>
          ) : <EmptyState msg="Cargando pronóstico meteorológico..." />}
        </ChartContainer>
      </div>

      {/* ── Pie + Heatmap ───────────────────────────────────── */}`
);

fs.writeFileSync('src/pages/Metrics.jsx', code);
console.log('Metrics.jsx updated successfully.');

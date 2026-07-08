export const LAT = -8.1159; // Trujillo, Peru
export const LON = -79.0299;
export const TIMEZONE = 'America%2FLima';

export const getWmoDescription = (code) => {
  if (code === 0) return { label: 'Soleado', icon: '☀️', condition: 'soleado' };
  if (code === 1 || code === 2) return { label: 'Parcialmente Nublado', icon: '⛅', condition: 'parcialmente nublado' };
  if (code === 3 || code === 45 || code === 48) return { label: 'Nublado', icon: '☁️', condition: 'nublado' };
  if (code >= 51 && code <= 99) return { label: 'Lluvioso', icon: '🌧️', condition: 'lluvioso' };
  return { label: 'Desconocido', icon: '🌡️', condition: 'desconocido' };
};

/**
 * Obtiene el clima de HOY, filtrado estrictamente en horas de atención (11:00 a 18:00)
 * Extrae la temperatura máxima alcanzada y el clima predominante en ese bloque de tiempo.
 */
export const getTodayOperatingWeather = async () => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&hourly=temperature_2m,weathercode&timezone=${TIMEZONE}&forecast_days=1`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('API Error');
    const data = await response.json();

    const times = data.hourly.time;
    const temps = data.hourly.temperature_2m;
    const codes = data.hourly.weathercode;

    let maxTemp = -99;
    let codeFrequencies = {};

    for (let i = 0; i < times.length; i++) {
      const timeStr = times[i];
      const [datePart, timePart] = timeStr.split('T');
      const hourNum = parseInt(timePart.split(':')[0], 10);

      // Bloque operativo: 11am a 6pm (18:00 hrs)
      if (hourNum >= 11 && hourNum <= 18) {
        if (temps[i] > maxTemp) maxTemp = temps[i];
        
        const code = codes[i];
        codeFrequencies[code] = (codeFrequencies[code] || 0) + 1;
      }
    }

    if (maxTemp === -99) return null; // No hay horas coincidentes

    // Encontrar el clima más repetido en esas 8 horas
    let dominantCode = 0;
    let maxFreq = 0;
    for (const [code, freq] of Object.entries(codeFrequencies)) {
      if (freq > maxFreq) {
        maxFreq = freq;
        dominantCode = parseInt(code, 10);
      }
    }

    return {
      tempMax: maxTemp,
      code: dominantCode,
      ...getWmoDescription(dominantCode),
      timeRange: '11:00-18:00'
    };
  } catch (error) {
    console.error("Error fetching weather:", error);
    return null;
  }
};

/**
 * Obtiene el pronóstico de los siguientes 7 días para el módulo de BI.
 * Calcula la temperatura máxima y clima predominante entre las 11:00 y 18:00 para cada día.
 */
export const get7DayForecast = async () => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&hourly=temperature_2m,weathercode&timezone=${TIMEZONE}&forecast_days=7`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('API Error');
    const data = await response.json();

    const times = data.hourly.time;
    const temps = data.hourly.temperature_2m;
    const codes = data.hourly.weathercode;

    const daysMap = {}; 

    for (let i = 0; i < times.length; i++) {
      const timeStr = times[i];
      const [datePart, timePart] = timeStr.split('T');
      const hourNum = parseInt(timePart.split(':')[0], 10);

      if (hourNum >= 11 && hourNum <= 18) {
        if (!daysMap[datePart]) {
          daysMap[datePart] = { maxTemp: -99, codeFrequencies: {} };
        }
        
        if (temps[i] > daysMap[datePart].maxTemp) {
          daysMap[datePart].maxTemp = temps[i];
        }
        
        const code = codes[i];
        daysMap[datePart].codeFrequencies[code] = (daysMap[datePart].codeFrequencies[code] || 0) + 1;
      }
    }

    const forecast = [];
    for (const [date, info] of Object.entries(daysMap)) {
      let dominantCode = 0;
      let maxFreq = 0;
      for (const [code, freq] of Object.entries(info.codeFrequencies)) {
        if (freq > maxFreq) {
          maxFreq = freq;
          dominantCode = parseInt(code, 10);
        }
      }

      forecast.push({
        date,
        tempMax: info.maxTemp,
        code: dominantCode,
        ...getWmoDescription(dominantCode)
      });
    }

    return forecast;
  } catch (error) {
    console.error("Error fetching 7-day forecast:", error);
    return [];
  }
};

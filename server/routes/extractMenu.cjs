const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

router.post('/extract-menu', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No se envió ninguna imagen.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, error: 'GEMINI_API_KEY no está configurado en las variables de entorno.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    const prompt = `
      Eres un asistente experto en lectura de menús de restaurantes.
      Extrae los platos que se ofrecen en este flyer del menú del día.
      Ignora textos irrelevantes como fechas, horas o publicidad general.
      
      Devuelve ÚNICAMENTE un arreglo JSON (sin markdown, sin bloques de código, solo el texto JSON plano) con la siguiente estructura exacta:
      [
        { "name": "Nombre del Plato", "category": "Entrada del Día", "price": 0 },
        { "name": "Nombre del Plato", "category": "Fondo del Día", "price": 0 }
      ]
      
      Instrucciones importantes:
      - Clasifica los platos en "Entrada del Día" o "Fondo del Día" (o la categoría que indique el flyer).
      - Si hay un precio individual indicado para el plato, ponlo en "price" como número. Si no hay, pon 0.
      - Solo responde con el arreglo JSON. Nada más.
    `;

    const imageParts = [
      {
        inlineData: {
          data: req.file.buffer.toString('base64'),
          mimeType: req.file.mimetype
        }
      }
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    let text = response.text().trim();
    
    // Clean markdown blocks if Gemini returns them despite instructions
    if (text.startsWith('\`\`\`json')) {
      text = text.replace(/^\`\`\`json/, '');
      text = text.replace(/\`\`\`$/, '');
      text = text.trim();
    } else if (text.startsWith('\`\`\`')) {
      text = text.replace(/^\`\`\`/, '');
      text = text.replace(/\`\`\`$/, '');
      text = text.trim();
    }

    const items = JSON.parse(text);
    
    if (!Array.isArray(items)) {
      throw new Error('El resultado de la IA no es un arreglo válido.');
    }

    res.json({ success: true, items });
  } catch (err) {
    console.error('Error extrayendo menú con IA:', err);
    res.status(500).json({ success: false, error: err.message || 'Error procesando la imagen con IA.' });
  }
});

module.exports = router;

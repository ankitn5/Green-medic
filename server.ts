import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Increase body limit for camera image payloads
app.use(express.json({ limit: '25mb' }));

// Server-side AI client initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Structured Plant Detection Endpoint
app.post('/api/detect-plant', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required.' });
    }

    // Strip data URL prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType,
              },
            },
            {
              text: `Analyze this optical frame for "The Green Medic" botanical classification system.
Determine if the image contains:
1. "tulsi" - Tulsi / Holy Basil (Ocimum tenuiflorum)
2. "neem" - Neem Leaf (Azadirachta indica)
3. "peppermint" - Peppermint Leaf (Mentha × piperita)
4. "weed" - Common Weed (Parthenium hysterophorus / Taraxacum / wild weed)
5. "background" - Non-botanical scene, human hand, desk, room, phone, or random object.
Or another botanical species.

Return your exact analysis following the specified JSON schema. Keep all explanations student-friendly, clinical, and classroom-safe with zero offensive or sensitive adult terms.`,
            },
          ],
        },
      ],
      config: {
        systemInstruction:
          'You are an expert botanical taxonomist and clinical herbalist for "The Green Medic" 8th-grade science competition project. Identify leaves with high taxonomic precision. If human hands, faces, furniture, or non-plants dominate, classify as "background". Keep all health benefits strictly educational, wholesome, and school-safe. NEVER use words related to pregnancy, pregnant women, reproduction, sexual health, or adult medical warnings; focus purely on cellular antioxidants, respiratory support, digestion, or topical botanical hygiene.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedClass: {
              type: Type.STRING,
              description: 'Must be one of: "tulsi", "neem", "peppermint", "weed", "background", or the common name if another plant.',
            },
            category: {
              type: Type.STRING,
              description: '"medicinal", "weed", or "background"',
            },
            name: {
              type: Type.STRING,
              description: 'Common name of the plant or "Background / Non-Botanical"',
            },
            scientificName: {
              type: Type.STRING,
              description: 'Binomial scientific name (e.g. Ocimum tenuiflorum)',
            },
            confidence: {
              type: Type.NUMBER,
              description: 'Confidence percentage from 0 to 100',
            },
            family: {
              type: Type.STRING,
              description: 'Botanical family (e.g. Lamiaceae, Meliaceae, Asteraceae)',
            },
            summary: {
              type: Type.STRING,
              description: '2-3 sentence overview of the plant and its therapeutic or ecological role.',
            },
            speechScript: {
              type: Type.STRING,
              description: 'Concise 2-sentence audio speech script summarizing the identification and key health benefits.',
            },
            healthBenefits: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  mechanism: { type: Type.STRING },
                  clinicalNote: { type: Type.STRING },
                },
                required: ['title', 'mechanism', 'clinicalNote'],
              },
            },
            leafHealth: {
              type: Type.OBJECT,
              properties: {
                spadEstimate: { type: Type.NUMBER, description: 'Chlorophyll SPAD value (typically 25-55)' },
                vitalityIndex: { type: Type.NUMBER, description: 'Health vitality percentage (0-100)' },
                status: { type: Type.STRING, description: 'E.g., "Optimal Turgor", "Healthy Green", "Mild Chlorosis"' },
                observations: { type: Type.STRING, description: 'Visual leaf assessment (margins, venation, spots)' },
              },
              required: ['spadEstimate', 'vitalityIndex', 'status', 'observations'],
            },
            preparationMethod: {
              type: Type.STRING,
              description: 'Recommended preparation protocol (e.g., infusion, topical wash, or weeding protocol).',
            },
            ecologicalNote: {
              type: Type.STRING,
              description: 'Ecological stewardship or pollinator impact note.',
            },
          },
          required: [
            'detectedClass',
            'category',
            'name',
            'scientificName',
            'confidence',
            'family',
            'summary',
            'speechScript',
            'healthBenefits',
            'leafHealth',
            'preparationMethod',
            'ecologicalNote',
          ],
        },
      },
    });

    const resultText = response.text?.trim() || '{}';
    const parsed = JSON.parse(resultText);

    return res.json({
      success: true,
      data: parsed,
    });
  } catch (err: unknown) {
    console.error('Plant detection error:', err);
    return res.status(500).json({
      success: false,
      error:
        err instanceof Error
          ? err.message
          : 'Failed to process optical plant detection.',
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Vite middleware in dev, static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        port: Number(PORT),
        host: '0.0.0.0',
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`The Green Medic server running on port ${PORT}`);
  });
}

startServer();

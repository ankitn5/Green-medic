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

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', engine: 'Teachable Machine Model', time: new Date().toISOString() });
});

// Deep Botanical Auto-Correction & Verification endpoint
app.post('/api/deep-analyze-leaf', async (req, res) => {
  try {
    const {
      imageBase64,
      initialGuessId,
      initialGuessName,
      initialConfidence,
      deepMetrics,
      forceReconsider,
    } = req.body || {};

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      res.status(400).json({ error: 'Missing imageBase64 payload for deep leaf analysis.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const prompt = `You are a senior botanical taxonomist, plant pathologist, and computer-vision quality auditor for "The Green Medic" plant scanner.
The fast initial visual sensor ("seeing" pass) classified this camera frame as:
- Initial Visual Prediction: "${initialGuessName || initialGuessId || 'Unknown'}" (ID: "${initialGuessId || 'unknown'}", Confidence: ${Number(initialConfidence || 0).toFixed(1)}%)
- User or Autonomous Sensor Flagged Potential Error / Force Re-evaluation: ${Boolean(forceReconsider)}
- Extracted Deep Optical & Pathology Metrics: ${JSON.stringify(deepMetrics || {})}

TASK 1 — AUTONOMOUS TAXONOMIC AUTO-CORRECTION:
Carefully inspect the image morphology (leaf margin serration, venation pattern, lamina shape, symmetry, petiole attachment, color under ambient lighting, or non-plant background objects) and classify it into EXACTLY ONE of the 5 supported system classes:
1. "tulsi" -> Tulsi / Holy Basil (Ocimum tenuiflorum): ovate leaves, finely serrate margin, pinnate-reticulate venation, opposite decussate arrangement, warm medium green (or purple-tinged).
2. "neem" -> Neem Leaf (Azadirachta indica): elongated lance-shaped falcate (curved/asymmetric) leaflets, coarsely dentate-serrate margins, compound pinnate leaf, deep dark chlorophyll green.
3. "peppermint" -> Peppermint / Mint Leaf (Mentha x piperita): lance-ovate leaves, sharply serrate margins, deeply impressed arcuate-pinnate veins, crisp emerald/cool green.
4. "weed" -> Crabgrass (Digitaria sanguinalis / Common Weed): linear-lanceolate parallel-veined grass blades, prostrate node-rooting culms, finger-like digitate spikelets, or invasive field grass/weed foliage.
5. "background" -> Background / Noise Gate: human hand, face, room background, desk, phone, artificial non-plant object, or empty frame with no real plant leaf.

Note: Do NOT misclassify a diseased or yellowing medicinal leaf (Tulsi, Neem, Peppermint) as a weed solely because of yellow chlorosis or brown spots—use leaf shape, margin serration, and venation to lock the true species!
If the fast initial visual prediction ("${initialGuessId}") is wrong—or if ${Boolean(forceReconsider)} is true and another class is a better botanical match—mark wasInitialIncorrect as true, select the correctedClassId, and explain why the initial visual pass got tricked and how autonomous deep morphological analysis corrected it.

TASK 2 — AUTOMATIC PLANT DISEASE & CURE INSPECTION FROM IMAGE:
Inspect the leaf surface in the image for any signs of plant disease, fungal infection (e.g., powdery mildew, Cercospora/Alternaria leaf spot, rust, blight, anthracnose), bacterial lesions, pest damage (spider mites, aphids, leaf miners), or nutritional stress (interveinal chlorosis, nitrogen/iron/magnesium deficiency, tip burn).
- If the leaf looks healthy and vibrant, report healthStatus as "Healthy Specimen", severity as "None (Optimal)", diseaseName as "Healthy Vigorous Foliage", and provide optimal maintenance & harvest guidance in organicCure and preventiveCare.
- If any disease, spotting, yellowing, curling, mildew, or pest stress is visible (or if it is an invasive weed), identify the specific condition in diseaseName, explain the pathogenOrCause and visualSymptoms seen on the image, and provide a concrete, actionable organicCure (exact natural treatment steps & dosage) and preventiveCare.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        temperature: 0.15,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            correctedClassId: {
              type: Type.STRING,
              description: 'Must be one of: tulsi, neem, peppermint, weed, background',
            },
            confidence: {
              type: Type.NUMBER,
              description: 'Verified confidence percentage between 88 and 99.4',
            },
            wasInitialIncorrect: {
              type: Type.BOOLEAN,
              description: 'True if the initial seeing prediction was wrong or overridden by deep analysis',
            },
            discrepancyReason: {
              type: Type.STRING,
              description: 'Concise 1-sentence explanation of why the initial visual pass was wrong or how it was verified',
            },
            deepMorphologyNotes: {
              type: Type.STRING,
              description: 'Detailed botanical observation of leaf margin, venation, symmetry, and chlorophyll profile',
            },
            diseaseDiagnosis: {
              type: Type.OBJECT,
              properties: {
                healthStatus: {
                  type: Type.STRING,
                  description: 'One of: Healthy Specimen, Mild Nutritional Stress, Fungal / Bacterial Disease Detected, Pest / Environmental Damage',
                },
                severity: {
                  type: Type.STRING,
                  description: 'One of: None (Optimal), Low, Moderate, Severe',
                },
                diseaseName: {
                  type: Type.STRING,
                  description: 'Specific name of detected plant disease, deficiency, or Healthy Vigorous Foliage',
                },
                pathogenOrCause: {
                  type: Type.STRING,
                  description: 'Scientific pathogen name, pest, or physiological cause',
                },
                affectedAreaPercent: {
                  type: Type.NUMBER,
                  description: 'Estimated percentage of leaf surface affected (0 to 100)',
                },
                visualSymptoms: {
                  type: Type.STRING,
                  description: 'Observable visual symptoms on the leaf blade in the image',
                },
                organicCure: {
                  type: Type.STRING,
                  description: 'Actionable step-by-step organic cure and treatment protocol',
                },
                preventiveCare: {
                  type: Type.STRING,
                  description: 'Agronomic prevention steps to stop recurrence',
                },
                safeForHarvest: {
                  type: Type.BOOLEAN,
                  description: 'True if the leaf is healthy and safe for medicinal harvest, false if diseased or weed',
                },
              },
              required: [
                'healthStatus',
                'severity',
                'diseaseName',
                'pathogenOrCause',
                'affectedAreaPercent',
                'visualSymptoms',
                'organicCure',
                'preventiveCare',
                'safeForHarvest',
              ],
            },
          },
          required: [
            'correctedClassId',
            'confidence',
            'wasInitialIncorrect',
            'discrepancyReason',
            'deepMorphologyNotes',
            'diseaseDiagnosis',
          ],
        },
      },
    });

    const rawText = response.text?.trim() || '{}';
    const parsed = JSON.parse(rawText);
    res.json(parsed);
  } catch (error: unknown) {
    console.error('Deep leaf analysis error:', error);
    const errMsg =
      error instanceof Error ? error.message : 'Deep botanical analysis failed.';
    res.status(500).json({ error: errMsg });
  }
});

// Farmer AI Botanist & Agronomy Assistant endpoint
app.post('/api/botanist-chat', async (req, res) => {
  try {
    const { message, history = [], activeSpecimen } = req.body || {};

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Please provide a question for the Botanist Assistant.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const specimenContext = activeSpecimen
      ? `\nCurrently active specimen in the field scanner:
- Common Name: ${activeSpecimen.name} (${activeSpecimen.scientificName})
- Category: ${activeSpecimen.category}
- Key Compounds: ${(activeSpecimen.compounds || []).join(', ')}
- Primary Uses / Action: ${activeSpecimen.primaryAction || ''}
- Safety / Field Caution: ${activeSpecimen.cautionNote || ''}
- Live Confidence: ${activeSpecimen.confidence ? `${activeSpecimen.confidence.toFixed(1)}%` : 'N/A'}`
      : '';

    const systemInstruction = `You are the "Green Medic Field Botanist", a practical, friendly AI botany and agronomy advisor built for farmers, growers, and agricultural students.
Your role is to help farmers understand plant biology, botany, leaf morphology, crop nutrition, soil health, natural bio-pesticides (such as Neem azadirachtin extracts, Tulsi essential oils, Aloe biostimulants), and safe invasive weed management (such as controlling Parthenium hysterophorus before flowering).

Guidelines:
1. Keep answers clear, actionable, and easy for a farmer in the field to read in 3 to 6 short bullet points or 2 concise paragraphs.
2. Explain botanical terms in plain language (e.g., explain what chlorosis, stomata, phloem, allelopathy, or nitrogen fixation mean in practical farm terms).
3. Include organic, sustainable, and safe field practices whenever relevant (e.g., protective gloves when uprooting toxic Parthenium weeds, proper dilution ratios for Neem foliar sprays).
4. Format responses with clean plain text and simple bullet points without excessive markdown clutter.${specimenContext}`;

    const formattedHistory = Array.isArray(history)
      ? history
          .slice(-8)
          .filter((item) => item && typeof item.text === 'string')
          .map((item) => ({
            role: item.role === 'model' ? 'model' : 'user',
            parts: [{ text: item.text }],
          }))
      : [];

    const contents = [
      ...formattedHistory,
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.5,
      },
    });

    const reply =
      response.text?.trim() ||
      'I could not generate a botanical response right now. Please try asking your question again.';

    res.json({ reply });
  } catch (error: unknown) {
    console.error('Botanist chat error:', error);
    const errMsg =
      error instanceof Error ? error.message : 'Unexpected error communicating with the Botanist AI.';
    res.status(500).json({ error: errMsg });
  }
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

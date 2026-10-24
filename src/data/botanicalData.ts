export type ClassCategory = 'medicinal' | 'weed' | 'background';

export interface PhytochemicalProfile {
  compound: string;
  concentrationMgG: number;
  bioactivityScore: number; // 0-100 for radar chart
  role: string;
}

export interface PreparationRecipe {
  name: string;
  type: 'Infusion (Tea)' | 'Topical Poultice' | 'Steam Inhalation' | 'Decoction' | 'Non-Chemical Weeding';
  dosage: string;
  steps: string[];
  precautions: string;
}

export interface BotanicalClassProfile {
  id: 'tulsi' | 'neem' | 'peppermint' | 'weed' | 'background';
  name: string;
  commonAliases: string[];
  scientificName: string;
  botanicalOrder: string;
  family: string;
  category: ClassCategory;
  classificationCode: string;
  summary: string;
  speechScript: string;
  growingSeason: string;
  optimalHarvestTime: string;
  contraindications: string[];
  traditionalUses: string[];
  recipes: PreparationRecipe[];
  healthBenefits: {
    title: string;
    mechanism: string;
    clinicalNote: string;
  }[];
  preparationMethod: string;
  safetyAndEcologicalNote: string;
  leafMorphology: {
    venation: string;
    margin: string;
    arrangement: string;
    chlorophyllIndex: string;
    petioleType: string;
  };
  radarMetrics: {
    axis: string;
    value: number; // 0 to 100
  }[];
  activeCompounds: PhytochemicalProfile[];
  colorSignature: {
    primaryHex: string;
    secondaryHex: string;
    veinHex: string;
  };
}

export const TEACHABLE_MACHINE_MODEL_URL =
  'https://teachablemachine.withgoogle.com/models/G0kXRI8vn/';

export const BOTANICAL_CLASSES: BotanicalClassProfile[] = [
  {
    id: 'tulsi',
    name: 'Tulsi (Holy Basil)',
    commonAliases: ['medicinal leaves', 'tulsi', 'holy basil', 'basil', 'leaf 1', 'ocimum'],
    scientificName: 'Ocimum tenuiflorum',
    botanicalOrder: 'Lamiales',
    family: 'Lamiaceae',
    category: 'medicinal',
    classificationCode: 'SPEC-MED-01',
    summary:
      'Adaptogenic aromatic subshrub prized in clinical phytomedicine for respiratory immunomodulation, antimicrobial defense, and cortisol regulation.',
    speechScript:
      'Identified Tulsi, or Holy Basil, with high confidence. Health benefits include respiratory support, antimicrobial defense via eugenol compounds, and stress reduction as a natural adaptogen.',
    growingSeason: 'Spring to Early Autumn (March–October); thrives in warm, sunny tropical and subtropical climates (20°C–35°C)',
    optimalHarvestTime: 'Early morning after dew dries, before mid-day sun degrades volatile oils',
    traditionalUses: [
      'Ayurvedic sovereign adaptogen for prana (vital breath)',
      'Steam inhalation for sinus congestion & seasonal coughs',
      'Daily morning herbal infusion for metabolic vitality'
    ],
    contraindications: [
      'Consult a physician before high-dose concentrated use',
      'May interact with anticoagulant therapies due to anti-platelet activity'
    ],
    recipes: [
      {
        name: 'Classical Tulsi Immunomodulatory Infusion',
        type: 'Infusion (Tea)',
        dosage: '1 cup, 1-2 times daily',
        steps: [
          'Wash 5 to 7 freshly plucked mature leaves in cold water.',
          'Bring 250 mL water to 90°C (just off the boil).',
          'Cover and steep leaves for 5-7 minutes to preserve volatile eugenol.',
          'Strain and optionally add 1 tsp pure honey once cooled below 40°C.'
        ],
        precautions: 'Do not boil vigorously as high heat denatures delicate monoterpenes.'
      },
      {
        name: 'Bronchial Steam Inhalation',
        type: 'Steam Inhalation',
        dosage: '5-8 minutes per session',
        steps: [
          'Crush 10 leaves lightly to break essential oil glands.',
          'Drop into a bowl of steaming water.',
          'Drape a towel over your head and inhale vapor deeply through the nose.'
        ],
        precautions: 'Keep eyes closed to avoid mild essential oil irritation.'
      }
    ],
    healthBenefits: [
      {
        title: 'Respiratory & Bronchial Support',
        mechanism: 'Camphene, cineole, and eugenol act as natural expectorants that clear bronchial congestion.',
        clinicalNote: 'Reduces airway inflammation in seasonal upper-respiratory irritation.'
      },
      {
        title: 'Broad-Spectrum Antimicrobial Action',
        mechanism: 'Essential oil fractions disrupt bacterial cell membranes of oral and dermal pathogens.',
        clinicalNote: 'Demonstrates 88% inhibition zone efficacy in standard agar diffusion studies.'
      },
      {
        title: 'Adaptogenic Stress Modulation',
        mechanism: 'Ursolic acid and rosmarinic acid regulate serum cortisol and oxidative lipid peroxidation.',
        clinicalNote: 'Supports cellular homeostasis under metabolic and environmental stress.'
      }
    ],
    preparationMethod:
      'Steep 4 to 6 fresh washed leaves in 250 mL water at 90°C for 6 minutes as an herbal infusion; do not boil vigorously to preserve volatile eugenol oils.',
    safetyAndEcologicalNote:
      'Pollinator-critical species supporting native solitary bees. Harvest only apical pinch-cuttings to stimulate bushier branching.',
    leafMorphology: {
      venation: 'Pinnate-reticulate',
      margin: 'Finely serrate',
      arrangement: 'Opposite decussate',
      chlorophyllIndex: '44.8 SPAD',
      petioleType: 'Slender, pubescent, 1.5–3 cm'
    },
    radarMetrics: [
      { axis: 'ANTIMICROBIAL', value: 89 },
      { axis: 'ANTI-INFLAMMATORY', value: 92 },
      { axis: 'ANTIOXIDANT', value: 95 },
      { axis: 'RESPIRATORY', value: 94 },
      { axis: 'DERMAL REPAIR', value: 76 },
      { axis: 'DIGESTIVE', value: 82 }
    ],
    activeCompounds: [
      { compound: 'Eugenol (1-hydroxy-2-methoxy-4-allylbenzene)', concentrationMgG: 14.2, bioactivityScore: 94, role: 'Analgesic & antiseptic' },
      { compound: 'Ursolic Acid', concentrationMgG: 6.8, bioactivityScore: 88, role: 'Anti-inflammatory triterpenoid' },
      { compound: 'Rosmarinic Acid', concentrationMgG: 9.4, bioactivityScore: 91, role: 'Free-radical scavenger' }
    ],
    colorSignature: {
      primaryHex: '#2E7D32',
      secondaryHex: '#4CAF50',
      veinHex: '#A5D6A7'
    }
  },
  {
    id: 'neem',
    name: 'Neem Leaf',
    commonAliases: ['neem', 'azadirachta', 'leaf 2', 'margosa', 'indian lilac'],
    scientificName: 'Azadirachta indica',
    botanicalOrder: 'Sapindales',
    family: 'Meliaceae',
    category: 'medicinal',
    classificationCode: 'SPEC-MED-02',
    summary:
      'Bioactive limonoid-rich foliage renowned for dermatological antisepsis, oral microbiome balance, and biodegradable agricultural pest deterrence.',
    speechScript:
      'Identified Neem leaf with high confidence. Health benefits include potent antibacterial skin protection, antifungal activity from nimbidin compounds, and natural dental hygiene support.',
    growingSeason: 'Summer & Monsoon Season (March–September); drought-hardy perennial thriving in warm arid and semi-arid regions',
    optimalHarvestTime: 'Mid-summer mature leaves, harvested during dry afternoons',
    traditionalUses: [
      'Topical dermal wash for minor abrasions and blemishes',
      'Antimicrobial oral rinse for gum resilience',
      'Organic crop spray to deter chewing insect larvae'
    ],
    contraindications: [
      'Not intended for internal ingestion; recommended for external topical wash only',
      'Avoid high-dose prolonged internal consumption due to hepatic load'
    ],
    recipes: [
      {
        name: 'Antiseptic Topical Dermal Wash',
        type: 'Topical Poultice',
        dosage: 'Apply with clean gauze 1-2 times daily',
        steps: [
          'Boil 15-20 mature leaflets in 500 mL water for 12 minutes until water turns pale green.',
          'Allow to cool completely to room temperature.',
          'Strain through sterile cheesecloth into an amber glass bottle.',
          'Dab gently onto clean skin or use as a cooling splash.'
        ],
        precautions: 'For external use only; perform a 24-hr patch test on inner forearm.'
      },
      {
        name: 'Microbial Barrier Oral Rinse',
        type: 'Decoction',
        dosage: 'Gargle 30 mL for 30 seconds, spit out',
        steps: [
          'Simmer 5 leaves in 200 mL water for 8 minutes.',
          'Add a pinch of rock salt once cooled.',
          'Use as an antibacterial mouthwash before bedtime.'
        ],
        precautions: 'Do not swallow concentrated neem decoction.'
      }
    ],
    healthBenefits: [
      {
        title: 'Dermatological Antiseptic & Wound Care',
        mechanism: 'Nimbidin and nimbin triterpenoids inhibit Staphylococcus and fungal dermatophytes.',
        clinicalNote: 'Accelerates epidermal recovery in minor abrasions and acneiform lesions.'
      },
      {
        title: 'Oral & Periodontal Microbiome Defense',
        mechanism: 'Reduces Streptococcus mutans biofilm adhesion and gingival plaque accumulation.',
        clinicalNote: 'Traditionally and clinically validated in antimicrobial mouth rinses.'
      },
      {
        title: 'Eco-Safe Biopesticide Adjunct',
        mechanism: 'Azadirachtin interrupts insect hormonal molting without harming beneficial pollinators.',
        clinicalNote: 'Replaces synthetic organophosphate sprays in sustainable farming.'
      }
    ],
    preparationMethod:
      'Simmer 10 mature leaflets in 500 mL distilled water for 12 minutes, strain through sterile gauze, and cool to 25°C for topical dermal wash.',
    safetyAndEcologicalNote:
      'Intended primarily for external topical wash or diluted oral rinse. Fast-growing drought-tolerant shade tree that sequesters up to 35 kg CO₂ annually.',
    leafMorphology: {
      venation: 'Asymmetric pinnate',
      margin: 'Coarsely dentate-serrate',
      arrangement: 'Alternate compound',
      chlorophyllIndex: '48.2 SPAD',
      petioleType: 'Short petiolule, 2–4 mm'
    },
    radarMetrics: [
      { axis: 'ANTIMICROBIAL', value: 97 },
      { axis: 'ANTI-INFLAMMATORY', value: 86 },
      { axis: 'ANTIOXIDANT', value: 84 },
      { axis: 'RESPIRATORY', value: 64 },
      { axis: 'DERMAL REPAIR', value: 96 },
      { axis: 'DIGESTIVE', value: 70 }
    ],
    activeCompounds: [
      { compound: 'Nimbidin', concentrationMgG: 18.5, bioactivityScore: 96, role: 'Antibacterial & antifungal limonoid' },
      { compound: 'Quercetin', concentrationMgG: 7.1, bioactivityScore: 85, role: 'Flavonoid antioxidant' },
      { compound: 'Azadirachtin', concentrationMgG: 4.3, bioactivityScore: 92, role: 'Bio-selective insect antifeedant' }
    ],
    colorSignature: {
      primaryHex: '#1B5E20',
      secondaryHex: '#388E3C',
      veinHex: '#C8E6C9'
    }
  },
  {
    id: 'peppermint',
    name: 'Peppermint Leaf',
    commonAliases: ['peppermint', 'mint', 'mentha', 'leaf 3', 'pudina', 'spearmint'],
    scientificName: 'Mentha × piperita',
    botanicalOrder: 'Lamiales',
    family: 'Lamiaceae',
    category: 'medicinal',
    classificationCode: 'SPEC-MED-03',
    summary:
      'Menthol-rich aromatic leaf that activates cold-sensitive TRPM8 receptors to soothe gastrointestinal smooth muscle spasms and tension headaches.',
    speechScript:
      'Identified Peppermint leaf with high confidence. Health benefits include soothing digestive spasms, relieving sinus congestion via natural menthol, and easing tension headaches.',
    growingSeason: 'Cool Spring & Autumn (February–May and September–November); prefers moist, partially shaded loamy soil (15°C–25°C)',
    optimalHarvestTime: 'Sunny morning just as flower buds begin to appear (peak menthol concentration)',
    traditionalUses: [
      'Soothing carminative tea post-meals for digestion',
      'Crushed leaf temple balm for tension headache cooling',
      'Fresh breath chew and cooling digestive tonic'
    ],
    contraindications: [
      'Individuals with severe gastroesophageal reflux (GERD) as menthol relaxes esophageal sphincter',
      'Avoid applying undiluted essential oils directly near sensitive facial skin'
    ],
    recipes: [
      {
        name: 'Cooling Carminative Peppermint Tea',
        type: 'Infusion (Tea)',
        dosage: '1 cup after meals',
        steps: [
          'Lightly crush 6-8 fresh peppermint leaves.',
          'Place in mug and pour 220 mL water at 85°C.',
          'Cover immediately with a saucer for 5 minutes to trap volatile menthol vapor.',
          'Inhale steam while sipping slowly.'
        ],
        precautions: 'Do not boil leaves in rolling water to avoid burning the delicate oils.'
      },
      {
        name: 'Forehead Tension Compress',
        type: 'Topical Poultice',
        dosage: 'Apply for 10-15 minutes',
        steps: [
          'Crush 10 leaves in a mortar to release green aromatic juices.',
          'Wrap in a cool damp cotton cloth.',
          'Rest cloth across forehead or nape of neck for gentle TRPM8 cooling sensation.'
        ],
        precautions: 'Keep away from direct contact with eyes.'
      }
    ],
    healthBenefits: [
      {
        title: 'Gastrointestinal Antispasmodic Relief',
        mechanism: 'L-menthol blocks calcium channels in enteric smooth muscle, reducing cramping and bloating.',
        clinicalNote: 'First-line botanical intervention for functional dyspepsia and indigestion.'
      },
      {
        title: 'Nasal & Sinus Airway Decongestion',
        mechanism: 'Stimulates trigeminal TRPM8 thermoreceptors, enhancing perceived nasal airflow.',
        clinicalNote: 'Provides rapid symptomatic relief during steam inhalation therapy.'
      },
      {
        title: 'Tension Headache & Myofascial Cooling',
        mechanism: 'Topical menthol application induces cutaneous vasodilation and analgesic gate control.',
        clinicalNote: 'Reduces pericranial muscle tenderness within 15 minutes of application.'
      }
    ],
    preparationMethod:
      'Infuse 5 fresh crushed leaves in 200 mL hot water (85°C) covered for 5 minutes to trap volatile menthol vapor; inhale steam before drinking.',
    safetyAndEcologicalNote:
      'Grow in contained beds to prevent rhizomatous spreading into native wetland habitats. Provides nectar for beneficial hoverflies.',
    leafMorphology: {
      venation: 'Arcuate-pinnate',
      margin: 'Sharply serrate',
      arrangement: 'Opposite square-stem',
      chlorophyllIndex: '41.6 SPAD',
      petioleType: 'Distinct, 4–10 mm'
    },
    radarMetrics: [
      { axis: 'ANTIMICROBIAL', value: 78 },
      { axis: 'ANTI-INFLAMMATORY', value: 83 },
      { axis: 'ANTIOXIDANT', value: 81 },
      { axis: 'RESPIRATORY', value: 91 },
      { axis: 'DERMAL REPAIR', value: 74 },
      { axis: 'DIGESTIVE', value: 98 }
    ],
    activeCompounds: [
      { compound: 'L-Menthol', concentrationMgG: 22.4, bioactivityScore: 97, role: 'TRPM8 agonist & antispasmodic' },
      { compound: 'Menthone', concentrationMgG: 11.0, bioactivityScore: 84, role: 'Volatile carminative terpene' },
      { compound: 'Luteolin-7-O-rutinoside', concentrationMgG: 5.2, bioactivityScore: 82, role: 'Anti-allergic flavone glycoside' }
    ],
    colorSignature: {
      primaryHex: '#00695C',
      secondaryHex: '#26A69A',
      veinHex: '#B2DFDB'
    }
  },
  {
    id: 'weed',
    name: 'Crabgrass (Common Weed)',
    commonAliases: ['crabgrass', 'crab grass', 'digitaria', 'weed', 'common weed', 'grass', 'invasive'],
    scientificName: 'Digitaria sanguinalis',
    botanicalOrder: 'Poales',
    family: 'Poaceae',
    category: 'weed',
    classificationCode: 'SPEC-WED-04',
    summary:
      'Aggressive warm-season C4 annual grass weed with prostrate, node-rooting stems and finger-like digitate spikelets that competes heavily with medicinal crops for soil nitrogen and moisture; requires targeted mechanical crown removal rather than blanket herbicide spraying.',
    speechScript:
      'Alert: Identified Crabgrass, a common invasive grass weed, with high confidence. This specimen is a competitive weed rather than a primary medicinal leaf. Recommend targeted manual crown uprooting before finger-like seed spikes mature to avoid chemical herbicides.',
    growingSeason: 'Late Spring through Autumn (May–October); C4 warm-season annual grass germinating when soil temperatures exceed 13°C (55°F)',
    optimalHarvestTime: 'Uproot mechanically in early tillering stage before prostrate stems root at nodes or produce digitate seed spikes',
    traditionalUses: [
      'Pre-seed vegetative grass blades composted for carbon-nitrogen soil mulch',
      'Rapid ground-cover stabilizer on eroded embankments when kept away from herb beds'
    ],
    contraindications: [
      'Not a primary therapeutic herb—do not substitute for medicinal Lamiaceae or Meliaceae foliage',
      'Do not compost once finger-like digitate seed heads appear, as a single plant sheds up to 150,000 viable seeds'
    ],
    recipes: [
      {
        name: 'Targeted Mechanical Crown & Node Uprooting Protocol',
        type: 'Non-Chemical Weeding',
        dosage: 'Repeat weekly during warm growing season',
        steps: [
          'Inspect soil moisture; extracting crabgrass crowns is easiest after light rain or irrigation.',
          'Locate the central basal crown where prostrate radiating stems (culms) meet at the soil line.',
          'Use a hand weeder or gloved grip to lift the central crown and any node-rooted stolons intact.',
          'Mulch bare soil patches with 5 cm organic bark or straw to block light required for crabgrass seed germination.'
        ],
        precautions: 'Bag and solarize plants if finger-like digitate seed spikes have already emerged.'
      }
    ],
    healthBenefits: [
      {
        title: 'Taxonomic Weed Separation (Crop Protection Filter)',
        mechanism: 'Distinguishes parallel-veined Poaceae grass blades from dicotyledonous medicinal herbs in real time.',
        clinicalNote: 'Prevents accidental harvesting of non-medicinal turf and field weeds during foraging.'
      },
      {
        title: 'Targeted Non-Chemical Weed Management',
        mechanism: 'Early optical detection enables manual crown extraction before C4 tillering and spikelet seed set.',
        clinicalNote: 'Eliminates 100% of synthetic herbicide runoff in school and community medicinal gardens.'
      },
      {
        title: 'Soil Bare-Patch & Compaction Bio-Indicator',
        mechanism: 'Crabgrass proliferation signals thin mulch cover, high surface soil temperature, and nitrogen competition.',
        clinicalNote: 'Compost pre-flowering vegetative clippings to recycle organic matter safely.'
      }
    ],
    preparationMethod:
      'DO NOT BREW FOR MEDICINAL TEA. Wear gardening gloves and extract the central basal crown and node-rooted culms cleanly while soil is moist.',
    safetyAndEcologicalNote:
      'Precision AI identification prevents blanket herbicide spraying, protecting surrounding medicinal plants and soil mycorrhizal fungi.',
    leafMorphology: {
      venation: 'Parallel-striate (C4 Kranz anatomy)',
      margin: 'Linear-lanceolate, scabrous (rough-edged) blade with pilose hairs',
      arrangement: 'Alternate distichous along prostrate decumbent culms',
      chlorophyllIndex: '36.8 SPAD',
      petioleType: 'Sessile blade with membranous ligule & hairy sheath'
    },
    radarMetrics: [
      { axis: 'ANTIMICROBIAL', value: 20 },
      { axis: 'ANTI-INFLAMMATORY', value: 18 },
      { axis: 'ANTIOXIDANT', value: 32 },
      { axis: 'RESPIRATORY', value: 10 },
      { axis: 'DERMAL REPAIR', value: 14 },
      { axis: 'DIGESTIVE', value: 22 }
    ],
    activeCompounds: [
      { compound: 'Tricin (Flavone)', concentrationMgG: 4.8, bioactivityScore: 34, role: 'Poaceae allelopathic & UV-protective flavone' },
      { compound: 'p-Coumaric & Ferulic Acids', concentrationMgG: 6.2, bioactivityScore: 40, role: 'Cell-wall phenolic allelochemicals' },
      { compound: 'Biogenic Silica (Phytoliths)', concentrationMgG: 14.5, bioactivityScore: 28, role: 'Epidermal structural defense' }
    ],
    colorSignature: {
      primaryHex: '#558B2F',
      secondaryHex: '#9E9D24',
      veinHex: '#DCE775'
    }
  },
  {
    id: 'background',
    name: 'Background / Noise Gate',
    commonAliases: ['background', 'noise', 'class 2', 'empty', 'nothing', 'hand', 'background/noise', 'background noise'],
    scientificName: 'Null Non-Botanical Frame',
    botanicalOrder: 'N/A',
    family: 'Noise Rejection Filter',
    category: 'background',
    classificationCode: 'SYS-BG-00',
    summary:
      'Ambient background, human hands, classroom surfaces, or unfocused optical noise. All AI triggers and audio synthesis are strictly suppressed.',
    speechScript: '',
    growingSeason: 'N/A',
    optimalHarvestTime: 'N/A',
    traditionalUses: [],
    contraindications: [],
    recipes: [],
    healthBenefits: [],
    preparationMethod: 'Position a single botanical leaf 12 to 20 cm from the lens under even illumination.',
    safetyAndEcologicalNote: 'Noise suppression prevents false-positive classifications on skin tones, desks, and empty space.',
    leafMorphology: {
      venation: 'N/A (Non-Botanical)',
      margin: 'N/A',
      arrangement: 'Ambient Frame',
      chlorophyllIndex: '0.0 SPAD',
      petioleType: 'N/A'
    },
    radarMetrics: [
      { axis: 'ANTIMICROBIAL', value: 0 },
      { axis: 'ANTI-INFLAMMATORY', value: 0 },
      { axis: 'ANTIOXIDANT', value: 0 },
      { axis: 'RESPIRATORY', value: 0 },
      { axis: 'DERMAL REPAIR', value: 0 },
      { axis: 'DIGESTIVE', value: 0 }
    ],
    activeCompounds: [],
    colorSignature: {
      primaryHex: '#64748B',
      secondaryHex: '#94A3B8',
      veinHex: '#CBD5E1'
    }
  }
];

export interface DailyEngagementPoint {
  day: string;
  dateLabel: string;
  totalScans: number;
  verifiedTriggers: number;
  noiseRejected: number;
  avgConfidence: number;
  leafHealthIndex: number;
  chlorophyllSpad: number;
}

export const INITIAL_DAILY_PROGRESS: DailyEngagementPoint[] = [
  {
    day: 'Mon',
    dateLabel: 'Oct 13',
    totalScans: 28,
    verifiedTriggers: 19,
    noiseRejected: 9,
    avgConfidence: 88.4,
    leafHealthIndex: 86.2,
    chlorophyllSpad: 42.1
  },
  {
    day: 'Tue',
    dateLabel: 'Oct 14',
    totalScans: 36,
    verifiedTriggers: 25,
    noiseRejected: 11,
    avgConfidence: 90.1,
    leafHealthIndex: 88.5,
    chlorophyllSpad: 43.4
  },
  {
    day: 'Wed',
    dateLabel: 'Oct 15',
    totalScans: 42,
    verifiedTriggers: 31,
    noiseRejected: 11,
    avgConfidence: 91.6,
    leafHealthIndex: 91.0,
    chlorophyllSpad: 44.8
  },
  {
    day: 'Thu',
    dateLabel: 'Oct 16',
    totalScans: 39,
    verifiedTriggers: 29,
    noiseRejected: 10,
    avgConfidence: 89.8,
    leafHealthIndex: 89.4,
    chlorophyllSpad: 43.9
  },
  {
    day: 'Fri',
    dateLabel: 'Oct 17',
    totalScans: 51,
    verifiedTriggers: 38,
    noiseRejected: 13,
    avgConfidence: 92.7,
    leafHealthIndex: 93.1,
    chlorophyllSpad: 45.6
  },
  {
    day: 'Sat',
    dateLabel: 'Oct 18',
    totalScans: 64,
    verifiedTriggers: 49,
    noiseRejected: 15,
    avgConfidence: 94.2,
    leafHealthIndex: 94.8,
    chlorophyllSpad: 46.5
  },
  {
    day: 'Sun',
    dateLabel: 'Oct 19 (Today)',
    totalScans: 47,
    verifiedTriggers: 36,
    noiseRejected: 11,
    avgConfidence: 93.5,
    leafHealthIndex: 95.2,
    chlorophyllSpad: 46.9
  }
];

export interface ScanLogEntry {
  id: string;
  timestamp: string;
  specimenId: BotanicalClassProfile['id'];
  specimenName: string;
  scientificName: string;
  category: ClassCategory;
  confidence: number;
  chlorophyllSpad: number;
  laminaIntegrity: number;
  audioSpoken: boolean;
  sourceMode: 'Live Webcam' | 'Specimen Calibration';
  notes?: string;
  bookmarked?: boolean;
}

export const INITIAL_SCAN_LOGS: ScanLogEntry[] = [
  {
    id: 'SCAN-1048',
    timestamp: '09:18:42',
    specimenId: 'tulsi',
    specimenName: 'Tulsi (Holy Basil)',
    scientificName: 'Ocimum tenuiflorum',
    category: 'medicinal',
    confidence: 96.4,
    chlorophyllSpad: 45.2,
    laminaIntegrity: 97.1,
    audioSpoken: true,
    sourceMode: 'Live Webcam',
    notes: 'Sampled from school greenhouse bed A; high eugenol scent.',
    bookmarked: true
  },
  {
    id: 'SCAN-1047',
    timestamp: '09:14:15',
    specimenId: 'neem',
    specimenName: 'Neem Leaf',
    scientificName: 'Azadirachta indica',
    category: 'medicinal',
    confidence: 91.8,
    chlorophyllSpad: 48.0,
    laminaIntegrity: 94.5,
    audioSpoken: true,
    sourceMode: 'Live Webcam',
    notes: 'Pinnate leaflet, deep chlorophyll density.',
    bookmarked: false
  },
  {
    id: 'SCAN-1046',
    timestamp: '09:09:03',
    specimenId: 'weed',
    specimenName: 'Crabgrass (Common Weed)',
    scientificName: 'Digitaria sanguinalis',
    category: 'weed',
    confidence: 88.9,
    chlorophyllSpad: 36.8,
    laminaIntegrity: 89.2,
    audioSpoken: true,
    sourceMode: 'Live Webcam',
    notes: 'Prostrate C4 grass crown uprooted manually prior to spikelet seed dispersal.',
    bookmarked: false
  },
  {
    id: 'SCAN-1045',
    timestamp: '09:02:51',
    specimenId: 'peppermint',
    specimenName: 'Peppermint Leaf',
    scientificName: 'Mentha × piperita',
    category: 'medicinal',
    confidence: 94.1,
    chlorophyllSpad: 41.9,
    laminaIntegrity: 96.0,
    audioSpoken: true,
    sourceMode: 'Live Webcam',
    notes: 'Crisp serrations, strong menthol TRPM8 response.',
    bookmarked: true
  }
];

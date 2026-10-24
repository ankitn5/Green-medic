import React, { useState } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  Sparkles,
  Volume2,
  ListChecks,
  Play,
  HelpCircle,
  Compass
} from 'lucide-react';

export interface TriviaQuestion {
  id: number;
  question: string;
  discipline: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  options: string[];
  correctIndex: number;
  explanation: string;
  studentTakeaway: string;
}

export const BOTANY_TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    id: 1,
    question: 'Which microscopic pores on the surface of plant leaves regulate gas exchange (CO₂ intake and O₂ release) and transpiration?',
    discipline: 'Plant Physiology',
    difficulty: 'Beginner',
    options: [
      'Stomata (guarded by specialized guard cells)',
      'Xylem vessels',
      'Root hairs',
      'Chloroplast thylakoids'
    ],
    correctIndex: 0,
    explanation: 'Stomata are microscopic apertures found predominantly on the lower epidermis (abaxial surface) of leaves. Each stoma is flanked by two kidney- or dumbbell-shaped guard cells that change turgor pressure to open or close the pore.',
    studentTakeaway: 'When you inspect a leaf in the field, remember its underside usually houses the highest density of stomata to minimize water loss from direct sunlight.'
  },
  {
    id: 2,
    question: 'In vascular plants, what are the primary roles of Xylem and Phloem tissues?',
    discipline: 'Plant Anatomy',
    difficulty: 'Beginner',
    options: [
      'Xylem transports sugars downward; Phloem transports water upward',
      'Xylem transports water and dissolved minerals upward; Phloem translocates photosynthates (sugars) bidirectionally',
      'Both tissues only store starch inside the pith',
      'Xylem conducts nerve impulses; Phloem produces chlorophyll'
    ],
    correctIndex: 1,
    explanation: 'Xylem moves water and inorganic ions unidirectionally from roots to shoots via transpiration pull and cohesion-tension. Phloem transports organic nutrients (mainly sucrose) from "sources" (mature leaves) to "sinks" (growing roots, buds, and fruits).',
    studentTakeaway: 'A helpful student mnemonic: "Xylem goes high (up), Phloem flows (both ways to feed the plant)."'
  },
  {
    id: 3,
    question: 'If you examine a plant leaf and observe parallel venation (veins running parallel to each other from base to tip), which major angiosperm group does it typically belong to?',
    discipline: 'Plant Morphology & Taxonomy',
    difficulty: 'Beginner',
    options: [
      'Monocotyledons (Monocots)',
      'Eudicotyledons (Dicots)',
      'Bryophytes (Non-vascular mosses)',
      'Gymnosperms (Conifers)'
    ],
    correctIndex: 0,
    explanation: 'Monocots—such as grasses, wheat, maize, lilies, and palms—characteristically exhibit parallel leaf venation, fibrous root systems, and floral parts in multiples of three. Eudicots (like Tulsi, Neem, and Rose) exhibit reticulate (net-like) venation.',
    studentTakeaway: 'Leaf venation is one of the fastest field clues for distinguishing monocots from dicots without needing a microscope.'
  },
  {
    id: 4,
    question: 'During photosynthesis, where inside the chloroplast do the light-dependent reactions and the Calvin Cycle (light-independent reactions) occur?',
    discipline: 'Cellular Botany',
    difficulty: 'Intermediate',
    options: [
      'Light reactions in the cell wall; Calvin Cycle in the vacuole',
      'Light reactions in the thylakoid membranes; Calvin Cycle in the stroma',
      'Light reactions in the mitochondria; Calvin Cycle in the nucleus',
      'Both occur exclusively on the outer epidermal cuticle'
    ],
    correctIndex: 1,
    explanation: 'Chlorophyll pigments embedded in the thylakoid membranes capture photons to split water (photolysis) and generate ATP and NADPH. The Calvin Cycle then uses that ATP and NADPH in the fluid-filled stroma to fix carbon dioxide into glucose precursors.',
    studentTakeaway: 'The enzyme RuBisCO, which catalyzes the first step of the Calvin Cycle in the stroma, is the most abundant protein on Earth!'
  },
  {
    id: 5,
    question: 'What is the scientific binomial name of Holy Basil (Tulsi), and which plant family is it classified under?',
    discipline: 'Systematic Botany',
    difficulty: 'Beginner',
    options: [
      'Azadirachta indica — Meliaceae family',
      'Ocimum tenuiflorum (syn. Ocimum sanctum) — Lamiaceae family',
      'Digitaria sanguinalis (Crabgrass) — Poaceae family',
      'Aloe barbadensis — Asphodelaceae family'
    ],
    correctIndex: 1,
    explanation: 'Holy Basil is scientifically named Ocimum tenuiflorum (also widely known as Ocimum sanctum) and belongs to Lamiaceae (the Mint family). Members of Lamiaceae characteristically have square stems, opposite decussate leaves, and aromatic essential oil glands.',
    studentTakeaway: 'Roll the stem of Tulsi or Peppermint gently between your fingers—you can feel the distinct square (quadrangular) stem cross-section typical of the Lamiaceae family.'
  },
  {
    id: 6,
    question: 'Which potent bioactive limonoid compound isolated from Neem (Azadirachta indica) seeds and leaves acts as a natural insect antifeedant and growth disruptor?',
    discipline: 'Phytochemistry & Ethnobotany',
    difficulty: 'Intermediate',
    options: [
      'Azadirachtin',
      'Caffeine',
      'Salicylic acid',
      'Capsaicin'
    ],
    correctIndex: 0,
    explanation: 'Azadirachtin is a complex tetranortriterpenoid limonoid found in Neem (Azadirachta indica). It mimics insect hormones (ecdysone blockers), preventing larvae from molting and deterring crop pests while remaining biodegradable and safe for beneficial pollinators.',
    studentTakeaway: 'Understanding plant secondary metabolites like Azadirachtin explains why Neem has been a cornerstone of sustainable organic agriculture for centuries.'
  },
  {
    id: 7,
    question: 'Crabgrass (Digitaria sanguinalis) is an aggressive warm-season weed in agricultural beds. Which photosynthetic pathway gives Crabgrass its rapid competitive advantage in hot, sunny conditions?',
    discipline: 'Weed Science & Ecology',
    difficulty: 'Advanced',
    options: [
      'C4 Kranz-anatomy photosynthesis (minimizing photorespiration in heat)',
      'Obligate parasitic haustoria',
      'Chemosynthetic sulfur oxidation',
      'Submerged aquatic CAM-idling'
    ],
    correctIndex: 0,
    explanation: 'Crabgrass (Digitaria sanguinalis) utilizes the C4 photosynthetic pathway with specialized Kranz leaf anatomy. By concentrating CO2 in bundle-sheath cells, it nearly eliminates wasteful photorespiration under high temperatures and intense sunlight, outgrowing C3 herbs unless mechanically uprooted early.',
    studentTakeaway: 'Uproot Crabgrass from its central basal crown before its finger-like digitate spikelets mature—a single plant can shed up to 150,000 seeds!'
  },
  {
    id: 8,
    question: 'Notice how Neem (Azadirachta indica) leaves have many small leaflets attached along a central axis (rachis). What is the botanical term for this leaf structure?',
    discipline: 'Leaf Morphology',
    difficulty: 'Intermediate',
    options: [
      'Simple entire leaf',
      'Pinnately compound leaf',
      'Succulent phyllode',
      'Peltate leaf'
    ],
    correctIndex: 1,
    explanation: 'A pinnately compound leaf has its blade divided into multiple discrete leaflets arranged on either side of a central main axis called the rachis (resembling a feather). You can distinguish a whole compound leaf from a branch because axillary buds occur only at the base of the main petiole, never at the base of individual leaflets.',
    studentTakeaway: 'Note the asymmetric, curved (falcate) base and serrated margins of each Neem leaflet—a key diagnostic trait for AI and human botanists alike.'
  },
  {
    id: 9,
    question: 'Plants like Aloe vera that thrive in arid, hot environments open their stomata only at night to fix CO₂ into malic acid, conserving water during the day. What is this photosynthetic pathway called?',
    discipline: 'Plant Ecophysiology',
    difficulty: 'Intermediate',
    options: [
      'CAM (Crassulacean Acid Metabolism) Photosynthesis',
      'Photorespiration',
      'Aerobic Glycolysis',
      'Nitrogen Fixation'
    ],
    correctIndex: 0,
    explanation: 'CAM (Crassulacean Acid Metabolism) plants open their stomata at night when temperatures are cooler and humidity is higher, storing CO₂ as four-carbon malic acid in vacuoles. During daylight, stomata stay tightly shut to prevent dehydration while the stored CO₂ is released internally for the Calvin Cycle.',
    studentTakeaway: 'Succulent hydrenchyma (water-storing gel tissue) combined with CAM photosynthesis allows Aloe vera to survive months of drought.'
  },
  {
    id: 10,
    question: 'What is "Phyllotaxy" in botanical field identification?',
    discipline: 'Plant Morphology',
    difficulty: 'Beginner',
    options: [
      'The arrangement of leaves on a plant stem or axis (e.g., alternate, opposite, or whorled)',
      'The process by which roots absorb phosphorus from clay soils',
      'The decay of dead bark by saprophytic fungi',
      'The classification of fossilized pollen grains'
    ],
    correctIndex: 0,
    explanation: 'Phyllotaxy refers to the geometric pattern of leaf arrangement along a stem node. The three major types are Alternate (one leaf per node, e.g., Hibiscus/China Rose), Opposite (two leaves per node facing each other, e.g., Tulsi/Guava), and Whorled (three or more leaves per node, e.g., Alstonia).',
    studentTakeaway: 'Phyllotaxy maximizes light interception so upper leaves do not completely shade lower leaves on the same stem.'
  },
  {
    id: 11,
    question: 'Which class of plant hormones (phytohormones) is produced in the shoot apical meristem and promotes cell elongation and phototropism (bending of stems toward light)?',
    discipline: 'Plant Physiology & Hormones',
    difficulty: 'Intermediate',
    options: [
      'Auxins (such as Indole-3-acetic acid, IAA)',
      'Abscisic acid (ABA)',
      'Ethylene gas',
      'Florigen'
    ],
    correctIndex: 0,
    explanation: 'Auxins migrate away from the light source toward the shaded side of a shoot tip. The higher concentration of auxin on the shaded side stimulates those cells to elongate faster than cells on the sunlit side, causing the stem to curve toward the light (positive phototropism).',
    studentTakeaway: 'Charles Darwin and his son Francis first demonstrated phototropic signaling in canary grass coleoptiles in 1880, paving the way for the discovery of auxins.'
  },
  {
    id: 12,
    question: 'Leguminous plants (family Fabaceae, such as peas, beans, and clover) enrich soil fertility through a symbiotic relationship with which nitrogen-fixing bacteria inside root nodules?',
    discipline: 'Soil & Plant Microbiology',
    difficulty: 'Beginner',
    options: [
      'Rhizobium species',
      'Escherichia coli',
      'Lactobacillus acidophilus',
      'Streptococcus pneumoniae'
    ],
    correctIndex: 0,
    explanation: 'Rhizobium bacteria colonize legume root hairs, inducing the plant to form specialized root nodules. Inside these oxygen-regulated nodules (containing pink leghemoglobin), the bacteria use the nitrogenase enzyme to convert atmospheric nitrogen gas (N₂) into plant-available ammonia (NH₃).',
    studentTakeaway: 'If you slice open a healthy, active legume root nodule in the field, it looks pink or reddish inside due to leghemoglobin—similar to hemoglobin in human blood!'
  },
  {
    id: 13,
    question: 'Peppermint (Mentha × piperita) is widely cultivated for menthol. Why is there an "×" symbol in its scientific name?',
    discipline: 'Plant Taxonomy & Genetics',
    difficulty: 'Advanced',
    options: [
      'It indicates the species is extinct in the wild',
      'It denotes an interspecific hybrid—specifically a natural cross between Watermint (Mentha aquatica) and Spearmint (Mentha spicata)',
      'It means the plant is toxic to livestock',
      'It signifies a plant that only grows in winter'
    ],
    correctIndex: 1,
    explanation: 'In botanical nomenclature (ICN), the multiplication sign "×" indicates a hybrid taxon. Mentha × piperita is a mostly sterile natural hybrid between Mentha aquatica and Mentha spicata, which is why farmers and students propagate it vegetatively via runners (stolons) and stem cuttings rather than seeds.',
    studentTakeaway: 'Look closely at Peppermint leaves under a hand lens: its menthol is synthesized and stored inside microscopic glandular trichomes on the leaf epidermis.'
  },
  {
    id: 14,
    question: 'In Indian agronomy and botanical cropping calendars, what distinguishes Kharif crops from Rabi crops?',
    discipline: 'Agronomy & Phenology',
    difficulty: 'Beginner',
    options: [
      'Kharif crops are sown with the onset of monsoon rains (June–July) and harvested in autumn; Rabi crops are sown in winter (October–November) and harvested in spring',
      'Kharif crops grow underwater; Rabi crops grow only on mountain peaks',
      'Kharif refers only to ornamental flowers; Rabi refers only to timber trees',
      'Kharif crops do not require sunlight; Rabi crops require 24 hours of daylight'
    ],
    correctIndex: 0,
    explanation: 'Kharif (monsoon) crops—such as paddy (rice), maize, cotton, and soybean—require warm, wet weather for vegetative growth. Rabi (winter) crops—such as wheat, mustard, chickpea (gram), and pea—require cool temperatures during germination/growth and warm sunshine at harvest.',
    studentTakeaway: 'There is also a short summer cropping season between Rabi and Kharif (March to June) known as the "Zaid" season, ideal for watermelon, cucumber, and muskmelon.'
  },
  {
    id: 15,
    question: 'When using a botanical AI vision scanner in the field, why can a healthy dicot leaf occasionally be misclassified as a pest-damaged or diseased leaf if the photo is taken at a steep angle or under harsh glare?',
    discipline: 'Computational Botany & Field Imaging',
    difficulty: 'Intermediate',
    options: [
      'Camera glare and shadows distort leaf margin serrations, venation contrast, and chlorophyll color histograms',
      'Plants change their species when photographed with a smartphone',
      'Sunlight deletes the camera lens glass',
      'Leaves close their veins when a phone approaches'
    ],
    correctIndex: 0,
    explanation: 'Convolutional neural networks (CNNs) rely on edge gradients (leaf margin teeth, apex shape), texture (reticulate vs. parallel venation), and RGB color channels. Harsh specular reflection looks like chlorotic or necrotic lesions, while steep perspective foreshortening alters the length-to-width ratio of the lamina.',
    studentTakeaway: 'For scientific-grade botanical photography: hold the camera parallel to the leaf blade (plan-view), use diffused daylight, and keep the petiole and margin clearly visible.'
  }
];

interface PlantTriviaPageProps {
  onNavigateToScanner: () => void;
  ttsEnabled?: boolean;
}

export const PlantTriviaPage: React.FC<PlantTriviaPageProps> = ({
  onNavigateToScanner,
  ttsEnabled = true
}) => {
  const [viewMode, setViewMode] = useState<'interactive' | 'study-sheet'>('interactive');
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answersRecord, setAnswersRecord] = useState<Record<number, number>>({});
  const [isQuizComplete, setIsQuizComplete] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');

  const currentQuestion = BOTANY_TRIVIA_QUESTIONS[currentIdx];

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.98;
    window.speechSynthesis.speak(utterance);
  };

  const handleSelectOption = (optionIndex: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optionIndex);
    setAnswersRecord((prev) => ({ ...prev, [currentQuestion.id]: optionIndex }));

    const isCorrect = optionIndex === currentQuestion.correctIndex;
    if (isCorrect) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > bestStreak) {
        setBestStreak(nextStreak);
      }
    } else {
      setStreak(0);
    }

    if (ttsEnabled) {
      const feedbackPrefix = isCorrect
        ? 'Correct! '
        : `Not quite. The correct answer is ${currentQuestion.options[currentQuestion.correctIndex]}. `;
      speakText(`${feedbackPrefix}${currentQuestion.explanation}`);
    }
  };

  const handleNextQuestion = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (currentIdx + 1 < BOTANY_TRIVIA_QUESTIONS.length) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      const nextQId = BOTANY_TRIVIA_QUESTIONS[nextIdx].id;
      setSelectedOption(answersRecord[nextQId] !== undefined ? answersRecord[nextQId] : null);
    } else {
      setIsQuizComplete(true);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsQuizComplete(false);
    setCurrentIdx(index);
    const qId = BOTANY_TRIVIA_QUESTIONS[index].id;
    setSelectedOption(answersRecord[qId] !== undefined ? answersRecord[qId] : null);
  };

  const handleResetTrivia = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentIdx(0);
    setSelectedOption(null);
    setAnswersRecord({});
    setIsQuizComplete(false);
    setStreak(0);
    setBestStreak(0);
  };

  const totalAnswered = Object.keys(answersRecord).length;
  const totalCorrect = BOTANY_TRIVIA_QUESTIONS.reduce((acc, q) => {
    return answersRecord[q.id] === q.correctIndex ? acc + 1 : acc;
  }, 0);
  const accuracyPercent = totalAnswered > 0 ? Math.round((totalCorrect / BOTANY_TRIVIA_QUESTIONS.length) * 100) : 0;

  const getStudentRank = (score: number) => {
    if (score >= 14) return { title: 'Senior Field Taxonomist', desc: 'Outstanding mastery of plant anatomy, physiology, and ethnobotany!' };
    if (score >= 11) return { title: 'Botanical Research Fellow', desc: 'Strong command of vascular biology, leaf morphology, and crop science.' };
    if (score >= 7) return { title: 'Junior Herbarium Scholar', desc: 'Solid foundational knowledge! Review the explanations to master advanced phytochemistry.' };
    return { title: 'Budding Botany Explorer', desc: 'Great start! Explore the study sheet below and test specimens in the live scanner.' };
  };

  const filteredStudyQuestions = difficultyFilter === 'All'
    ? BOTANY_TRIVIA_QUESTIONS
    : BOTANY_TRIVIA_QUESTIONS.filter((q) => q.difficulty === difficultyFilter);

  return (
    <section className="max-w-7xl w-full min-w-0 mx-auto px-0 sm:px-4 lg:px-8 pt-2 sm:pt-6 pb-16 overflow-x-hidden">
      {/* Editorial Header */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-[#1a3a18]/10 shadow-sm mb-6 sm:mb-8 min-w-0 overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 min-w-0">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs font-mono uppercase tracking-wider sm:tracking-widest text-[#256222] mb-2">
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>Student Botanical Curriculum · 15 Core Questions</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#1a3a18] tracking-tight">
              Botany &amp; Plant Science Student Trivia
            </h1>
            <p className="text-[#4a5d48] text-xs sm:text-base mt-2 max-w-3xl leading-relaxed">
              Designed for botany students and young agronomists. Master 15 essential questions spanning cellular photosynthesis, leaf venation, vascular transport, medicinal phytochemistry, and field taxonomy.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 w-full lg:w-auto shrink-0">
            <button
              onClick={() => setViewMode('interactive')}
              className={`min-h-[42px] px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                viewMode === 'interactive'
                  ? 'bg-[#256222] text-white shadow-sm'
                  : 'bg-[#f4f7f2] text-[#256222] hover:bg-[#e5ede0]'
              }`}
            >
              <Play className="w-3.5 h-3.5 shrink-0" />
              <span>Interactive 15-Q Quiz</span>
            </button>
            <button
              onClick={() => setViewMode('study-sheet')}
              className={`min-h-[42px] px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                viewMode === 'study-sheet'
                  ? 'bg-[#256222] text-white shadow-sm'
                  : 'bg-[#f4f7f2] text-[#256222] hover:bg-[#e5ede0]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>All 15 Questions Study Guide</span>
            </button>
          </div>
        </div>

        {/* Live Telemetry Bar */}
        <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-[#1a3a18]/10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="min-w-0">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#6e806c]">Progress</div>
            <div className="text-base sm:text-lg font-bold text-[#1a3a18] font-mono mt-0.5 truncate">
              {totalAnswered} / {BOTANY_TRIVIA_QUESTIONS.length} Answered
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#6e806c]">Current Score</div>
            <div className="text-base sm:text-lg font-bold text-[#256222] font-mono mt-0.5 truncate">
              {totalCorrect} / {BOTANY_TRIVIA_QUESTIONS.length} ({accuracyPercent}%)
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#6e806c]">Answer Streak</div>
            <div className="text-base sm:text-lg font-bold text-amber-700 font-mono mt-0.5 truncate">
              {streak} Current · {bestStreak} Best
            </div>
          </div>
          <div className="flex items-center justify-start sm:justify-end">
            <button
              onClick={handleResetTrivia}
              className="w-full sm:w-auto min-h-[40px] px-3 py-2 rounded-xl border border-[#1a3a18]/15 text-xs font-semibold text-[#1a3a18] hover:bg-[#f4f7f2] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Reset Quiz</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'interactive' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start min-w-0">
          {/* Left Column: Active Question or Final Score Certificate */}
          <div className="lg:col-span-8 min-w-0 w-full">
            {isQuizComplete ? (
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-[#1a3a18]/15 shadow-md">
                <div className="flex items-center gap-3 text-[#256222] mb-4">
                  <Award className="w-8 h-8" />
                  <span className="text-xs font-mono uppercase tracking-widest font-bold">
                    Botanical Assessment Complete · 15 Questions
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1a3a18] mb-2">
                  {getStudentRank(totalCorrect).title}
                </h2>
                <p className="text-[#4a5d48] text-sm sm:text-base mb-6">
                  {getStudentRank(totalCorrect).desc}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-[#f4f7f2] border border-[#1a3a18]/10 mb-8">
                  <div>
                    <div className="text-xs font-mono uppercase text-[#6e806c]">Final Score</div>
                    <div className="text-2xl font-bold text-[#1a3a18] font-mono mt-1">
                      {totalCorrect} / 15
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase text-[#6e806c]">Mastery Accuracy</div>
                    <div className="text-2xl font-bold text-[#256222] font-mono mt-1">
                      {Math.round((totalCorrect / 15) * 100)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase text-[#6e806c]">Longest Streak</div>
                    <div className="text-2xl font-bold text-amber-700 font-mono mt-1">
                      {bestStreak} in a row
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleResetTrivia}
                    className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#256222] text-white text-sm font-semibold hover:bg-[#1a4718] transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Retake 15-Question Trivia
                  </button>
                  <button
                    onClick={() => setViewMode('study-sheet')}
                    className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#f4f7f2] text-[#1a3a18] border border-[#1a3a18]/15 text-sm font-semibold hover:bg-[#e7efe3] transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    Review All 15 Answers &amp; Notes
                  </button>
                  <button
                    onClick={onNavigateToScanner}
                    className="min-h-[44px] px-5 py-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-300/60 text-sm font-semibold hover:bg-amber-100 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Compass className="w-4 h-4" />
                    Practice in AI Scanner
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-[#1a3a18]/15 shadow-md">
                {/* Question Metadata Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-[#1a3a18]/10">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#256222] font-semibold">
                    Question {currentQuestion.id} of {BOTANY_TRIVIA_QUESTIONS.length} · {currentQuestion.discipline} · {currentQuestion.difficulty} Level
                  </div>
                  <button
                    onClick={() => speakText(`${currentQuestion.question}. Options: ${currentQuestion.options.join('. ')}`)}
                    className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#f4f7f2] hover:bg-[#e5ede0] text-[#1a3a18] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Listen to question aloud"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#256222]" />
                    Read Question Aloud
                  </button>
                </div>

                {/* Question Prompt */}
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1a3a18] leading-snug mb-6">
                  {currentQuestion.question}
                </h2>

                {/* 4 Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrectOption = idx === currentQuestion.correctIndex;
                    const showFeedback = selectedOption !== null;

                    let buttonStyle =
                      'border-[#1a3a18]/15 bg-[#f9fbf8] hover:bg-[#f0f5ed] hover:border-[#256222]/40 text-[#1a3a18]';
                    if (showFeedback) {
                      if (isCorrectOption) {
                        buttonStyle = 'border-emerald-600 bg-emerald-50/90 text-emerald-950 ring-2 ring-emerald-500/20';
                      } else if (isSelected && !isCorrectOption) {
                        buttonStyle = 'border-rose-500 bg-rose-50/90 text-rose-950';
                      } else {
                        buttonStyle = 'border-[#1a3a18]/10 bg-gray-50/60 text-gray-500 opacity-75';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={showFeedback}
                        className={`w-full min-h-[54px] p-4 rounded-2xl border text-left transition-all flex items-start justify-between gap-4 cursor-pointer disabled:cursor-default ${buttonStyle}`}
                      >
                        <div className="flex items-start gap-3.5">
                          <span className="w-7 h-7 rounded-lg bg-white border border-current/20 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="text-sm sm:text-base font-medium leading-relaxed">
                            {option}
                          </span>
                        </div>

                        {showFeedback && isCorrectOption && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                        {showFeedback && isSelected && !isCorrectOption && (
                          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Detailed Botanical Explanation After Answering */}
                {selectedOption !== null && (
                  <div className="mt-6 p-5 rounded-2xl bg-[#f4f7f2] border border-[#256222]/20 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider font-bold text-[#256222]">
                        <Sparkles className="w-4 h-4" />
                        <span>
                          {selectedOption === currentQuestion.correctIndex
                            ? 'Spot On! Botanical Explanation'
                            : 'Botanical Correction & Deep Dive'}
                        </span>
                      </div>
                      <button
                        onClick={() => speakText(`${currentQuestion.explanation} Field takeaway: ${currentQuestion.studentTakeaway}`)}
                        className="text-xs font-semibold text-[#256222] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        Listen
                      </button>
                    </div>

                    <p className="text-sm text-[#1a3a18] leading-relaxed">
                      {currentQuestion.explanation}
                    </p>

                    <div className="pt-2 border-t border-[#1a3a18]/10 text-xs text-[#4a5d48] leading-relaxed">
                      <strong className="text-[#1a3a18] font-semibold">Student Field Takeaway:</strong>{' '}
                      {currentQuestion.studentTakeaway}
                    </div>
                  </div>
                )}

                {/* Navigation Footer */}
                <div className="mt-6 pt-5 border-t border-[#1a3a18]/10 flex items-center justify-between gap-4">
                  <div className="text-xs text-[#6e806c] font-mono">
                    {selectedOption === null
                      ? 'Select an option above to reveal the botanical explanation'
                      : `Question ${currentQuestion.id} of 15 verified`}
                  </div>

                  <button
                    onClick={handleNextQuestion}
                    disabled={selectedOption === null}
                    className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#256222] text-white text-sm font-semibold hover:bg-[#1a4718] disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>
                      {currentIdx + 1 === BOTANY_TRIVIA_QUESTIONS.length
                        ? 'Finish & View Score Certificate'
                        : `Next Question (${currentIdx + 2}/15)`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: 15-Question Navigator Grid & Curriculum Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-[#1a3a18]/10 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1a3a18] flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-[#256222]" />
                  15-Question Navigator
                </h3>
                <span className="text-xs font-mono text-[#6e806c]">
                  Click any number to jump
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2.5">
                {BOTANY_TRIVIA_QUESTIONS.map((q, idx) => {
                  const answeredChoice = answersRecord[q.id];
                  const isAnswered = answeredChoice !== undefined;
                  const isCorrect = isAnswered && answeredChoice === q.correctIndex;
                  const isCurrent = !isQuizComplete && idx === currentIdx;

                  let cellClass = 'bg-[#f4f7f2] text-[#1a3a18] border-[#1a3a18]/10 hover:border-[#256222]';
                  if (isAnswered) {
                    cellClass = isCorrect
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : 'bg-rose-600 text-white border-rose-700';
                  }
                  if (isCurrent) {
                    cellClass += ' ring-2 ring-[#256222] ring-offset-2 font-bold';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => handleJumpToQuestion(idx)}
                      className={`h-11 rounded-xl border text-xs font-mono transition-all flex items-center justify-center cursor-pointer ${cellClass}`}
                      title={`Question ${q.id}: ${q.discipline}`}
                    >
                      Q{q.id}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-[#1a3a18]/10 space-y-2 text-xs text-[#4a5d48]">
                <div className="font-semibold text-[#1a3a18]">Topics Covered in this 15-Question Set:</div>
                <p className="leading-relaxed">
                  Stomatal guard cells · Xylem &amp; Phloem · Monocot vs. Dicot venation · Chloroplast reactions · Binomial taxonomy · Azadirachtin phytochemistry · Invasive allelopathy · Pinnate leaves · CAM metabolism · Phyllotaxy · Auxin phototropism · Rhizobium symbiosis · Interspecific hybrids · Kharif/Rabi agronomy · Computer vision leaf imaging.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Complete 15-Question Student Study Guide View */
        <div className="space-y-6">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#1a3a18]/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1a3a18]">
              <HelpCircle className="w-4 h-4 text-[#256222]" />
              <span>Filter 15 Study Questions by Difficulty:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficultyFilter(level)}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    difficultyFilter === level
                      ? 'bg-[#256222] text-white'
                      : 'bg-[#f4f7f2] text-[#1a3a18] hover:bg-[#e5ede0]'
                  }`}
                >
                  {level} ({level === 'All' ? 15 : BOTANY_TRIVIA_QUESTIONS.filter((q) => q.difficulty === level).length})
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {filteredStudyQuestions.map((q) => (
              <article
                key={q.id}
                className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-[#1a3a18]/10 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#256222] font-bold">
                    Question #{q.id} of 15 · {q.discipline} · {q.difficulty}
                  </div>
                  <button
                    onClick={() =>
                      speakText(
                        `Question ${q.id}: ${q.question}. Answer: ${q.options[q.correctIndex]}. ${q.explanation}`
                      )
                    }
                    className="min-h-[36px] px-3 py-1 rounded-lg bg-[#f4f7f2] hover:bg-[#e5ede0] text-xs font-semibold text-[#1a3a18] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#256222]" />
                    Read Study Card
                  </button>
                </div>

                <h3 className="text-lg sm:text-xl font-serif font-bold text-[#1a3a18] mb-4">
                  {q.question}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                  {q.options.map((opt, oIdx) => {
                    const isCorrect = oIdx === q.correctIndex;
                    return (
                      <div
                        key={oIdx}
                        className={`p-3.5 rounded-xl border text-sm flex items-start gap-2.5 ${
                          isCorrect
                            ? 'bg-emerald-50/90 border-emerald-500/60 text-emerald-950 font-semibold'
                            : 'bg-[#f9fbf8] border-[#1a3a18]/10 text-[#4a5d48]'
                        }`}
                      >
                        <span className="font-mono text-xs font-bold shrink-0 mt-0.5">
                          {String.fromCharCode(65 + oIdx)}.
                        </span>
                        <span>{opt}</span>
                        {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-auto mt-0.5" />}
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 rounded-2xl bg-[#f4f7f2] border border-[#1a3a18]/10 text-xs sm:text-sm text-[#1a3a18] space-y-1.5">
                  <p className="leading-relaxed">
                    <strong className="text-[#256222] uppercase font-mono text-xs">Scientific Explanation: </strong>
                    {q.explanation}
                  </p>
                  <p className="text-[#4a5d48] leading-relaxed">
                    <strong className="text-[#1a3a18] font-semibold">Student Field Tip: </strong>
                    {q.studentTakeaway}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

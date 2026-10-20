import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  BookmarkCheck,
  Trash2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Plus,
} from 'lucide-react';
import { BOTANICAL_CLASSES, BotanicalClassProfile } from '../data/botanicalData';
import { BotanicalSpecimenGraphic } from './BotanicalSpecimenGraphic';

export interface FieldJournalSnapshot {
  id: string;
  timestamp: string;
  specimenId: BotanicalClassProfile['id'];
  specimenName: string;
  scientificName: string;
  confidence: number;
  spad: number;
  imageDataUrl: string | null;
  note: string;
}

interface BotanicalFeaturesSectionProps {
  journalEntries: FieldJournalSnapshot[];
  onDeleteJournalEntry: (id: string) => void;
  onUpdateJournalNote: (id: string, note: string) => void;
  onSpeakProfile: (profile: BotanicalClassProfile) => void;
}

interface RemedyGoal {
  id: string;
  label: string;
  specimenId: Exclude<BotanicalClassProfile['id'], 'background'>;
  indication: string;
  activeCompound: string;
  dosageSummary: string;
}

const REMEDY_GOALS: RemedyGoal[] = [
  {
    id: 'respiratory',
    label: 'Respiratory & Sinus',
    specimenId: 'tulsi',
    indication:
      'Bronchial congestion, seasonal cough, and upper-respiratory irritation.',
    activeCompound: 'Eugenol & Camphene (14.2 mg/g)',
    dosageSummary:
      'Steep 5 fresh Tulsi leaves in 250 mL water at 90°C for 6 minutes; inhale warm vapor and sip slowly.',
  },
  {
    id: 'digestive',
    label: 'Digestive & Bloating',
    specimenId: 'peppermint',
    indication:
      'Gastrointestinal smooth muscle cramping, indigestion, and tension headaches.',
    activeCompound: 'L-Menthol & Menthone (22.4 mg/g)',
    dosageSummary:
      'Infuse 5 crushed Peppermint leaves covered in 200 mL hot water (85°C) for 5 minutes after meals.',
  },
  {
    id: 'dermal',
    label: 'Skin & Antiseptic Care',
    specimenId: 'neem',
    indication:
      'Minor epidermal abrasions, acneiform bacteria, and oral plaque biofilm.',
    activeCompound: 'Nimbidin & Quercetin (18.5 mg/g)',
    dosageSummary:
      'Simmer 10 mature Neem leaflets in 500 mL water for 12 minutes; cool to 25°C for topical wash.',
  },
  {
    id: 'stress',
    label: 'Adaptogenic & Immunity',
    specimenId: 'tulsi',
    indication:
      'Metabolic oxidative stress, elevated cortisol, and daily immune resilience.',
    activeCompound: 'Ursolic Acid & Rosmarinic Acid (9.4 mg/g)',
    dosageSummary:
      'Morning herbal infusion using 4 to 6 fresh apical leaves steeped for 6 minutes.',
  },
  {
    id: 'garden',
    label: 'Safe Weed Management',
    specimenId: 'weed',
    indication:
      'Preventing contact dermatitis from sesquiterpene lactones and avoiding glyphosate runoff.',
    activeCompound: 'Parthenin / Sesquiterpene Lactones (Allergen Alert)',
    dosageSummary:
      'Do not consume. Wear gloves and extract the taproot mechanically while topsoil is moist.',
  },
];

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question:
      'Why does The Green Medic require an ≥85% confidence gate and a dedicated Background/Noise class?',
    options: [
      'To make the camera run at a lower resolution',
      'To prevent false medical triggers on human hands, empty space, or uncertain look-alike leaves',
      'To replace the need for natural lighting',
      'To only detect dried brown leaves',
    ],
    correctIndex: 1,
    explanation:
      'In medical and botanical AI, false positives on hands, desks, or low-confidence look-alikes could mislead users. A strict ≥85% threshold + noise rejection ensures empirical reliability.',
  },
  {
    id: 2,
    question:
      'Which phytochemical in Peppermint (Mentha × piperita) relaxes gastrointestinal smooth muscle and activates cold-sensitive TRPM8 receptors?',
    options: ['Nimbidin', 'L-Menthol', 'Azadirachtin', 'Parthenin'],
    correctIndex: 1,
    explanation:
      'L-Menthol is the primary monoterpene in Peppermint that blocks calcium channels in gut smooth muscle to relieve spasms and stimulates cold receptors.',
  },
  {
    id: 3,
    question:
      'How does real-time AI weed discrimination protect local water tables and soil health?',
    options: [
      'It enables targeted manual uprooting of weeds instead of blanket spraying synthetic herbicides',
      'It increases soil nitrogen evaporation',
      'It converts weeds into peppermint plants',
      'It waters the garden automatically',
    ],
    correctIndex: 0,
    explanation:
      'Distinguishing invasive weeds from medicinal crops lets gardeners remove weeds mechanically before seed set, eliminating up to 92% of chemical herbicide runoff.',
  },
  {
    id: 4,
    question:
      'Which morphological leaf characteristic helps distinguish Neem (Azadirachta indica) from Tulsi (Ocimum tenuiflorum)?',
    options: [
      'Neem has asymmetric compound pinnate leaflets with coarsely serrated edges',
      'Neem has round purple petals on its leaves',
      'Neem leaves grow underground',
      'Neem has zero chlorophyll SPAD value',
    ],
    correctIndex: 0,
    explanation:
      'Neem leaflets are characteristically falcate-lanceolate (curved) and asymmetric along a central rachis with coarse serrations, whereas Tulsi has ovate-elliptic opposite leaves.',
  },
];

export const BotanicalFeaturesSection: React.FC<
  BotanicalFeaturesSectionProps
> = ({
  journalEntries,
  onDeleteJournalEntry,
  onUpdateJournalNote,
  onSpeakProfile,
}) => {
  // Remedy Matcher State
  const [selectedGoalId, setSelectedGoalId] = useState<string>('respiratory');
  const activeGoal =
    REMEDY_GOALS.find((g) => g.id === selectedGoalId) || REMEDY_GOALS[0];
  const matchedProfile =
    BOTANICAL_CLASSES.find((c) => c.id === activeGoal.specimenId) ||
    BOTANICAL_CLASSES[0];

  // Quiz State
  const [currentQIdx, setCurrentQIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [answeredCount, setAnsweredCount] = useState<number>(0);

  // Field Note Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState<string>('');

  const currentQuestion = QUIZ_QUESTIONS[currentQIdx];

  const handleSelectQuizOption = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    setAnsweredCount((prev) => prev + 1);
    if (idx === currentQuestion.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setCurrentQIdx((prev) => (prev + 1) % QUIZ_QUESTIONS.length);
  };

  const handleResetQuiz = () => {
    setSelectedOption(null);
    setCurrentQIdx(0);
    setScore(0);
    setAnsweredCount(0);
  };

  return (
    <section
      id="toolkit"
      className="py-10 sm:py-14 border-t border-slate-200/80"
      aria-labelledby="toolkit-heading"
    >
      <div className="mb-8">
        <div className="text-xs text-slate-400">
          <span>03. Interactive Field Toolkit</span>
          <span className="mx-2" aria-hidden="true">
            ·
          </span>
          <span>Remedy Matcher, Field Journal & Botanical Quiz</span>
        </div>
        <h2
          id="toolkit-heading"
          className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mt-1"
        >
          Phytomedicine Guide & Field Notebook
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT 7 COLS: Symptom-to-Leaf Remedy Matcher + Captured Field Journal */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Feature 1: Symptom-to-Leaf Remedy Matcher */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                  Symptom & Application Remedy Matcher
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select a health or garden need to view the evidence-based botanical protocol
                </p>
              </div>
            </div>

            {/* Scrollable horizontal filter bar on mobile */}
            <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
              {REMEDY_GOALS.map((goal) => (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => setSelectedGoalId(goal.id)}
                  className={`px-3.5 py-2 min-h-[40px] text-xs font-medium rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedGoalId === goal.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {goal.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeGoal.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="mt-4 bg-slate-50/80 border border-slate-100 rounded-xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center"
              >
                <div className="sm:col-span-4">
                  <BotanicalSpecimenGraphic
                    specimenId={matchedProfile.id}
                    className="w-full h-32 rounded-xl"
                  />
                </div>
                <div className="sm:col-span-8 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-base font-bold text-slate-900">
                        {matchedProfile.name}
                      </span>
                      <span className="text-xs italic text-slate-400 ml-2">
                        {matchedProfile.scientificName}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSpeakProfile(matchedProfile)}
                      className="px-3 py-1.5 min-h-[36px] text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Speak</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-800">Primary Target:</strong>{' '}
                    {activeGoal.indication}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-800">Key Bioactive:</strong>{' '}
                    <span className="font-mono">{activeGoal.activeCompound}</span>
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-800">Protocol:</strong>{' '}
                    {activeGoal.dosageSummary}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Feature 2: Captured Field Herbarium Snapshots */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                  <span>Saved Field Herbarium Snapshots</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Bookmark live camera detections using the &ldquo;Save Snapshot&rdquo; button in the scanner
                </p>
              </div>
              <span className="font-mono text-xs text-slate-400 tabular-nums">
                {journalEntries.length} saved
              </span>
            </div>

            {journalEntries.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                No field snapshots saved yet. Scan a leaf and tap &ldquo;Save Snapshot&rdquo; under the camera to log visual specimens with notes.
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {journalEntries.map((item) => (
                  <motion.div
                    layout
                    key={item.id}
                    className="border border-slate-200/80 rounded-xl p-3.5 bg-slate-50/50 flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      {item.imageDataUrl ? (
                        <img
                          src={item.imageDataUrl}
                          alt={item.specimenName}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 shrink-0">
                          <BotanicalSpecimenGraphic
                            specimenId={item.specimenId}
                            className="w-full h-full rounded-lg"
                            showScaleBar={false}
                          />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold text-slate-900 truncate">
                            {item.specimenName}
                          </span>
                          <button
                            type="button"
                            onClick={() => onDeleteJournalEntry(item.id)}
                            title="Remove snapshot"
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 tabular-nums mt-0.5">
                          {item.timestamp} · {item.confidence.toFixed(1)}% ·{' '}
                          {item.spad.toFixed(1)} SPAD
                        </div>

                        {editingId === item.id ? (
                          <div className="mt-2 flex items-center gap-1.5">
                            <input
                              type="text"
                              value={draftNote}
                              onChange={(e) => setDraftNote(e.target.value)}
                              placeholder="Add field observation..."
                              className="flex-1 bg-white border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-800"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateJournalNote(item.id, draftNote);
                                setEditingId(null);
                              }}
                              className="px-2 py-1 text-[11px] font-medium bg-slate-900 text-white rounded-md cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div className="mt-1.5 flex items-center justify-between gap-2">
                            <p className="text-xs text-slate-600 truncate">
                              {item.note || 'No field note added.'}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(item.id);
                                setDraftNote(item.note);
                              }}
                              className="text-[11px] text-emerald-700 hover:underline shrink-0 flex items-center gap-0.5 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Note</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT 5 COLS: Interactive Botanical & AI Science Quiz */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="text-xs text-slate-400">
                  Interactive Knowledge Check
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mt-0.5">
                  Botanical AI & Phytomedicine Quiz
                </h3>
              </div>
              <div className="text-right font-mono text-xs tabular-nums">
                <span className="text-slate-400">SCORE </span>
                <span className="font-bold text-emerald-700">
                  {score}/{answeredCount}
                </span>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                <span>
                  QUESTION 0{currentQIdx + 1} OF 0{QUIZ_QUESTIONS.length}
                </span>
              </div>

              <h4 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                {currentQuestion.question}
              </h4>

              <div className="mt-4 space-y-2.5">
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQuestion.correctIndex;
                  const showResult = selectedOption !== null;

                  let btnStyle =
                    'bg-slate-50 border-slate-200/90 text-slate-700 hover:bg-slate-100';
                  if (showResult) {
                    if (isCorrect) {
                      btnStyle =
                        'bg-emerald-50 border-emerald-400 text-emerald-950 font-medium';
                    } else if (isSelected && !isCorrect) {
                      btnStyle =
                        'bg-rose-50 border-rose-300 text-rose-900';
                    } else {
                      btnStyle =
                        'bg-slate-50/50 border-slate-200/50 text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={showResult}
                      onClick={() => handleSelectQuizOption(idx)}
                      className={`w-full text-left p-3.5 min-h-[44px] rounded-xl border text-xs sm:text-sm transition-all flex items-start justify-between gap-3 cursor-pointer ${btnStyle}`}
                    >
                      <span className="leading-relaxed">{opt}</span>
                      {showResult && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {selectedOption !== null && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed"
                  >
                    <strong className="text-slate-900">Scientific Note:</strong>{' '}
                    {currentQuestion.explanation}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetQuiz}
              className="px-3 py-2 min-h-[40px] text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Quiz</span>
            </button>

            <button
              type="button"
              onClick={handleNextQuestion}
              className="px-4 py-2 min-h-[40px] text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Next Question
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

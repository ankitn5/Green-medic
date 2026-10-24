import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  Stethoscope,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { BotanicalClassProfile } from '../data/botanicalData';
import {
  AutoCorrectionReport,
  PlantDiseaseDiagnosis,
} from '../services/teachableMachine';
import { BotanicalSpecimenGraphic } from './BotanicalSpecimenGraphic';

interface BotanicalActionCardProps {
  activeProfile: BotanicalClassProfile;
  confidence: number;
  threshold: number;
  isTriggered: boolean;
  isBackgroundOrNoise: boolean;
  isSpeaking: boolean;
  cooldownRemainingSec: number;
  ttsEnabled: boolean;
  diseaseDiagnosis?: PlantDiseaseDiagnosis | null;
  autoCorrectionReport?: AutoCorrectionReport | null;
  onSpeakNow: (profile: BotanicalClassProfile) => void;
  onSpeakDiseaseCure?: (diagnosis: PlantDiseaseDiagnosis, plantName: string) => void;
  onStopSpeech: () => void;
}

const BioactivityRadarChart: React.FC<{
  metrics: { axis: string; value: number }[];
  isWeed: boolean;
}> = ({ metrics, isWeed }) => {
  const size = 200;
  const center = size / 2;
  const maxRadius = 64;
  const levels = [0.33, 0.66, 1.0];

  const getCoordinates = (index: number, total: number, radiusFraction: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const r = maxRadius * radiusFraction;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const polygonPoints = metrics
    .map((m, i) => {
      const pt = getCoordinates(i, metrics.length, m.value / 100);
      return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full max-w-[190px] sm:max-w-[200px] h-auto mx-auto select-none"
      role="img"
      aria-label="Phytochemical bioactivity radar chart"
    >
      {levels.map((lvl) => {
        const ringPts = metrics
          .map((_, i) => {
            const pt = getCoordinates(i, metrics.length, lvl);
            return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
          })
          .join(' ');
        return (
          <polygon
            key={lvl}
            points={ringPts}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="1"
          />
        );
      })}

      {metrics.map((m, i) => {
        const outer = getCoordinates(i, metrics.length, 1.0);
        const labelPos = getCoordinates(i, metrics.length, 1.25);
        return (
          <g key={m.axis}>
            <line
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke="#E2E8F0"
              strokeWidth="1"
            />
            <text
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-mono text-[7px] fill-slate-400"
            >
              {m.axis}
            </text>
          </g>
        );
      })}

      <motion.polygon
        initial={{ opacity: 0, scale: 0.75 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        points={polygonPoints}
        className={
          isWeed
            ? 'fill-amber-500/15 stroke-amber-600'
            : 'fill-emerald-500/15 stroke-emerald-600'
        }
        strokeWidth="1.75"
      />

      {metrics.map((m, i) => {
        const pt = getCoordinates(i, metrics.length, m.value / 100);
        return (
          <circle
            key={m.axis}
            cx={pt.x}
            cy={pt.y}
            r="2.5"
            className={isWeed ? 'fill-amber-600' : 'fill-emerald-600'}
          />
        );
      })}
    </svg>
  );
};

export const BotanicalActionCard: React.FC<BotanicalActionCardProps> = ({
  activeProfile,
  confidence,
  threshold,
  isTriggered,
  isBackgroundOrNoise,
  isSpeaking,
  cooldownRemainingSec,
  ttsEnabled,
  diseaseDiagnosis,
  autoCorrectionReport,
  onSpeakNow,
  onSpeakDiseaseCure,
  onStopSpeech,
}) => {
  const isWeed = activeProfile.category === 'weed';

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 md:p-7 h-full w-full min-w-0 flex flex-col justify-between overflow-hidden shadow-xs">
      <AnimatePresence mode="wait">
        {isBackgroundOrNoise || !isTriggered ? (
          <motion.div
            key="standby-gate"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-between h-full min-w-0"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 border-b border-slate-100 pb-3.5 sm:pb-4 min-w-0">
              <div className="min-w-0 truncate">
                <span>Noise Filter Active</span>
                <span className="mx-1.5 sm:mx-2" aria-hidden="true">·</span>
                <span>Trigger Gate ≥ {threshold.toFixed(0)}%</span>
              </div>
              <span className="font-mono tabular-nums shrink-0">Standby</span>
            </div>

            <div className="my-auto py-7 sm:py-12 text-center max-w-md mx-auto">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-24 h-20 sm:w-28 sm:h-24 mx-auto mb-4 sm:mb-6 opacity-85"
              >
                <BotanicalSpecimenGraphic
                  specimenId="background"
                  className="w-full h-full rounded-xl"
                  showScaleBar={false}
                />
              </motion.div>

              <h3
                className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight mb-2"
                style={{ textWrap: 'balance' }}
              >
                {isBackgroundOrNoise
                  ? 'Background & Non-Botanical Objects Ignored'
                  : `Hold Leaf Steady for ≥ ${threshold.toFixed(0)}% Lock`}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {isBackgroundOrNoise
                  ? 'Hands, faces, empty space, and room surfaces are automatically filtered out. Place a single medicinal leaf or weed in front of the lens.'
                  : `Detecting ${activeProfile.name} (${confidence.toFixed(
                      1
                    )}%). Autonomous morphological auto-correction & disease scanner are active.`}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-3.5 sm:pt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span>Autonomous Auto-Correction: Engaged</span>
              <span className="font-mono tabular-nums">
                Disease &amp; Cure Scanner: Ready
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={activeProfile.id}
            initial={{ opacity: 0, y: 14, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.99 }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            className="flex flex-col justify-between h-full min-w-0"
          >
            <div className="min-w-0">
              {/* Top Minimal Status Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3.5 sm:pb-4 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs min-w-0">
                  <span
                    className={
                      isWeed
                        ? 'text-amber-700 font-semibold flex items-center gap-1.5'
                        : 'text-emerald-700 font-semibold flex items-center gap-1.5'
                    }
                  >
                    {isWeed ? (
                      <>
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>Common Weed Identified</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Medicinal Leaf Verified</span>
                      </>
                    )}
                  </span>
                  <span className="text-slate-300" aria-hidden="true">·</span>
                  <span className="text-slate-500">Family {activeProfile.family}</span>
                  {autoCorrectionReport && (
                    <>
                      <span className="text-slate-300" aria-hidden="true">·</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-semibold ${
                          autoCorrectionReport.wasCorrected
                            ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200/70'
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3 shrink-0" />
                        <span>
                          {autoCorrectionReport.wasCorrected
                            ? `Auto-Corrected (${autoCorrectionReport.initialClassName} → ${autoCorrectionReport.correctedClassName})`
                            : 'Autonomous Lock Verified'}
                        </span>
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-baseline gap-1 shrink-0">
                  <span className="text-xs text-slate-400 mr-1">Confidence</span>
                  <span className="text-lg sm:text-xl font-mono font-bold text-slate-900 tabular-nums">
                    {confidence.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Specimen Title & Voice Controls */}
              <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3.5 sm:gap-4 min-w-0">
                <div className="min-w-0">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight break-words">
                    {activeProfile.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-y-1">
                    <span className="italic">{activeProfile.scientificName}</span>
                    <span className="mx-2" aria-hidden="true">·</span>
                    <span>{activeProfile.leafMorphology.venation} venation</span>
                    <span className="mx-2" aria-hidden="true">·</span>
                    <span>{activeProfile.leafMorphology.margin} margin</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 shrink-0 bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded-2xl border border-slate-100 sm:border-0">
                  {isSpeaking ? (
                    <button
                      type="button"
                      onClick={onStopSpeech}
                      className="min-h-[40px] sm:min-h-[38px] px-3.5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Stop Voice</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => onSpeakNow(activeProfile)}
                        className="min-h-[40px] sm:min-h-[38px] px-3.5 py-2 text-xs font-medium text-slate-800 bg-white sm:bg-slate-100 hover:bg-slate-200 border border-slate-200/80 sm:border-0 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer shadow-2xs sm:shadow-none"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Read Benefits</span>
                      </button>
                      {diseaseDiagnosis && onSpeakDiseaseCure && (
                        <button
                          type="button"
                          onClick={() =>
                            onSpeakDiseaseCure(diseaseDiagnosis, activeProfile.name)
                          }
                          className="min-h-[40px] sm:min-h-[38px] px-3.5 py-2 text-xs font-medium text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <Stethoscope className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Voice Cure</span>
                        </button>
                      )}
                    </>
                  )}
                  <span className="text-xs font-mono text-slate-400 tabular-nums px-1.5 sm:px-0">
                    {!ttsEnabled
                      ? 'Muted'
                      : isSpeaking
                      ? 'Speaking'
                      : cooldownRemainingSec > 0
                      ? `${cooldownRemainingSec}s cooldown`
                      : 'Voice Ready'}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                {activeProfile.summary}
              </p>

              {/* AUTOMATIC DISEASE & CURE INSPECTION PANEL */}
              {diseaseDiagnosis && (
                <div
                  className={`mt-5 rounded-2xl p-4 sm:p-5 border transition-colors min-w-0 ${
                    diseaseDiagnosis.healthStatus === 'Diseased'
                      ? 'bg-rose-50/75 border-rose-200/90'
                      : diseaseDiagnosis.healthStatus === 'Mild Stress'
                      ? 'bg-amber-50/75 border-amber-200/90'
                      : 'bg-emerald-50/60 border-emerald-200/80'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-black/5 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <Stethoscope
                        className={`w-4 h-4 shrink-0 ${
                          diseaseDiagnosis.healthStatus === 'Diseased'
                            ? 'text-rose-600'
                            : diseaseDiagnosis.healthStatus === 'Mild Stress'
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800 truncate">
                        Automatic Disease &amp; Cure Inspection
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold ${
                          diseaseDiagnosis.healthStatus === 'Diseased'
                            ? 'bg-rose-600 text-white'
                            : diseaseDiagnosis.healthStatus === 'Mild Stress'
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {diseaseDiagnosis.healthStatus}
                        {diseaseDiagnosis.affectedAreaPercent > 0
                          ? ` · ${diseaseDiagnosis.affectedAreaPercent}% Area`
                          : ' · 0% Lesions'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-semibold border ${
                          diseaseDiagnosis.safeForHarvest
                            ? 'bg-white/90 text-emerald-800 border-emerald-300'
                            : 'bg-white/90 text-rose-800 border-rose-300'
                        }`}
                      >
                        {diseaseDiagnosis.safeForHarvest
                          ? 'Safe for Harvest'
                          : 'Treat Before Harvest'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-12 gap-4 min-w-0">
                    {/* Left: Diagnosis & Symptoms */}
                    <div className="md:col-span-5 space-y-2 min-w-0">
                      <div>
                        <div className="text-[11px] font-mono text-slate-500">
                          Identified Condition / Pathogen
                        </div>
                        <div className="text-sm font-bold text-slate-900 break-words">
                          {diseaseDiagnosis.diseaseName}
                        </div>
                        <div className="text-xs text-slate-600 italic break-words">
                          {diseaseDiagnosis.pathogenOrCause}
                        </div>
                      </div>

                      <div className="pt-1">
                        <div className="text-[11px] font-semibold text-slate-700 mb-1">
                          Optical Symptoms Detected:
                        </div>
                        <ul className="space-y-1 text-xs text-slate-600">
                          {diseaseDiagnosis.visualSymptoms.map((sym, i) => (
                            <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                              <span className="text-slate-400 font-mono text-[10px] mt-0.5">
                                •
                              </span>
                              <span className="break-words">{sym}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Right: Organic Cure & Preventive Protocol */}
                    <div className="md:col-span-7 bg-white/85 rounded-xl p-3.5 border border-black/5 space-y-2.5 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                          {diseaseDiagnosis.healthStatus === 'Healthy' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          )}
                          <span>Recommended Organic Cure &amp; Action Plan</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {diseaseDiagnosis.inspectionSource}
                        </span>
                      </div>

                      <ol className="space-y-1.5 text-xs text-slate-700">
                        {diseaseDiagnosis.organicCure.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2 leading-relaxed">
                            <span className="font-mono font-bold text-[11px] text-emerald-700 shrink-0 mt-0.5">
                              0{idx + 1}.
                            </span>
                            <span className="break-words">{step}</span>
                          </li>
                        ))}
                      </ol>

                      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
                        <strong className="text-slate-700">Preventive Care: </strong>
                        {diseaseDiagnosis.preventiveCare}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Health Benefits + Radar Split */}
              <div className="mt-5 sm:mt-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 pt-5 border-t border-slate-100 min-w-0">
                <div className="lg:col-span-7 space-y-3.5 sm:space-y-4 min-w-0">
                  <div className="text-xs font-medium text-slate-400">
                    {isWeed
                      ? 'Ecological & Safety Profile'
                      : 'Verified Health Benefits & Mechanisms'}
                  </div>

                  <div className="space-y-3.5">
                    {activeProfile.healthBenefits.map((benefit, idx) => (
                      <motion.div
                        key={benefit.title}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: idx * 0.05,
                          duration: 0.25,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="pb-3.5 border-b border-slate-100 last:border-b-0 last:pb-0"
                      >
                        <div className="text-sm font-semibold text-slate-900">
                          0{idx + 1}. {benefit.title}
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {benefit.mechanism}
                        </p>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {benefit.clinicalNote}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 flex flex-col justify-between bg-slate-50/70 rounded-2xl p-4 border border-slate-100 min-w-0">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>Bioactivity Profile</span>
                      <span className="font-mono">0–100</span>
                    </div>
                    <BioactivityRadarChart
                      metrics={activeProfile.radarMetrics}
                      isWeed={isWeed}
                    />
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/70">
                    <div className="text-xs text-slate-400 mb-2">
                      Active Phytochemicals
                    </div>
                    <div className="space-y-1.5">
                      {activeProfile.activeCompounds.map((c) => (
                        <div
                          key={c.compound}
                          className="flex items-center justify-between text-xs gap-2"
                        >
                          <span className="text-slate-700 truncate">
                            {c.compound}
                          </span>
                          <span className="font-mono tabular-nums text-slate-900 font-medium shrink-0">
                            {c.concentrationMgG.toFixed(1)}
                            <span className="text-[10px] text-slate-400 ml-1">
                              mg/g
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Protocol Strip */}
            <div className="mt-5 sm:mt-6 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium block mb-1">
                  {isWeed ? 'Safe Removal Protocol' : 'Preparation Protocol'}
                </span>
                <p className="text-slate-600 leading-relaxed">
                  {activeProfile.preparationMethod}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium block mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Ecological Stewardship</span>
                </span>
                <p className="text-slate-600 leading-relaxed">
                  {activeProfile.safetyAndEcologicalNote}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

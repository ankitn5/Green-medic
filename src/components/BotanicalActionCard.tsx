import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, ShieldAlert, CheckCircle2, Sparkles } from 'lucide-react';
import { BotanicalClassProfile } from '../data/botanicalData';
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
  onSpeakNow: (profile: BotanicalClassProfile) => void;
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
      className="w-full max-w-[200px] h-auto mx-auto select-none"
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
  onSpeakNow,
  onStopSpeech,
}) => {
  const isWeed = activeProfile.category === 'weed';

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 md:p-7 h-full flex flex-col justify-between overflow-hidden shadow-xs">
      <AnimatePresence mode="wait">
        {isBackgroundOrNoise || !isTriggered ? (
          <motion.div
            key="standby-gate"
            initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col justify-between h-full"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-100 pb-4">
              <div>
                <span>Noise Filter Active</span>
                <span className="mx-2" aria-hidden="true">·</span>
                <span>Trigger Gate ≥ {threshold.toFixed(0)}%</span>
              </div>
              <span className="font-mono tabular-nums">Standby</span>
            </div>

            <div className="my-auto py-12 text-center max-w-md mx-auto">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-28 h-24 mx-auto mb-6 opacity-80"
              >
                <BotanicalSpecimenGraphic
                  specimenId="background"
                  className="w-full h-full rounded-xl"
                  showScaleBar={false}
                />
              </motion.div>

              <h3 className="text-xl font-semibold text-slate-900 tracking-tight mb-2">
                {isBackgroundOrNoise
                  ? 'Background & Non-Botanical Objects Ignored'
                  : `Hold Leaf Steady for ≥ ${threshold.toFixed(0)}% Lock`}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {isBackgroundOrNoise
                  ? 'Hands, faces, empty space, and room surfaces are automatically filtered out. Place a single medicinal leaf or weed in front of the lens.'
                  : `Detecting ${activeProfile.name} (${confidence.toFixed(
                      1
                    )}%). Bring the leaf slightly closer under clear light to cross the ${threshold.toFixed(
                      0
                    )}% verification threshold.`}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-400">
              <span>Skin & Background Gate: Engaged</span>
              <span className="font-mono tabular-nums">
                Voice Output: Muted until ≥ {threshold.toFixed(0)}%
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={activeProfile.id}
            initial={{ opacity: 0, y: 18, scale: 0.985, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -14, scale: 0.985, filter: 'blur(4px)' }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            className="flex flex-col justify-between h-full"
          >
            <div>
              {/* Top Minimal Status Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={
                      isWeed
                        ? 'text-amber-700 font-semibold flex items-center gap-1.5'
                        : 'text-emerald-700 font-semibold flex items-center gap-1.5'
                    }
                  >
                    {isWeed ? (
                      <>
                        <ShieldAlert className="w-4 h-4" />
                        <span>Common Weed Identified</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Medicinal Leaf Verified</span>
                      </>
                    )}
                  </span>
                  <span className="text-slate-300" aria-hidden="true">·</span>
                  <span className="text-slate-500">Family {activeProfile.family}</span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-slate-400 mr-1">Confidence</span>
                  <span className="text-xl font-mono font-bold text-slate-900 tabular-nums">
                    {confidence.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Specimen Title & Voice Controls */}
              <div className="mt-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                    {activeProfile.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    <span className="italic">{activeProfile.scientificName}</span>
                    <span className="mx-2" aria-hidden="true">·</span>
                    <span>{activeProfile.leafMorphology.venation} venation</span>
                    <span className="mx-2" aria-hidden="true">·</span>
                    <span>{activeProfile.leafMorphology.margin} margin</span>
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {isSpeaking ? (
                    <button
                      type="button"
                      onClick={onStopSpeech}
                      className="px-3.5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Stop Voice</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSpeakNow(activeProfile)}
                      className="px-3.5 py-2 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Read Benefits</span>
                    </button>
                  )}
                  <span className="text-xs font-mono text-slate-400 tabular-nums">
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

              {/* Health Benefits + Radar Split */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 border-t border-slate-100">
                <div className="lg:col-span-7 space-y-4">
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
                          delay: idx * 0.06,
                          duration: 0.3,
                          ease: [0.22, 1, 0.36, 1],
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

                <div className="lg:col-span-5 flex flex-col justify-between bg-slate-50/70 rounded-xl p-4 border border-slate-100">
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
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-slate-700 truncate max-w-[160px]">
                            {c.compound}
                          </span>
                          <span className="font-mono tabular-nums text-slate-900 font-medium">
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
            <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
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

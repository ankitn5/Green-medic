import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Volume2, ShieldAlert, CheckCircle2, Leaf, Clock, AlertTriangle, BookOpen, Sparkles, QrCode } from 'lucide-react';
import { BotanicalClassProfile } from '../data/botanicalData';
import { BotanicalSpecimenGraphic } from './BotanicalSpecimenGraphic';

interface SpecimenDetailModalProps {
  specimen: BotanicalClassProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSpeak: (profile: BotanicalClassProfile) => void;
  onOpenQr?: (specimen: BotanicalClassProfile) => void;
}

export const SpecimenDetailModal: React.FC<SpecimenDetailModalProps> = ({
  specimen,
  isOpen,
  onClose,
  onSpeak,
  onOpenQr,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'recipes' | 'compounds' | 'safety'>('overview');

  if (!specimen) return null;

  const isWeed = specimen.category === 'weed';
  const isBackground = specimen.category === 'background';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
          />

          {/* Modal Card / Bottom Sheet on Mobile */}
          <motion.div
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.8 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="relative w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden z-10"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-specimen-title"
          >
            {/* Mobile Sheet Drag Handle */}
            <div className="sm:hidden pt-3 pb-1 flex justify-center">
              <div className="w-12 h-1.5 rounded-full bg-slate-300" />
            </div>

            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                  <BotanicalSpecimenGraphic specimenId={specimen.id} className="w-10 h-10" showScaleBar={false} />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-mono">{specimen.classificationCode}</span>
                    <span aria-hidden="true">·</span>
                    <span>Order {specimen.botanicalOrder}</span>
                    <span aria-hidden="true">·</span>
                    <span>Family {specimen.family}</span>
                  </div>
                  <h3 id="modal-specimen-title" className="text-xl font-bold text-slate-900 tracking-tight">
                    {specimen.name}
                  </h3>
                  <p className="text-xs italic text-slate-500">{specimen.scientificName}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {onOpenQr && !isBackground && (
                  <button
                    type="button"
                    onClick={() => onOpenQr(specimen)}
                    title="View plant pot QR tag"
                    className="p-2 text-cyan-800 bg-cyan-50 hover:bg-cyan-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 text-cyan-700" />
                  </button>
                )}
                {!isBackground && (
                  <button
                    type="button"
                    onClick={() => onSpeak(specimen)}
                    title="Listen to health profile"
                    className="p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4 text-emerald-700" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabs for In-Depth Exploration */}
            <div className="px-6 pt-3 border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
              {(
                [
                  { id: 'overview', label: 'Overview & Benefits', icon: BookOpen },
                  { id: 'recipes', label: 'Field Recipes & Use', icon: Sparkles },
                  { id: 'compounds', label: 'Phytochemistry', icon: Leaf },
                  { id: 'safety', label: 'Safety & Harvest', icon: AlertTriangle },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-2.5 px-3 border-b-2 font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                      activeTab === tab.id
                        ? 'border-emerald-600 text-emerald-800'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-600">
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Taxonomic Summary
                    </h4>
                    <p className="text-slate-700 leading-relaxed">{specimen.summary}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                      {isWeed ? 'Ecological Management & Warnings' : 'Primary Pharmacological Actions'}
                    </h4>
                    <div className="space-y-3">
                      {specimen.healthBenefits.map((b, i) => (
                        <div key={b.title} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                            {isWeed ? (
                              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            )}
                            <span>0{i + 1}. {b.title}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{b.mechanism}</p>
                          <div className="text-[11px] text-slate-400 mt-1.5 font-mono">
                            Clinical Observation: {b.clinicalNote}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <span className="text-slate-400 block mb-0.5">Venation & Margin</span>
                      <span className="font-medium text-slate-900">
                        {specimen.leafMorphology.venation} · {specimen.leafMorphology.margin}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <span className="text-slate-400 block mb-0.5">Petiole Structure</span>
                      <span className="font-medium text-slate-900">
                        {specimen.leafMorphology.petioleType}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'recipes' && (
                <div className="space-y-4">
                  {specimen.recipes.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      No therapeutic preparations applicable for this non-botanical class.
                    </div>
                  ) : (
                    specimen.recipes.map((recipe) => (
                      <div key={recipe.name} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-semibold text-slate-900 text-xs">{recipe.name}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {recipe.type}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-mono">Dosage: {recipe.dosage}</div>
                        <ol className="list-decimal list-inside space-y-1 text-xs text-slate-700 pl-1">
                          {recipe.steps.map((st, idx) => (
                            <li key={idx} className="leading-relaxed">{st}</li>
                          ))}
                        </ol>
                        <div className="text-[11px] text-amber-700/90 pt-1 border-t border-slate-200/60">
                          Precaution: {recipe.precautions}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'compounds' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500">
                    Active phytochemical constituents identified through high-performance liquid chromatography (HPLC) standards:
                  </p>
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
                    {specimen.activeCompounds.map((c) => (
                      <div key={c.compound} className="p-3 flex items-start justify-between gap-4 text-xs">
                        <div>
                          <div className="font-semibold text-slate-900">{c.compound}</div>
                          <div className="text-slate-500 mt-0.5">{c.role}</div>
                        </div>
                        <div className="text-right font-mono shrink-0">
                          <span className="font-bold text-slate-900">{c.concentrationMgG.toFixed(1)}</span>
                          <span className="text-slate-400 text-[10px] ml-1">mg/g</span>
                          <div className="text-[10px] text-emerald-700 font-medium">Score {c.bioactivityScore}/100</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'safety' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>Optimal Field Harvesting Window</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{specimen.optimalHarvestTime}</p>
                  </div>

                  {specimen.contraindications.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/60 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Contraindications & Cautions</span>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-xs text-amber-900/80">
                        {specimen.contraindications.map((ci, idx) => (
                          <li key={idx}>{ci}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                    <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">
                      Ecological Stewardship Principle
                    </span>
                    <p className="text-slate-700 leading-relaxed">{specimen.safetyAndEcologicalNote}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
              <span>8th-Grade Competition Botanical Dossier</span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

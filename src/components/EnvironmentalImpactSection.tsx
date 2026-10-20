import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Volume2, BookOpen, QrCode } from 'lucide-react';
import { BOTANICAL_CLASSES, BotanicalClassProfile } from '../data/botanicalData';
import { BotanicalSpecimenGraphic } from './BotanicalSpecimenGraphic';
import { SpecimenDetailModal } from './SpecimenDetailModal';

interface EnvironmentalImpactSectionProps {
  onSpeakProfile: (profile: BotanicalClassProfile) => void;
  onOpenQrModal?: (specimen: BotanicalClassProfile) => void;
}

export const EnvironmentalImpactSection: React.FC<
  EnvironmentalImpactSectionProps
> = ({ onSpeakProfile, onOpenQrModal }) => {
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'medicinal' | 'weed' | 'background'
  >('all');
  const [gardenAreaSqM, setGardenAreaSqM] = useState<number>(120);
  const [communityHouseholds, setCommunityHouseholds] = useState<number>(45);
  const [inspectingSpecimen, setInspectingSpecimen] = useState<BotanicalClassProfile | null>(null);

  const filteredSpecimens = BOTANICAL_CLASSES.filter((cls) =>
    selectedCategory === 'all' ? true : cls.category === selectedCategory
  );

  const herbicideAvoidedMlPerYear = Math.round(gardenAreaSqM * 18.5);
  const groundwaterProtectedLiters = Math.round(herbicideAvoidedMlPerYear * 42);
  const co2PackagingSavedKg = Number(
    (communityHouseholds * 1.85 + gardenAreaSqM * 0.14).toFixed(1)
  );
  const pollinatorSurvivalBoostPct = Math.min(
    94.0,
    Number((68 + (gardenAreaSqM / 500) * 22).toFixed(1))
  );

  return (
    <>
      {/* Specimen Deep-Dive Modal */}
      <SpecimenDetailModal
        specimen={inspectingSpecimen}
        isOpen={Boolean(inspectingSpecimen)}
        onClose={() => setInspectingSpecimen(null)}
        onSpeak={onSpeakProfile}
      />

      {/* Botanical Classification Reference Guide */}
      <section
        id="specimens"
        className="py-10 md:py-14 border-t border-slate-200/80 scroll-mt-20"
        aria-labelledby="specimens-heading"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8">
          <div>
            <div className="text-xs text-slate-400">
              <span>02. Botanical Reference Library</span>
              <span className="mx-2" aria-hidden="true">·</span>
              <span>3 Medicinal Leaves, 1 Weed & Noise Gate</span>
            </div>
            <h2
              id="specimens-heading"
              className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mt-1"
            >
              Taxonomic Reference & Field Guide
            </h2>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto no-scrollbar shrink-0 max-w-full">
            {(
              [
                { id: 'all', label: 'All Classes' },
                { id: 'medicinal', label: 'Medicinal Leaves' },
                { id: 'weed', label: 'Common Weed' },
                { id: 'background', label: 'Noise Filter' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`min-h-[38px] px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5">
          {filteredSpecimens.map((specimen) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 25 }}
              key={specimen.id}
              className="bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between p-4 md:p-5 shadow-xs hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span className="font-mono">{specimen.classificationCode}</span>
                  <span className="text-[11px] font-medium">
                    {specimen.category === 'medicinal'
                      ? 'Medicinal'
                      : specimen.category === 'weed'
                      ? 'Weed'
                      : 'Noise Gate'}
                  </span>
                </div>

                <div
                  onClick={() => setInspectingSpecimen(specimen)}
                  className="cursor-pointer group relative"
                  title="Click to view detailed botanical dossier"
                >
                  <BotanicalSpecimenGraphic
                    specimenId={specimen.id}
                    className="w-full h-36 rounded-xl mb-3.5 group-hover:scale-[1.01] transition-transform"
                  />
                  <div className="absolute inset-0 rounded-xl bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors" />
                </div>

                <h3
                  onClick={() => setInspectingSpecimen(specimen)}
                  className="text-base font-semibold text-slate-900 tracking-tight cursor-pointer hover:text-emerald-700 transition-colors"
                >
                  {specimen.name}
                </h3>
                <p className="text-xs italic text-slate-400 mt-0.5">
                  {specimen.scientificName}
                </p>

                <p className="mt-2 text-xs text-slate-500 leading-relaxed line-clamp-3">
                  {specimen.summary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setInspectingSpecimen(specimen)}
                  className="min-h-[38px] px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dossier</span>
                </button>

                {onOpenQrModal && specimen.id !== 'background' && (
                  <button
                    type="button"
                    onClick={() => onOpenQrModal(specimen)}
                    title={`Generate and view pot QR tag for ${specimen.name}`}
                    className="min-h-[38px] px-2.5 py-1.5 text-xs font-medium text-cyan-800 hover:text-cyan-900 bg-cyan-50 hover:bg-cyan-100/80 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-cyan-600" />
                    <span>QR Tag</span>
                  </button>
                )}

                {specimen.id !== 'background' && (
                  <button
                    type="button"
                    onClick={() => onSpeakProfile(specimen)}
                    title={`Listen to ${specimen.name} health benefits`}
                    className="min-h-[38px] px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="hidden sm:inline">Voice</span>
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Environmental & Health Impact Section */}
      <section
        id="impact"
        className="py-10 md:py-14 border-t border-slate-200/80 scroll-mt-20"
        aria-labelledby="impact-heading"
      >
        <div className="mb-6 md:mb-8 max-w-3xl">
          <div className="text-xs text-slate-400">
            <span>03. Environmental & Public Health Impact</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>Ecological Stewardship in Action</span>
          </div>
          <h2
            id="impact-heading"
            className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mt-1"
            style={{ textWrap: 'balance' }}
          >
            How Machine Vision Protects Biodiversity & Public Health
          </h2>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Distinguishing medicinal leaves from invasive weeds in real time protects soil ecosystems from blanket chemical herbicides while preventing accidental harvesting of look-alike weeds.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 grid grid-cols-1 gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span>01. Targeted Weed Removal</span>
                <span className="font-mono text-emerald-700 font-semibold">
                  -92% Herbicide Runoff
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
                Eliminating Blanket Chemical Spraying
              </h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                By isolating competitive weeds such as <em>Parthenium</em> and <em>Taraxacum</em> from medicinal herbs at ≥85% confidence, growers can mechanically uproot invasive weeds before seed dispersal—keeping synthetic herbicides out of groundwater and protecting beneficial soil mycorrhizae.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span>02. Biodiversity & Safe Foraging</span>
                <span className="font-mono text-emerald-700 font-semibold">
                  100% Non-Destructive Scan
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
                Protecting Pollinator Flora & Preventing Misidentification
              </h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                Live optical scanning identifies leaves while still attached to the living stem, preventing unnecessary uprooting of native plants and guarding families against allergenic look-alike weeds.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span>03. Sustainable Primary Health</span>
                <span className="font-mono text-slate-700 font-semibold">
                  On-Device Edge AI
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
                Accessible Phytomedicine with Zero Packaging Waste
              </h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                Running the Teachable Machine neural network directly in the browser consumes minimal energy while guiding evidence-based home herbal infusions for minor respiratory, digestive, and skin care.
              </p>
            </div>
          </div>

          {/* Interactive Impact Projection */}
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 flex flex-col justify-between shadow-xs">
            <div>
              <div className="border-b border-slate-100 pb-4">
                <div className="text-xs text-slate-400">Impact Projection Calculator</div>
                <h3 className="text-lg font-semibold text-slate-900 tracking-tight mt-0.5">
                  Community Garden Ecological Estimator
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Simulate ecological benefits over a 1-year growing season based on optical leaf identification
                </p>
              </div>

              <div className="mt-5 space-y-5">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <label
                      htmlFor="garden-area-slider"
                      className="font-medium text-slate-600"
                    >
                      Cultivated Garden Area
                    </label>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {gardenAreaSqM} m²
                    </span>
                  </div>
                  <input
                    id="garden-area-slider"
                    type="range"
                    min={20}
                    max={500}
                    step={10}
                    value={gardenAreaSqM}
                    onChange={(e) => setGardenAreaSqM(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                    <span>20 m² (Plot)</span>
                    <span>250 m² (Community)</span>
                    <span>500 m² (Farm)</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <label
                      htmlFor="households-slider"
                      className="font-medium text-slate-600"
                    >
                      Participating Households
                    </label>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {communityHouseholds} households
                    </span>
                  </div>
                  <input
                    id="households-slider"
                    type="range"
                    min={10}
                    max={200}
                    step={5}
                    value={communityHouseholds}
                    onChange={(e) =>
                      setCommunityHouseholds(Number(e.target.value))
                    }
                    className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                    <span>10 homes</span>
                    <span>100 homes</span>
                    <span>200 homes</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-3">
              <div className="bg-slate-50/80 rounded-xl p-3.5">
                <div className="text-[11px] text-slate-400">
                  Herbicide Avoided
                </div>
                <div className="mt-1 flex items-baseline">
                  <span className="text-xl font-mono font-bold text-slate-900 tabular-nums">
                    {herbicideAvoidedMlPerYear.toLocaleString()}
                  </span>
                  <span className="text-xs font-mono text-slate-400 ml-1">
                    mL/yr
                  </span>
                </div>
              </div>

              <div className="bg-slate-50/80 rounded-xl p-3.5">
                <div className="text-[11px] text-slate-400">
                  Water Protected
                </div>
                <div className="mt-1 flex items-baseline">
                  <span className="text-xl font-mono font-bold text-emerald-700 tabular-nums">
                    {groundwaterProtectedLiters.toLocaleString()}
                  </span>
                  <span className="text-xs font-mono text-slate-400 ml-1">
                    L
                  </span>
                </div>
              </div>

              <div className="bg-slate-50/80 rounded-xl p-3.5">
                <div className="text-[11px] text-slate-400">
                  Packaging CO₂e Saved
                </div>
                <div className="mt-1 flex items-baseline">
                  <span className="text-xl font-mono font-bold text-slate-900 tabular-nums">
                    {co2PackagingSavedKg.toFixed(1)}
                  </span>
                  <span className="text-xs font-mono text-slate-400 ml-1">
                    kg/yr
                  </span>
                </div>
              </div>

              <div className="bg-slate-50/80 rounded-xl p-3.5">
                <div className="text-[11px] text-slate-400">
                  Pollinator Retention
                </div>
                <div className="mt-1 flex items-baseline">
                  <span className="text-xl font-mono font-bold text-emerald-700 tabular-nums">
                    {pollinatorSurvivalBoostPct.toFixed(1)}
                  </span>
                  <span className="text-xs font-mono text-slate-400 ml-1">
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

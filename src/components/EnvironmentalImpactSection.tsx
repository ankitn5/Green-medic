import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Volume2, BookOpen, QrCode, ArrowDown, Rows3, Columns3 } from 'lucide-react';
import { BOTANICAL_CLASSES, BotanicalClassProfile } from '../data/botanicalData';
import { BotanicalSpecimenGraphic } from './BotanicalSpecimenGraphic';
import { SpecimenDetailModal } from './SpecimenDetailModal';

interface EnvironmentalImpactSectionProps {
  onSpeakProfile: (profile: BotanicalClassProfile) => void;
  onOpenQrModal?: (specimen: BotanicalClassProfile) => void;
  activeSection?: 'all' | 'specimens' | 'impact';
  onNavigateToScanner?: () => void;
}

export const EnvironmentalImpactSection: React.FC<
  EnvironmentalImpactSectionProps
> = ({ onSpeakProfile, onOpenQrModal, activeSection = 'all', onNavigateToScanner }) => {
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'medicinal' | 'weed' | 'background'
  >('all');
  const [mobileViewMode, setMobileViewMode] = useState<'stream' | 'stack'>('stream');
  const [gardenAreaSqM, setGardenAreaSqM] = useState<number>(120);
  const [communityHouseholds, setCommunityHouseholds] = useState<number>(45);
  const [inspectingSpecimen, setInspectingSpecimen] = useState<BotanicalClassProfile | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);

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

  const showSpecimens = activeSection === 'all' || activeSection === 'specimens';
  const showImpact = activeSection === 'all' || activeSection === 'impact';

  return (
    <>
      {/* Specimen Deep-Dive Modal */}
      <SpecimenDetailModal
        specimen={inspectingSpecimen}
        isOpen={Boolean(inspectingSpecimen)}
        onClose={() => setInspectingSpecimen(null)}
        onSpeak={onSpeakProfile}
        onOpenQr={onOpenQrModal}
      />

      {/* Mobile River Flow Connector into Section 02 (only shown in single-page all mode) */}
      {activeSection === 'all' && (
        <div className="lg:hidden flex flex-col items-center py-4" aria-hidden="true">
          <div className="w-px h-8 bg-gradient-to-b from-slate-200 via-emerald-400/70 to-slate-200 river-connector-pulse" />
          <div className="my-1 px-3 py-1 rounded-full bg-emerald-50/80 border border-emerald-200/60 text-[10px] font-mono text-emerald-800 flex items-center gap-1">
            <ArrowDown className="w-3 h-3 text-emerald-600" />
            <span>02 · Taxonomic Stream</span>
          </div>
          <div className="w-px h-6 bg-gradient-to-b from-emerald-400/70 to-slate-200" />
        </div>
      )}

      {/* Botanical Classification Reference Guide */}
      {showSpecimens && (
        <section
          id="specimens"
          className="py-6 sm:py-10 md:py-14 scroll-mt-20"
          aria-labelledby="specimens-heading"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5 md:mb-8">
            <div>
              <div className="text-xs text-slate-400">
                <span>02. Botanical Reference Library</span>
                <span className="mx-2" aria-hidden="true">·</span>
                <span>3 Medicinal Leaves, 1 Weed & Noise Gate</span>
              </div>
              <h2
                id="specimens-heading"
                className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mt-1"
                style={{ textWrap: 'balance' }}
              >
                Taxonomic Reference & Field Guide
              </h2>
            </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Category Filter Controls */}
            <div className="grid grid-cols-4 sm:flex items-center gap-1 p-1 bg-slate-200/60 rounded-2xl sm:rounded-xl w-full sm:w-auto">
              {(
                [
                  { id: 'all', label: 'All Classes', shortLabel: 'All' },
                  { id: 'medicinal', label: 'Medicinal Leaves', shortLabel: 'Medicinal' },
                  { id: 'weed', label: 'Common Weed', shortLabel: 'Weed' },
                  { id: 'background', label: 'Noise Filter', shortLabel: 'Noise' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`min-h-[42px] sm:min-h-[38px] px-2 sm:px-3.5 py-1.5 text-xs font-medium rounded-xl sm:rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center justify-center ${
                    selectedCategory === tab.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="sm:hidden">{tab.shortLabel}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Mobile Flow Layout Switcher (Horizontal Swipe River vs Vertical River) */}
            <div className="flex sm:hidden items-center justify-between bg-white border border-slate-200/80 rounded-2xl px-3 py-1.5 text-xs text-slate-500">
              <span>Mobile Flow View</span>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setMobileViewMode('stream')}
                  className={`min-h-[34px] px-2.5 py-1 rounded-lg flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer ${
                    mobileViewMode === 'stream'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500'
                  }`}
                >
                  <Columns3 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Swipe River</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileViewMode('stack')}
                  className={`min-h-[34px] px-2.5 py-1 rounded-lg flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer ${
                    mobileViewMode === 'stack'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500'
                  }`}
                >
                  <Rows3 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Vertical</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Specimen Stream: Horizontal Snap Carousel on Mobile (when 'stream' active) or Vertical Stack, Multi-Column Grid on Tablet/Desktop */}
        <div
          ref={carouselRef}
          className={
            mobileViewMode === 'stream'
              ? 'flex sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5 overflow-x-auto sm:overflow-visible snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 pb-3 sm:pb-0 no-scrollbar'
              : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5'
          }
        >
          {filteredSpecimens.map((specimen) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 25 }}
              key={specimen.id}
              className={`${
                mobileViewMode === 'stream'
                  ? 'w-[84vw] max-w-[320px] shrink-0 snap-center sm:w-auto sm:max-w-none sm:shrink'
                  : 'w-full'
              } bg-white border border-slate-200/90 rounded-3xl sm:rounded-2xl flex flex-col justify-between p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-colors`}
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
                  title="Tap to view detailed botanical dossier"
                >
                  <BotanicalSpecimenGraphic
                    specimenId={specimen.id}
                    className="w-full h-36 rounded-2xl sm:rounded-xl mb-3.5 group-hover:scale-[1.01] transition-transform"
                  />
                  <div className="absolute inset-0 rounded-2xl sm:rounded-xl bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors" />
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

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setInspectingSpecimen(specimen)}
                  className="flex-1 min-h-[44px] sm:min-h-[38px] px-2.5 py-1.5 text-xs font-medium text-slate-800 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Dossier</span>
                </button>

                {onOpenQrModal && specimen.id !== 'background' && (
                  <button
                    type="button"
                    onClick={() => onOpenQrModal(specimen)}
                    title={`Generate and view pot QR tag for ${specimen.name}`}
                    className="flex-1 min-h-[44px] sm:min-h-[38px] px-2.5 py-1.5 text-xs font-medium text-cyan-800 hover:text-cyan-900 bg-cyan-50 hover:bg-cyan-100/80 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    <QrCode className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                    <span>QR Tag</span>
                  </button>
                )}

                {specimen.id !== 'background' && (
                  <button
                    type="button"
                    onClick={() => onSpeakProfile(specimen)}
                    title={`Listen to ${specimen.name} health benefits`}
                    className="min-h-[44px] min-w-[44px] sm:min-h-[38px] sm:min-w-0 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-emerald-700" />
                    <span className="hidden sm:inline">Voice</span>
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Swipe Hint when in Horizontal River Mode */}
        {mobileViewMode === 'stream' && filteredSpecimens.length > 1 && (
          <div className="sm:hidden mt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <span>Swipe left/right to flow through {filteredSpecimens.length} specimens</span>
          </div>
        )}

        {/* Quick Launch CTA if viewed as standalone page */}
        {activeSection === 'specimens' && onNavigateToScanner && (
          <div className="mt-8 p-4 sm:p-5 bg-gradient-to-r from-emerald-50/90 to-teal-50/90 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-emerald-950">Ready to test these leaves in the field?</h4>
              <p className="text-xs text-emerald-800/80 mt-0.5">Switch to the Optical Scanner to detect live specimens with your camera or uploaded photo.</p>
            </div>
            <button
              type="button"
              onClick={onNavigateToScanner}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors shrink-0 shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Launch Live Camera Scanner</span>
            </button>
          </div>
        )}
      </section>
      )}

      {/* Mobile River Flow Connector into Section 03 (only in single-page all mode) */}
      {activeSection === 'all' && (
        <div className="lg:hidden flex flex-col items-center py-4" aria-hidden="true">
          <div className="w-px h-8 bg-gradient-to-b from-slate-200 via-emerald-400/70 to-slate-200 river-connector-pulse" />
          <div className="my-1 px-3 py-1 rounded-full bg-emerald-50/80 border border-emerald-200/60 text-[10px] font-mono text-emerald-800 flex items-center gap-1">
            <ArrowDown className="w-3 h-3 text-emerald-600" />
            <span>03 · Ecological Impact Flow</span>
          </div>
          <div className="w-px h-6 bg-gradient-to-b from-emerald-400/70 to-slate-200" />
        </div>
      )}

      {/* Environmental & Health Impact Section */}
      {showImpact && (
        <section
          id="impact"
          className="py-6 sm:py-10 md:py-14 scroll-mt-20"
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 items-stretch">
          {/* 3 Impact Pillars with continuous mobile vertical river connector */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="bg-white border border-slate-200/90 rounded-3xl sm:rounded-2xl p-5 md:p-6 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span>01. Targeted Weed Removal</span>
                <span className="font-mono text-emerald-700 font-semibold tabular-nums">
                  -92% Herbicide Runoff
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
                Eliminating Blanket Chemical Spraying
              </h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                By isolating competitive weeds such as <strong>Crabgrass</strong> (<em>Digitaria sanguinalis</em>) from medicinal herbs at ≥85% confidence, growers can mechanically uproot invasive grass crowns before seed dispersal—keeping synthetic herbicides out of groundwater and protecting beneficial soil mycorrhizae.
              </p>
            </div>

            {/* Subtle river step connector on mobile */}
            <div className="h-3 sm:h-4 flex justify-center lg:hidden" aria-hidden="true">
              <div className="w-px h-full bg-emerald-300/70" />
            </div>

            <div className="bg-white border border-slate-200/90 rounded-3xl sm:rounded-2xl p-5 md:p-6 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span>02. Biodiversity & Safe Foraging</span>
                <span className="font-mono text-emerald-700 font-semibold tabular-nums">
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

            {/* Subtle river step connector on mobile */}
            <div className="h-3 sm:h-4 flex justify-center lg:hidden" aria-hidden="true">
              <div className="w-px h-full bg-emerald-300/70" />
            </div>

            <div className="bg-white border border-slate-200/90 rounded-3xl sm:rounded-2xl p-5 md:p-6 shadow-xs">
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
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl sm:rounded-2xl p-5 md:p-6 flex flex-col justify-between shadow-xs">
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
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <label
                      htmlFor="garden-area-slider"
                      className="font-medium text-slate-700"
                    >
                      Cultivated Garden Area
                    </label>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {gardenAreaSqM} m²
                    </span>
                  </div>
                  <div className="min-h-[36px] flex items-center">
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
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>20 m² (Plot)</span>
                    <span>250 m² (Community)</span>
                    <span>500 m² (Farm)</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <label
                      htmlFor="households-slider"
                      className="font-medium text-slate-700"
                    >
                      Participating Households
                    </label>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {communityHouseholds} households
                    </span>
                  </div>
                  <div className="min-h-[36px] flex items-center">
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
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>10 homes</span>
                    <span>100 homes</span>
                    <span>200 homes</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-3">
              <div className="bg-slate-50/80 rounded-2xl p-3.5">
                <div className="text-[11px] text-slate-400">
                  Herbicide Avoided
                </div>
                <div className="mt-1 flex items-baseline">
                  <span className="text-lg sm:text-xl font-mono font-bold text-slate-900 tabular-nums">
                    {herbicideAvoidedMlPerYear.toLocaleString()}
                  </span>
                  <span className="text-xs font-mono text-slate-400 ml-1">
                    mL/yr
                  </span>
                </div>
              </div>

              <div className="bg-slate-50/80 rounded-2xl p-3.5">
                <div className="text-[11px] text-slate-400">
                  Water Protected
                </div>
                <div className="mt-1 flex items-baseline">
                  <span className="text-lg sm:text-xl font-mono font-bold text-emerald-700 tabular-nums">
                    {groundwaterProtectedLiters.toLocaleString()}
                  </span>
                  <span className="text-xs font-mono text-slate-400 ml-1">
                    L
                  </span>
                </div>
              </div>

              <div className="bg-slate-50/80 rounded-2xl p-3.5">
                <div className="text-[11px] text-slate-400">
                  Packaging CO₂e Saved
                </div>
                <div className="mt-1 flex items-baseline">
                  <span className="text-lg sm:text-xl font-mono font-bold text-slate-900 tabular-nums">
                    {co2PackagingSavedKg.toFixed(1)}
                  </span>
                  <span className="text-xs font-mono text-slate-400 ml-1">
                    kg/yr
                  </span>
                </div>
              </div>

              <div className="bg-slate-50/80 rounded-2xl p-3.5">
                <div className="text-[11px] text-slate-400">
                  Pollinator Retention
                </div>
                <div className="mt-1 flex items-baseline">
                  <span className="text-lg sm:text-xl font-mono font-bold text-emerald-700 tabular-nums">
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
      )}
    </>
  );
};

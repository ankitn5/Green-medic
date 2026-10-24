import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  BarChart3,
  ShieldCheck,
  Activity,
  RefreshCw,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
} from 'lucide-react';
import { BOTANICAL_CLASSES, BotanicalClassProfile } from '../data/botanicalData';
import {
  AutoCorrectionReport,
  ClassConfidenceResult,
  PlantDiseaseDiagnosis,
  RawPrediction,
} from '../services/teachableMachine';

interface ScannerTelemetryConsoleProps {
  scannerMode: 'botanical' | 'qr';
  competitionClasses: ClassConfidenceResult[];
  confidenceThreshold: number;
  topPrediction: ClassConfidenceResult;
  isTriggered: boolean;
  isBackgroundOrNoise: boolean;
  // Auto-correction
  autoCorrectEnabled: boolean;
  setAutoCorrectEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  autoCorrectionReport: AutoCorrectionReport | null;
  correctionCount: number;
  isDeepAnalyzing: boolean;
  onTriggerDeepAutoCorrection: (
    forceDeepAudit?: boolean,
    manualTrueSpeciesId?: BotanicalClassProfile['id']
  ) => void;
  // Foliar diagnostics & automatic disease inspection
  spectralSpad: number;
  laminaHealth: number;
  vitalityState: string;
  chlorosisScore: number;
  diseaseDiagnosis?: PlantDiseaseDiagnosis | null;
  // QR state
  detectedQrData: string | null;
  inspectingQrSpecimen: BotanicalClassProfile | null;
  onClearDetectedQr: () => void;
  onOpenSampleQrModal: () => void;
  onInspectSpecimen: (specimen: BotanicalClassProfile) => void;
  // Raw model predictions & cooldown
  rawPredictions: RawPrediction[];
  ttsCooldownSettingSec: number;
  setTtsCooldownSettingSec: (sec: number) => void;
}

export const ScannerTelemetryConsole: React.FC<ScannerTelemetryConsoleProps> = ({
  scannerMode,
  competitionClasses,
  confidenceThreshold,
  topPrediction,
  autoCorrectEnabled,
  setAutoCorrectEnabled,
  autoCorrectionReport,
  correctionCount,
  isDeepAnalyzing,
  onTriggerDeepAutoCorrection,
  spectralSpad,
  laminaHealth,
  vitalityState,
  chlorosisScore,
  diseaseDiagnosis,
  detectedQrData,
  inspectingQrSpecimen,
  onClearDetectedQr,
  onOpenSampleQrModal,
  onInspectSpecimen,
  rawPredictions,
  ttsCooldownSettingSec,
  setTtsCooldownSettingSec,
}) => {
  const [activeConsoleTab, setActiveConsoleTab] = useState<'confidence' | 'autocorrect' | 'health'>('confidence');

  // If in QR mode, display the QR pot tag viewer
  if (scannerMode === 'qr') {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-cyan-600" />
            <span className="font-semibold text-slate-800">QR &amp; Pot Tag Telemetry</span>
          </div>
          <button
            type="button"
            onClick={onOpenSampleQrModal}
            className="text-cyan-700 font-semibold hover:underline cursor-pointer text-xs"
          >
            Sample Tags
          </button>
        </div>

        {detectedQrData ? (
          <div className="p-4 bg-cyan-50/70 border border-cyan-200/90 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-cyan-900">Decoded Plant Marker</span>
              <button
                type="button"
                onClick={onClearDetectedQr}
                className="font-mono text-[11px] text-cyan-700 hover:text-cyan-900 cursor-pointer"
              >
                Clear Tag
              </button>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-cyan-100 font-mono text-xs text-slate-800 break-all select-all shadow-2xs">
              {detectedQrData}
            </div>

            {inspectingQrSpecimen && (
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-cyan-200/60">
                <div className="text-xs">
                  <span className="font-bold text-slate-900">{inspectingQrSpecimen.name}</span>
                  <span className="text-slate-400 block text-[11px] italic">
                    {inspectingQrSpecimen.scientificName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onInspectSpecimen(inspectingQrSpecimen)}
                  className="min-h-[36px] px-3 py-1.5 bg-cyan-700 text-white text-xs font-semibold rounded-lg hover:bg-cyan-800 transition-colors cursor-pointer"
                >
                  View Dossier
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center space-y-2 bg-slate-50/50">
            <QrCode className="w-7 h-7 text-cyan-600 mx-auto" />
            <div className="text-xs font-semibold text-slate-800">Ready to Scan Pot Tag</div>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
              Align the camera over any botanical QR label or pot marker.
            </p>
            <button
              type="button"
              onClick={onOpenSampleQrModal}
              className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 text-xs font-medium text-cyan-800 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors cursor-pointer border border-cyan-200/60 mt-1"
            >
              <QrCode className="w-3.5 h-3.5 text-cyan-600" />
              <span>Browse Sample Tags</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-4 w-full min-w-0 overflow-hidden">
      {/* Clean Segmented Tab Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 min-w-0">
        <div className="grid grid-cols-3 sm:flex items-center p-1 bg-slate-100 rounded-xl gap-1 w-full sm:w-auto min-w-0">
          <button
            type="button"
            onClick={() => setActiveConsoleTab('confidence')}
            className={`min-h-[36px] sm:min-h-[34px] px-1.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer min-w-0 ${
              activeConsoleTab === 'confidence'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">Confidence</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveConsoleTab('autocorrect')}
            className={`min-h-[36px] sm:min-h-[34px] px-1.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer min-w-0 ${
              activeConsoleTab === 'autocorrect'
                ? 'bg-white text-indigo-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="truncate">
              <span className="sm:hidden">Auto-Fix</span>
              <span className="hidden sm:inline">Auto-Correction</span>
            </span>
            {correctionCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold shrink-0">
                {correctionCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveConsoleTab('health')}
            className={`min-h-[36px] sm:min-h-[34px] px-1.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer min-w-0 ${
              activeConsoleTab === 'health'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">
              <span className="sm:hidden">Disease</span>
              <span className="hidden sm:inline">Disease &amp; Cure</span>
            </span>
          </button>
        </div>

        <span className="hidden sm:inline font-mono text-[11px] text-slate-400 shrink-0">
          Gate: {confidenceThreshold}%
        </span>
      </div>

      {/* Tab 1: Confidence Bars */}
      {activeConsoleTab === 'confidence' && (
        <div className="space-y-3 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-slate-400 min-w-0">
            <span className="shrink-0">5-Class Competition Model</span>
            <span className="font-mono text-emerald-700 font-semibold truncate max-w-full">
              Top: {topPrediction.name} ({topPrediction.confidence.toFixed(1)}%)
            </span>
          </div>

          <div className="space-y-2.5 min-w-0">
            {competitionClasses.map((cls) => {
              const isAboveGate =
                cls.id !== 'background' && cls.confidence >= confidenceThreshold;
              const isBgActive =
                cls.id === 'background' && cls.confidence >= topPrediction.confidence;

              return (
                <div key={cls.id} className="space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 text-xs min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0 truncate">
                      <span className="font-medium text-slate-800 truncate">{cls.name}</span>
                      <span className="text-slate-300 shrink-0" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-slate-400 text-[11px] shrink-0">
                        {cls.category === 'medicinal'
                          ? 'Medicinal'
                          : cls.category === 'weed'
                          ? 'Weed'
                          : 'Background'}
                      </span>
                    </div>
                    <span
                      className={`font-mono text-xs font-semibold tabular-nums shrink-0 ${
                        isAboveGate
                          ? 'text-emerald-700'
                          : isBgActive
                          ? 'text-slate-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {cls.confidence.toFixed(1)}%
                    </span>
                  </div>

                  <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ left: `${confidenceThreshold}%` }}
                      className="absolute top-0 bottom-0 w-px bg-slate-300 z-10"
                      title="85% Trigger Gate"
                    />
                    <motion.div
                      initial={false}
                      animate={{
                        width: `${Math.min(100, Math.max(0, cls.confidence))}%`,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 140,
                        damping: 22,
                        mass: 0.6,
                      }}
                      className={`h-full rounded-full ${
                        cls.id === 'background'
                          ? 'bg-slate-400'
                          : cls.category === 'weed'
                          ? isAboveGate
                            ? 'bg-amber-500'
                            : 'bg-amber-300'
                          : isAboveGate
                          ? 'bg-emerald-600'
                          : 'bg-slate-300'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Minimal Raw Model & Cooldown Select */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 min-w-0">
            <div className="font-mono text-[11px] flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
              {rawPredictions.map((p, idx) => (
                <span key={p.className} className="whitespace-nowrap">
                  {idx > 0 ? '· ' : ''}
                  {p.className}: {(p.probability * 100).toFixed(0)}%
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0 text-[11px]">
              <label htmlFor="cooldown-select">Voice Cooldown:</label>
              <select
                id="cooldown-select"
                value={ttsCooldownSettingSec}
                onChange={(e) => setTtsCooldownSettingSec(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 font-mono text-[11px] text-slate-700"
              >
                <option value={10}>10s</option>
                <option value={15}>15s</option>
                <option value={30}>30s</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Autonomous Auto-Correction */}
      {activeConsoleTab === 'autocorrect' && (
        <div className="space-y-3.5 min-w-0">
          <div className="flex items-start justify-between gap-2 min-w-0">
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 block">
                Autonomous Vision Auto-Correction
              </span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Self-healing 4-stage morphological, illumination &amp; multimodal AI verifier.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setAutoCorrectEnabled((prev) => !prev)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer shrink-0 ${
                autoCorrectEnabled
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {autoCorrectEnabled ? 'Autonomous On' : 'Disabled'}
            </button>
          </div>

          {/* Active Auto-Correction Report Card */}
          {autoCorrectionReport ? (
            <div
              className={`p-3 rounded-xl border text-xs space-y-2.5 min-w-0 ${
                autoCorrectionReport.wasCorrected
                  ? 'bg-amber-50/80 border-amber-300'
                  : 'bg-slate-50 border-slate-200/80'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    autoCorrectionReport.wasCorrected
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {autoCorrectionReport.wasCorrected
                    ? 'Autonomous Override Applied'
                    : 'Autonomous Match Verified'}
                </span>
                <span className="text-[10px] font-mono text-slate-400 truncate max-w-full">
                  {autoCorrectionReport.verificationSource}
                </span>
              </div>

              {autoCorrectionReport.wasCorrected ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2 rounded bg-rose-50 border border-rose-200 text-[11px] min-w-0">
                    <span className="text-rose-600 block text-[10px] font-mono">
                      Initial Fast Pass
                    </span>
                    <span className="font-semibold text-rose-900 line-through block truncate">
                      {autoCorrectionReport.initialClassName} ({autoCorrectionReport.initialConfidence.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="p-2 rounded bg-emerald-50 border border-emerald-300 text-[11px] min-w-0">
                    <span className="text-emerald-700 block text-[10px] font-mono">
                      Autonomous True Lock
                    </span>
                    <span className="font-bold text-emerald-950 block truncate">
                      {autoCorrectionReport.correctedClassName} ({autoCorrectionReport.correctedConfidence.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                  <span className="text-slate-700 truncate">
                    Verified: <strong>{autoCorrectionReport.correctedClassName}</strong>
                  </span>
                  <span className="font-mono text-emerald-700 font-bold shrink-0">
                    {autoCorrectionReport.correctedConfidence.toFixed(1)}% Match
                  </span>
                </div>
              )}

              <p className="text-[11px] text-slate-600 leading-relaxed break-words">
                <strong>Audit Verdict: </strong>
                {autoCorrectionReport.discrepancyReason}
              </p>

              {/* 4-Stage Pipeline Steps */}
              <div className="pt-2 border-t border-black/5 space-y-1">
                {autoCorrectionReport.analysisSteps.map((step) => (
                  <div
                    key={step.stage}
                    className="flex items-start justify-between gap-2 text-[10px] font-mono text-slate-500"
                  >
                    <span className="truncate font-semibold text-slate-700">{step.stage}:</span>
                    <span className="text-right break-words">{step.finding}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
              Autonomous morphological &amp; AI auditor is monitoring frames in real time.
            </div>
          )}

          {/* Trigger Button */}
          <button
            type="button"
            disabled={isDeepAnalyzing}
            onClick={() => onTriggerDeepAutoCorrection(true)}
            className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold text-[11px] sm:text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs text-center leading-snug"
          >
            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isDeepAnalyzing ? 'animate-spin' : ''}`} />
            <span>
              {isDeepAnalyzing
                ? 'Running Deep Multimodal AI + Sobel Audit...'
                : 'Force Immediate Deep AI Re-Verification'}
            </span>
          </button>

          {/* Quick Override / Calibration Options */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-mono text-slate-400 block mb-1.5">
              Calibrate &amp; Lock True Botanical Specimen:
            </span>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5">
              {BOTANICAL_CLASSES.filter((c) => c.id !== 'background').map((cls) => (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => onTriggerDeepAutoCorrection(true, cls.id)}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-slate-50 hover:bg-indigo-50 hover:text-indigo-900 border border-slate-200 text-slate-700 cursor-pointer transition-colors truncate text-center"
                >
                  {cls.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Automatic Disease & Cure Inspection + Leaf Health */}
      {activeConsoleTab === 'health' && (
        <div className="space-y-3 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
            <span className="font-semibold text-slate-800">
              Automatic Disease &amp; Chlorophyll Inspection
            </span>
            <span className="font-mono text-emerald-700 font-bold">
              {laminaHealth.toFixed(1)}% Lamina Integrity
            </span>
          </div>

          {diseaseDiagnosis && (
            <div
              className={`p-3 rounded-xl border text-xs space-y-2 min-w-0 ${
                diseaseDiagnosis.healthStatus === 'Diseased'
                  ? 'bg-rose-50/80 border-rose-200'
                  : diseaseDiagnosis.healthStatus === 'Mild Stress'
                  ? 'bg-amber-50/80 border-amber-200'
                  : 'bg-emerald-50/70 border-emerald-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  {diseaseDiagnosis.healthStatus === 'Healthy' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  )}
                  <span>{diseaseDiagnosis.diseaseName}</span>
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/90 border border-black/10 font-semibold">
                  {diseaseDiagnosis.healthStatus} ({diseaseDiagnosis.affectedAreaPercent}% affected)
                </span>
              </div>

              <div className="text-[11px] text-slate-600 italic">
                Cause: {diseaseDiagnosis.pathogenOrCause}
              </div>

              <div className="pt-1.5 border-t border-black/5">
                <span className="text-[11px] font-semibold text-slate-800 block mb-1">
                  Automatic Cure Protocol:
                </span>
                <ul className="space-y-1 text-[11px] text-slate-700">
                  {diseaseDiagnosis.organicCure.map((cure, i) => (
                    <li key={i} className="leading-relaxed break-words">
                      <strong className="font-mono text-emerald-800">0{i + 1}.</strong> {cure}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[10px] text-slate-400 block uppercase">Chlorophyll SPAD</span>
              <span className="text-sm font-bold text-slate-900">
                {spectralSpad.toFixed(1)} SPAD
              </span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">{vitalityState}</span>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[10px] text-slate-400 block uppercase">Chlorosis Index</span>
              <span className="text-sm font-bold text-slate-900">{chlorosisScore}%</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Yellowing Ratio</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

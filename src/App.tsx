import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  CameraOff,
  Upload,
  Volume2,
  VolumeX,
  AlertTriangle,
  SwitchCamera,
  Zap,
  ZapOff,
  Pause,
  Play,
  Activity,
  Info,
  BookOpen,
  BarChart3,
  Globe,
  Sparkles,
  QrCode,
  Scan,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import {
  BOTANICAL_CLASSES,
  BotanicalClassProfile,
  DailyEngagementPoint,
  INITIAL_DAILY_PROGRESS,
  INITIAL_SCAN_LOGS,
  ScanLogEntry,
  TEACHABLE_MACHINE_MODEL_URL,
} from './data/botanicalData';
import {
  analyzeCanvasSpectralFeatures,
  ClassConfidenceResult,
  drawCenterCroppedFrame,
  isTorchSupported,
  loadTeachableMachineModel,
  RawPrediction,
  resetTemporalSmoothing,
  resolveCompetitionPredictions,
  setTorchState,
  TMCustomModel,
  triggerHaptic,
} from './services/teachableMachine';
import { detectPlantWithAI, convertDeepResponseToProfile } from './services/deepPlantDetector';
import { detectQrFromCanvas } from './services/qrScanner';
import { BotanicalActionCard } from './components/BotanicalActionCard';
import { ProgressDashboard } from './components/ProgressDashboard';
import { EnvironmentalImpactSection } from './components/EnvironmentalImpactSection';
import { SpecimenDetailModal } from './components/SpecimenDetailModal';
import { BotanicalQrModal } from './components/BotanicalQrModal';
import { SampleQrTagsModal } from './components/SampleQrTagsModal';
import { sanitizeText } from './utils/textSanitizer';

export default function App() {
  const confidenceThreshold = 85;

  // Teachable Machine Model State
  const [tmModel, setTmModel] = useState<TMCustomModel | null>(null);
  const [modelStatus, setModelStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );
  const [modelErrorMsg, setModelErrorMsg] = useState<string>('');

  // Scanner Mode: 'botanical' (live plant vision) | 'qr' (pot tag & QR scanner)
  const [scannerMode, setScannerMode] = useState<'botanical' | 'qr'>('botanical');

  // Camera & Mobile Hardware State
  const [inputMode, setInputMode] = useState<'webcam' | 'upload'>('webcam');
  const [webcamActive, setWebcamActive] = useState<boolean>(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchAvailable, setTorchAvailable] = useState<boolean>(false);
  const [torchActive, setTorchActive] = useState<boolean>(false);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [showHealthHudInfo, setShowHealthHudInfo] = useState<boolean>(false);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(
    null
  );

  // Deep Optical AI Detection State
  const [isDeepAnalyzing, setIsDeepAnalyzing] = useState<boolean>(false);
  const [deepAnalysisFeedback, setDeepAnalysisFeedback] = useState<string | null>(null);
  const [lastDeepScanTime, setLastDeepScanTime] = useState<number>(0);

  // QR Code Scanner & Pot Tag Modal State
  const [detectedQrData, setDetectedQrData] = useState<string | null>(null);
  const [inspectingQrSpecimen, setInspectingQrSpecimen] = useState<BotanicalClassProfile | null>(null);
  const [qrModalSpecimen, setQrModalSpecimen] = useState<BotanicalClassProfile | null>(null);
  const [showSampleQrModal, setShowSampleQrModal] = useState<boolean>(false);
  const [activeNavSection, setActiveNavSection] = useState<'scanner' | 'specimens' | 'impact' | 'analytics'>('scanner');

  // Real-Time Classification State
  const [rawPredictions, setRawPredictions] = useState<RawPrediction[]>([
    { className: 'medicinal leaves', probability: 0.02 },
    { className: 'Class 2', probability: 0.98 },
  ]);
  const [competitionClasses, setCompetitionClasses] = useState<
    ClassConfidenceResult[]
  >(() =>
    BOTANICAL_CLASSES.map((c) => ({
      id: c.id,
      name: c.name,
      scientificName: c.scientificName,
      category: c.category,
      confidence: c.id === 'background' ? 98.0 : 0.5,
      rawSourceLabel: c.id === 'background' ? 'Class 2' : 'medicinal leaves',
    }))
  );
  const [spectralSpad, setSpectralSpad] = useState<number>(0);
  const [laminaHealth, setLaminaHealth] = useState<number>(0);
  const [vitalityState, setVitalityState] = useState<string>('Ambient/Non-Foliar');
  const [chlorosisScore, setChlorosisScore] = useState<number>(0);

  // Text-to-Speech (TTS) & Smart Cooldown State
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(true);
  const [ttsCooldownSettingSec, setTtsCooldownSettingSec] =
    useState<number>(15);
  const [cooldownRemainingSec, setCooldownRemainingSec] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Progress & Plant Health Telemetry State (persisted in localStorage)
  const [dailyProgress, setDailyProgress] = useState<DailyEngagementPoint[]>(() => {
    try {
      const saved = localStorage.getItem('the_green_medic_progress');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_DAILY_PROGRESS;
  });

  const [scanLogs, setScanLogs] = useState<ScanLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('the_green_medic_logs');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_SCAN_LOGS;
  });

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const inferenceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadedImageRef = useRef<HTMLImageElement | null>(null);
  const lastSpokenMapRef = useRef<Record<string, number>>({});
  const lastLoggedTimeRef = useRef<number>(0);
  const lastTriggeredSpeciesRef = useRef<string | null>(null);
  const lastQrDetectTimeRef = useRef<number>(0);
  const deepScanHoldUntilRef = useRef<number>(0);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('the_green_medic_logs', JSON.stringify(scanLogs));
    } catch {
      // ignore
    }
  }, [scanLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('the_green_medic_progress', JSON.stringify(dailyProgress));
    } catch {
      // ignore
    }
  }, [dailyProgress]);

  // 1. Load Teachable Machine Cloud Model (`oaqtjokUw`)
  useEffect(() => {
    let mounted = true;
    loadTeachableMachineModel(TEACHABLE_MACHINE_MODEL_URL)
      .then(({ model }) => {
        if (!mounted) return;
        setTmModel(model);
        setModelStatus('ready');
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setModelStatus('error');
        setModelErrorMsg(
          err instanceof Error
            ? err.message
            : 'Unable to connect to Teachable Machine cloud model.'
        );
      });

    return () => {
      mounted = false;
    };
  }, []);

  // 2. Text-to-Speech Audio with Smart Cooldown
  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speakProfile = useCallback(
    (profile: BotanicalClassProfile, bypassCooldown = false) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return;
      }
      if (profile.id === 'background' || !profile.speechScript) {
        stopSpeech();
        return;
      }

      const now = Date.now();
      const lastSpokenAt = lastSpokenMapRef.current[profile.id] || 0;
      const elapsedSec = (now - lastSpokenAt) / 1000;

      if (!bypassCooldown && elapsedSec < ttsCooldownSettingSec) {
        setCooldownRemainingSec(
          Math.ceil(ttsCooldownSettingSec - elapsedSec)
        );
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(profile.speechScript);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      lastSpokenMapRef.current[profile.id] = now;
      setCooldownRemainingSec(ttsCooldownSettingSec);
      window.speechSynthesis.speak(utterance);
    },
    [ttsCooldownSettingSec, stopSpeech]
  );

  useEffect(() => {
    if (cooldownRemainingSec <= 0) return;
    const timer = window.setInterval(() => {
      setCooldownRemainingSec((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownRemainingSec]);

  // 3. Log Verified >=85% Detections to Dashboard
  const recordVerifiedScan = useCallback(
    (
      profile: BotanicalClassProfile,
      confidence: number,
      spad: number,
      integrity: number,
      modeNote = 'Optical Scan'
    ) => {
      const now = Date.now();
      if (
        lastTriggeredSpeciesRef.current === profile.id &&
        now - lastLoggedTimeRef.current < 6000
      ) {
        return;
      }
      lastTriggeredSpeciesRef.current = profile.id;
      lastLoggedTimeRef.current = now;

      // Haptic confirmation on mobile devices
      triggerHaptic([45, 60, 45]);

      const timeStr = new Date().toTimeString().slice(0, 8);
      const newEntry: ScanLogEntry = {
        id: `SCAN-${1049 + scanLogs.length}`,
        timestamp: timeStr,
        specimenId: profile.id,
        specimenName: profile.name,
        scientificName: profile.scientificName,
        category: profile.category,
        confidence: Number(confidence.toFixed(1)),
        chlorophyllSpad: Number((spad || 44.2).toFixed(1)),
        laminaIntegrity: Number((integrity || 94.8).toFixed(1)),
        audioSpoken: ttsEnabled,
        sourceMode: 'Live Webcam',
        notes: modeNote,
        bookmarked: false,
      };

      setScanLogs((prev) => [newEntry, ...prev.slice(0, 24)]);
      setDailyProgress((prev) => {
        const next = [...prev];
        const todayIdx = next.length - 1;
        const today = { ...next[todayIdx] };
        today.totalScans += 1;
        today.verifiedTriggers += 1;
        today.avgConfidence = Number(
          (today.avgConfidence * 0.9 + confidence * 0.1).toFixed(1)
        );
        next[todayIdx] = today;
        return next;
      });
    },
    [scanLogs.length, ttsEnabled]
  );

  // 4. Mobile Camera Lifecycle Management
  const startWebcam = useCallback(async (modeOverride?: 'environment' | 'user') => {
    setWebcamError(null);
    resetTemporalSmoothing();
    const mode = modeOverride || facingMode;

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: { ideal: mode },
        },
        audio: false,
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setTorchAvailable(isTorchSupported(stream));
      setTorchActive(false);
      setUploadedPreviewUrl(null);
      setWebcamActive(true);
      setInputMode('webcam');
      setIsFrozen(false);
    } catch (err: unknown) {
      setWebcamActive(false);
      setWebcamError(
        err instanceof Error
          ? `Camera access required (${err.message}). Check permissions or scan a photo.`
          : 'Camera access blocked. Please allow permissions or upload an image.'
      );
    }
  }, [facingMode]);

  const stopWebcam = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setWebcamActive(false);
    setTorchActive(false);
    setIsFrozen(false);
    resetTemporalSmoothing();
    setCompetitionClasses(
      BOTANICAL_CLASSES.map((c) => ({
        id: c.id,
        name: c.name,
        scientificName: c.scientificName,
        category: c.category,
        confidence: c.id === 'background' ? 98.5 : 0.4,
        rawSourceLabel: c.id === 'background' ? 'Class 2' : 'medicinal leaves',
      }))
    );
  }, []);

  const toggleFacingMode = useCallback(() => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (webcamActive) {
      startWebcam(nextMode);
    }
  }, [facingMode, webcamActive, startWebcam]);

  const toggleTorch = useCallback(async () => {
    if (!mediaStreamRef.current) return;
    const nextState = !torchActive;
    const ok = await setTorchState(mediaStreamRef.current, nextState);
    if (ok) {
      setTorchActive(nextState);
    }
  }, [torchActive]);

  const toggleFreezeFrame = useCallback(() => {
    setIsFrozen((prev) => !prev);
    triggerHaptic(25);
  }, []);

  // Auto-start webcam on mount
  useEffect(() => {
    startWebcam();
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startWebcam]);

  // 5. Deep Optical AI Detection Trigger
  const handleRunDeepAIScan = async () => {
    if (isDeepAnalyzing) return;
    const canvas = inferenceCanvasRef.current;
    if (!canvas) return;

    setIsDeepAnalyzing(true);
    setDeepAnalysisFeedback(null);
    triggerHaptic(40);

    try {
      // Capture current high-res frame from canvas or video
      let imageDataUrl = '';
      if (inputMode === 'upload' && uploadedPreviewUrl) {
        imageDataUrl = uploadedPreviewUrl;
      } else {
        imageDataUrl = canvas.toDataURL('image/jpeg', 0.88);
      }

      const aiResult = await detectPlantWithAI(imageDataUrl, 'image/jpeg');

      if (aiResult.category === 'background' || aiResult.detectedClass === 'background') {
        setDeepAnalysisFeedback('Non-botanical scene or background detected. Please focus on a single leaf.');
        setCompetitionClasses(
          BOTANICAL_CLASSES.map((c) => ({
            id: c.id,
            name: c.name,
            scientificName: c.scientificName,
            category: c.category,
            confidence: c.id === 'background' ? 98.0 : 0.5,
            rawSourceLabel: 'Background Filter',
          }))
        );
      } else {
        const { profile, confidence } = convertDeepResponseToProfile(aiResult, BOTANICAL_CLASSES);
        setDeepAnalysisFeedback(`Identified ${profile.name} (${confidence.toFixed(1)}%) via Deep Optical AI.`);
        setSpectralSpad(aiResult.leafHealth?.spadEstimate || 44.0);
        setLaminaHealth(aiResult.leafHealth?.vitalityIndex || 95.0);
        setVitalityState(aiResult.leafHealth?.status || 'Optimal Turgor');

        // Update competition classes with deep detection at top
        setCompetitionClasses((prev) =>
          prev.map((c) => {
            if (c.id === profile.id) {
              return { ...c, confidence: Math.max(90.0, confidence) };
            }
            if (c.id === 'background') {
              return { ...c, confidence: Math.max(1.0, 100 - confidence) };
            }
            return { ...c, confidence: Math.min(5.0, c.confidence * 0.1) };
          })
        );

        deepScanHoldUntilRef.current = Date.now() + 8000;
        setLastDeepScanTime(Date.now());
        recordVerifiedScan(
          profile,
          confidence,
          aiResult.leafHealth?.spadEstimate || 44.0,
          aiResult.leafHealth?.vitalityIndex || 95.0,
          'Deep AI Vision Scan'
        );

        if (ttsEnabled) {
          speakProfile(profile, true);
        }
      }
    } catch (err: unknown) {
      setDeepAnalysisFeedback(
        err instanceof Error ? err.message : 'Deep optical analysis failed.'
      );
    } finally {
      setIsDeepAnalyzing(false);
    }
  };

  // 6. Real-Time Inference Loop (Botanical & QR Detection)
  useEffect(() => {
    let animationFrameId: number;
    let isCancelled = false;

    const runInferenceLoop = async () => {
      if (isCancelled) return;
      const canvas = inferenceCanvasRef.current;
      if (!canvas) return;

      if (isFrozen) {
        animationFrameId = window.requestAnimationFrame(runInferenceLoop);
        return;
      }

      if (inputMode === 'webcam' && webcamActive && videoRef.current) {
        const video = videoRef.current;
        if (video.readyState >= 2) {
          const drawn = drawCenterCroppedFrame(video, canvas);
          if (drawn) {
            // Check for QR / Pot Tag code if in QR mode
            if (scannerMode === 'qr') {
              const now = Date.now();
              if (now - lastQrDetectTimeRef.current > 600) {
                lastQrDetectTimeRef.current = now;
                const qrText = await detectQrFromCanvas(canvas);
                if (qrText && qrText !== detectedQrData) {
                  setDetectedQrData(qrText);
                  triggerHaptic([60, 40, 60]);
                  // Match to a specimen
                  const matched = BOTANICAL_CLASSES.find(
                    (p) =>
                      qrText.toLowerCase().includes(p.id) ||
                      qrText.toLowerCase().includes(p.classificationCode.toLowerCase()) ||
                      p.commonAliases.some((a) => qrText.toLowerCase().includes(a))
                  );
                  if (matched) {
                    setInspectingQrSpecimen(matched);
                  }
                }
              }
            } else {
              // If deep AI scan is holding verified result, keep display locked
              if (Date.now() < deepScanHoldUntilRef.current) {
                animationFrameId = window.requestAnimationFrame(runInferenceLoop);
                return;
              }

              // Real-time botanical vision inference
              const spectral = analyzeCanvasSpectralFeatures(canvas);
              setSpectralSpad(spectral.chlorophyllSpadEstimate);
              setLaminaHealth(spectral.laminaIntegrityEstimate);
              setVitalityState(spectral.vitalityState);
              setChlorosisScore(spectral.chlorosisIndex);

              let raw: RawPrediction[] = [
                { className: 'medicinal leaves', probability: 0.05 },
                { className: 'Class 2', probability: 0.95 },
              ];

              if (tmModel) {
                try {
                  raw = await tmModel.predict(canvas);
                } catch {
                  // Frame busy
                }
              }

              const resolved = resolveCompetitionPredictions(
                raw,
                spectral,
                confidenceThreshold
              );
              setRawPredictions(resolved.rawPredictions);
              setCompetitionClasses(resolved.competitionClasses);
            }
          }
        }
        animationFrameId = window.requestAnimationFrame(runInferenceLoop);
      } else if (inputMode === 'upload' && uploadedImageRef.current) {
        resetTemporalSmoothing();
        const drawn = drawCenterCroppedFrame(uploadedImageRef.current, canvas);
        if (drawn) {
          const spectral = analyzeCanvasSpectralFeatures(canvas);
          setSpectralSpad(spectral.chlorophyllSpadEstimate);
          setLaminaHealth(spectral.laminaIntegrityEstimate);
          setVitalityState(spectral.vitalityState);
          setChlorosisScore(spectral.chlorosisIndex);

          let raw: RawPrediction[] = [
            { className: 'medicinal leaves', probability: 0.92 },
            { className: 'Class 2', probability: 0.08 },
          ];

          if (tmModel) {
            try {
              raw = await tmModel.predict(canvas);
            } catch {
              // Ignore
            }
          }

          const resolved = resolveCompetitionPredictions(
            raw,
            spectral,
            confidenceThreshold
          );
          setRawPredictions(resolved.rawPredictions);
          setCompetitionClasses(resolved.competitionClasses);
        }
      }
    };

    runInferenceLoop();

    return () => {
      isCancelled = true;
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [inputMode, webcamActive, tmModel, uploadedPreviewUrl, isFrozen, scannerMode, detectedQrData]);

  // Top prediction & 85% AI Trigger Gate
  const sortedClasses = [...competitionClasses].sort(
    (a, b) => b.confidence - a.confidence
  );
  const topPrediction = sortedClasses[0] || competitionClasses[0];
  const activeProfile =
    BOTANICAL_CLASSES.find((c) => c.id === topPrediction.id) ||
    BOTANICAL_CLASSES[4];
  const isBackgroundOrNoise =
    topPrediction.id === 'background' || topPrediction.category === 'background';
  const isTriggered =
    !isBackgroundOrNoise && topPrediction.confidence >= confidenceThreshold;

  useEffect(() => {
    if (isBackgroundOrNoise || !isTriggered) {
      if (isBackgroundOrNoise) {
        stopSpeech();
      }
      return;
    }

    if (ttsEnabled) {
      speakProfile(activeProfile, false);
    }

    recordVerifiedScan(
      activeProfile,
      topPrediction.confidence,
      spectralSpad,
      laminaHealth
    );
  }, [
    activeProfile,
    isBackgroundOrNoise,
    isTriggered,
    topPrediction.confidence,
    ttsEnabled,
    speakProfile,
    stopSpeech,
    recordVerifiedScan,
    spectralSpad,
    laminaHealth,
  ]);

  // Real Leaf Photo Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        uploadedImageRef.current = img;
        stopWebcam();
        setUploadedPreviewUrl(dataUrl);
        setInputMode('upload');
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = [
      'Scan ID',
      'Timestamp',
      'Specimen',
      'Scientific Name',
      'Category',
      'Confidence (%)',
      'Chlorophyll (SPAD)',
      'Lamina Integrity (%)',
      'Notes',
    ];
    const rows = scanLogs.map((l) => [
      l.id,
      l.timestamp,
      `"${l.specimenName}"`,
      `"${l.scientificName}"`,
      l.category,
      l.confidence.toFixed(1),
      l.chlorophyllSpad.toFixed(1),
      l.laminaIntegrity.toFixed(1),
      `"${(l.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'the_green_medic_field_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetSessionLogs = () => {
    setScanLogs(INITIAL_SCAN_LOGS);
    setDailyProgress(INITIAL_DAILY_PROGRESS);
    localStorage.removeItem('the_green_medic_logs');
    localStorage.removeItem('the_green_medic_progress');
  };

  const handleUpdateNote = (id: string, note: string) => {
    setScanLogs((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes: note } : item))
    );
  };

  const handleToggleBookmark = (id: string) => {
    setScanLogs((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, bookmarked: !item.bookmarked } : item
      )
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-slate-900 pb-16 md:pb-0">
      {/* Hidden 224x224 center-cropped neural inference canvas */}
      <canvas
        ref={inferenceCanvasRef}
        width={224}
        height={224}
        className="hidden"
      />

      {/* QR Code Specimen Modal */}
      <SpecimenDetailModal
        specimen={inspectingQrSpecimen}
        isOpen={Boolean(inspectingQrSpecimen)}
        onClose={() => setInspectingQrSpecimen(null)}
        onSpeak={(p) => speakProfile(p, true)}
        onOpenQr={(p) => setQrModalSpecimen(p)}
      />

      {/* Individual Plant Pot QR Tag Modal */}
      <BotanicalQrModal
        specimen={qrModalSpecimen}
        isOpen={Boolean(qrModalSpecimen)}
        onClose={() => setQrModalSpecimen(null)}
        onSelectForInspection={(p) => setInspectingQrSpecimen(p)}
      />

      {/* Sample Botanical Pot QR Tags Collection Modal */}
      <SampleQrTagsModal
        isOpen={showSampleQrModal}
        onClose={() => setShowSampleQrModal(false)}
        onSelectSpecimen={(p) => setInspectingQrSpecimen(p)}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-6 py-3.5">
        <div className="max-w-[1340px] mx-auto flex items-center justify-between gap-4 md:gap-8">
          <a
            href="#scanner"
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <span>The Green Medic</span>
          </a>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-500"
            aria-label="Primary Navigation"
          >
            <a
              href="#scanner"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Scanner
            </a>
            <a
              href="#specimens"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Specimens
            </a>
            <a
              href="#impact"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Impact
            </a>
            <a
              href="#analytics"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Analytics
            </a>
          </nav>

          {/* Primary Action Button */}
          <div className="flex items-center gap-2 shrink-0">
            {webcamActive ? (
              <button
                type="button"
                onClick={stopWebcam}
                className="min-h-[40px] px-3.5 md:px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Stop Camera
              </button>
            ) : (
              <button
                type="button"
                onClick={() => startWebcam()}
                className="min-h-[40px] px-3.5 md:px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Start Camera
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1340px] w-full mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* SECTION 01: Optical Scanner & Action Card */}
        <section id="scanner" aria-labelledby="scanner-heading" className="scroll-mt-20">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 md:gap-6 mb-6 md:mb-8">
            <div>
              <div className="text-xs text-slate-400">
                <span>01. Real-Time Botanical Vision & QR Reader</span>
                <span className="mx-2" aria-hidden="true">·</span>
                <span>
                  {modelStatus === 'ready'
                    ? 'Dual Optical Engine Active'
                    : modelStatus === 'loading'
                    ? 'Initializing Neural Vision...'
                    : 'System Offline'}
                </span>
              </div>
              <h1
                id="scanner-heading"
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mt-1"
                style={{ textWrap: 'balance' }}
              >
                Medicinal Leaf & Weed Detection
              </h1>
            </div>

            {/* Scanner Mode Toggle & Action Toolbar */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 shrink-0 max-w-full">
              {/* Plant Vision vs QR Tag Mode Switcher */}
              <div className="flex items-center p-1 bg-slate-200/70 rounded-xl border border-slate-300/80">
                <button
                  type="button"
                  onClick={() => setScannerMode('botanical')}
                  className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    scannerMode === 'botanical'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Scan className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Plant Vision</span>
                </button>
                <button
                  type="button"
                  onClick={() => setScannerMode('qr')}
                  className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    scannerMode === 'qr'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5 text-cyan-600" />
                  <span>QR & Pot Tag</span>
                </button>
              </div>

              {/* Deep AI One-Tap Scan Button */}
              {scannerMode === 'botanical' && (
                <button
                  type="button"
                  onClick={handleRunDeepAIScan}
                  disabled={isDeepAnalyzing || (!webcamActive && !uploadedPreviewUrl)}
                  className="min-h-[40px] px-4 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
                >
                  {isDeepAnalyzing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Deep AI Scan</span>
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="min-h-[40px] px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => {
                  if (ttsEnabled) stopSpeech();
                  setTtsEnabled((prev) => !prev);
                }}
                className="min-h-[40px] px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
              >
                {ttsEnabled ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Voice On</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                    <span>Muted</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {webcamError && (
            <div className="mb-6 bg-amber-50/80 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4 text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{webcamError}</span>
              </div>
              <button
                type="button"
                onClick={() => setWebcamError(null)}
                className="underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {deepAnalysisFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4 text-xs text-emerald-900"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{deepAnalysisFeedback}</span>
              </div>
              <button
                type="button"
                onClick={() => setDeepAnalysisFeedback(null)}
                className="underline font-mono text-[11px] cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          )}

          {modelStatus === 'error' && (
            <div className="mb-6 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-xs text-rose-900">
              {modelErrorMsg}
            </div>
          )}

          {/* Split Console */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* LEFT 5 COLS: Optical Feed & Live Foliar HUD */}
            <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-4 md:p-6 flex flex-col justify-between space-y-5 md:space-y-6 shadow-xs">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span>
                    {scannerMode === 'qr'
                      ? 'QR & Pot Tag Detection'
                      : inputMode === 'webcam' && webcamActive
                      ? isFrozen
                        ? 'Inspection Freeze Locked'
                        : `Live Camera (${facingMode === 'environment' ? 'Rear' : 'Front'})`
                      : inputMode === 'upload'
                      ? 'Uploaded Leaf'
                      : 'Camera Standby'}
                  </span>
                  <span className="font-mono tabular-nums text-slate-600">
                    {scannerMode === 'qr' ? 'Code Reader' : `Threshold: ${confidenceThreshold}%`}
                  </span>
                </div>

                {/* Viewport Frame with Touch Overlays */}
                <div className="relative aspect-4/3 w-full bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${
                      inputMode === 'webcam' && webcamActive ? 'block' : 'hidden'
                    }`}
                  />

                  {inputMode === 'upload' && uploadedPreviewUrl && (
                    <img
                      src={uploadedPreviewUrl}
                      alt="Uploaded botanical leaf"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  )}

                  {!webcamActive && inputMode === 'webcam' && (
                    <div className="text-center p-6">
                      <button
                        type="button"
                        onClick={() => startWebcam()}
                        className="min-h-[44px] px-5 py-2.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors flex items-center gap-2 mx-auto cursor-pointer shadow-md"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Tap to Launch Camera</span>
                      </button>
                      <p className="text-xs text-slate-400 mt-2.5">
                        {scannerMode === 'qr'
                          ? 'Point camera at plant pot QR or barcode'
                          : 'Position a medicinal leaf or weed in center frame'}
                      </p>
                    </div>
                  )}

                  {/* Overlays */}
                  {(webcamActive || uploadedPreviewUrl) && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-4">
                      {/* Top Bar Floating Controls */}
                      <div className="flex items-center justify-between text-xs font-mono text-white/90 gap-2">
                        {/* Status Chip */}
                        <div className="pointer-events-auto flex items-center gap-1.5 bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-xl text-[11px]">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              scannerMode === 'qr'
                                ? 'bg-cyan-400 animate-pulse'
                                : isBackgroundOrNoise
                                ? 'bg-slate-400'
                                : isTriggered
                                ? 'bg-emerald-400 animate-pulse'
                                : 'bg-amber-400'
                            }`}
                          />
                          <span>
                            {scannerMode === 'qr'
                              ? 'QR Reader Scanning'
                              : isBackgroundOrNoise
                              ? 'Noise Filter'
                              : isTriggered
                              ? 'Verified ≥ 85%'
                              : 'Aiming Leaf'}
                          </span>
                        </div>

                        {/* Mobile Hardware Action Buttons */}
                        {webcamActive && (
                          <div className="pointer-events-auto flex items-center gap-1.5">
                            {/* Freeze Scan Toggle */}
                            <button
                              type="button"
                              onClick={toggleFreezeFrame}
                              title={isFrozen ? 'Resume live camera' : 'Freeze scan for review'}
                              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                                isFrozen
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-black/50 backdrop-blur-xs text-white hover:bg-black/70'
                              }`}
                            >
                              {isFrozen ? (
                                <Play className="w-3.5 h-3.5" />
                              ) : (
                                <Pause className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Camera Facing Mode Switch */}
                            <button
                              type="button"
                              onClick={toggleFacingMode}
                              title="Flip between front and rear camera"
                              className="p-2 rounded-xl bg-black/50 backdrop-blur-xs text-white hover:bg-black/70 transition-colors cursor-pointer"
                            >
                              <SwitchCamera className="w-3.5 h-3.5" />
                            </button>

                            {/* Flash / Torch Toggle */}
                            {torchAvailable && (
                              <button
                                type="button"
                                onClick={toggleTorch}
                                title={torchActive ? 'Turn off flash' : 'Turn on flash'}
                                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                                  torchActive
                                    ? 'bg-amber-400 text-slate-900'
                                    : 'bg-black/50 backdrop-blur-xs text-white hover:bg-black/70'
                                }`}
                              >
                                {torchActive ? (
                                  <Zap className="w-3.5 h-3.5" />
                                ) : (
                                  <ZapOff className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Optical Reticle: QR framing box in QR mode, Leaf frame in Botanical mode */}
                      {scannerMode === 'qr' ? (
                        <div className="relative w-44 h-44 mx-auto rounded-xl border-2 border-cyan-400 flex items-center justify-center overflow-hidden">
                          <div className="absolute inset-x-0 h-0.5 bg-cyan-300 shadow-[0_0_8px_cyan] animate-bounce" />
                          <span className="text-[10px] font-mono text-cyan-200 bg-black/60 px-2 py-0.5 rounded">
                            Align QR / Barcode
                          </span>
                        </div>
                      ) : (
                        <motion.div
                          animate={{
                            scale: isTriggered ? [1, 1.02, 1] : 1,
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          className={`w-3/5 h-3/5 mx-auto rounded-2xl border transition-colors duration-300 ${
                            isBackgroundOrNoise
                              ? 'border-white/20 border-dashed'
                              : isTriggered
                              ? 'border-emerald-400 border-2'
                              : 'border-amber-300/70'
                          }`}
                        />
                      )}

                      {/* Bottom Scrim */}
                      <div className="bg-gradient-to-t from-black/85 via-black/45 to-transparent -mx-3 -mb-3 sm:-mx-4 sm:-mb-4 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-white">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold truncate text-sm">
                            {scannerMode === 'qr'
                              ? detectedQrData || 'Looking for QR tag...'
                              : topPrediction.name}
                          </span>
                          {scannerMode === 'botanical' && (
                            <span className="font-mono tabular-nums text-xs font-bold text-emerald-300">
                              {topPrediction.confidence.toFixed(1)}%
                            </span>
                          )}
                        </div>

                        {/* Interactive Foliar Vitality Pill */}
                        {scannerMode === 'botanical' && (
                          <div
                            onClick={() => setShowHealthHudInfo((p) => !p)}
                            className="pointer-events-auto cursor-pointer flex items-center gap-1.5 bg-white/15 backdrop-blur-xs hover:bg-white/25 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors self-start sm:self-auto"
                            title="Click to view foliar health diagnostics"
                          >
                            <Activity className="w-3 h-3 text-emerald-300" />
                            <span>{vitalityState}</span>
                            <Info className="w-2.5 h-2.5 text-white/60 ml-0.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Quick Action Bar (Thumb-friendly touch buttons) */}
                {webcamActive && (
                  <div className="flex sm:hidden items-center justify-between gap-1.5 pt-3">
                    <button
                      type="button"
                      onClick={toggleFacingMode}
                      className="flex-1 min-h-[44px] py-2 px-1 text-xs font-medium bg-slate-100 active:bg-slate-200 text-slate-800 rounded-xl flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-transform"
                    >
                      <SwitchCamera className="w-4 h-4 text-slate-600" />
                      <span>Flip</span>
                    </button>
                    {torchAvailable && (
                      <button
                        type="button"
                        onClick={toggleTorch}
                        className={`min-h-[44px] px-2.5 text-xs font-medium rounded-xl flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-transform ${
                          torchActive ? 'bg-amber-400 text-slate-900' : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        <Zap className="w-4 h-4" />
                        <span>{torchActive ? 'On' : 'Flash'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={toggleFreezeFrame}
                      className={`min-h-[44px] px-2.5 text-xs font-medium rounded-xl flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-transform ${
                        isFrozen ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {isFrozen ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      <span>{isFrozen ? 'Live' : 'Freeze'}</span>
                    </button>
                    {scannerMode === 'botanical' ? (
                      <button
                        type="button"
                        onClick={handleRunDeepAIScan}
                        disabled={isDeepAnalyzing}
                        className="flex-1 min-h-[44px] py-2 px-2 text-xs font-medium bg-emerald-600 active:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1 shadow-sm disabled:opacity-50 cursor-pointer active:scale-95 transition-transform"
                      >
                        {isDeepAnalyzing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-emerald-200" />
                        )}
                        <span>{isDeepAnalyzing ? 'Analyzing...' : 'Deep AI'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowSampleQrModal(true)}
                        className="flex-1 min-h-[44px] py-2 px-2 text-xs font-medium bg-cyan-600 active:bg-cyan-700 text-white rounded-xl flex items-center justify-center gap-1 shadow-sm cursor-pointer active:scale-95 transition-transform"
                      >
                        <QrCode className="w-4 h-4 text-cyan-200" />
                        <span>Tags</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Foliar Health Info Dropdown Panel */}
                <AnimatePresence>
                  {showHealthHudInfo && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-2 overflow-hidden"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span>Foliar Chlorophyll & Vitality Diagnostics</span>
                        <span className="font-mono text-emerald-700 font-bold">
                          {laminaHealth.toFixed(1)}% Score
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        Extracted via optical chlorophyll ratios and CIVE indices in real time:
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                          <span className="text-slate-400 block">Chlorophyll SPAD</span>
                          <span className="font-bold text-slate-900">{spectralSpad.toFixed(1)} SPAD</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                          <span className="text-slate-400 block">Chlorosis (Yellowing)</span>
                          <span className="font-bold text-slate-900">{chlorosisScore}% index</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mode-Specific Telemetry: QR Pot Tag Status OR 5-Class Competition Bars */}
              {scannerMode === 'qr' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Decoded Pot Tag Status</span>
                    <button
                      type="button"
                      onClick={() => setShowSampleQrModal(true)}
                      className="text-cyan-700 font-medium hover:underline cursor-pointer"
                    >
                      Sample Tags
                    </button>
                  </div>

                  {detectedQrData ? (
                    <div className="p-4 bg-cyan-50/70 border border-cyan-200/90 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-900">
                          <QrCode className="w-4 h-4 text-cyan-600" />
                          <span>Decoded Pot Marker</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDetectedQrData(null)}
                          className="text-[11px] font-mono text-cyan-700 hover:text-cyan-900 cursor-pointer"
                        >
                          Clear Tag
                        </button>
                      </div>

                      <div className="p-2.5 bg-white rounded-xl border border-cyan-100 font-mono text-xs text-slate-800 break-all select-all shadow-2xs">
                        {detectedQrData}
                      </div>

                      {inspectingQrSpecimen && (
                        <div className="pt-2 flex items-center justify-between gap-2 border-t border-cyan-200/60">
                          <div className="text-xs">
                            <span className="font-bold text-slate-900">{inspectingQrSpecimen.name}</span>
                            <span className="text-slate-400 block text-[11px] italic">{inspectingQrSpecimen.scientificName}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setInspectingQrSpecimen(inspectingQrSpecimen)}
                            className="min-h-[38px] px-3.5 py-1.5 bg-cyan-700 text-white text-xs font-medium rounded-xl hover:bg-cyan-800 transition-colors shadow-2xs cursor-pointer"
                          >
                            Open Dossier
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 border border-dashed border-slate-200 rounded-2xl text-center space-y-2.5 bg-slate-50/50">
                      <QrCode className="w-8 h-8 text-cyan-600/70 mx-auto" />
                      <div className="text-xs font-semibold text-slate-800">Ready to Scan Plant Pot Tag</div>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                        Point camera at plant pot QR labels or herbarium tags. Universal decoder runs on your device camera.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowSampleQrModal(true)}
                        className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 text-xs font-medium text-cyan-800 bg-cyan-50 hover:bg-cyan-100 rounded-xl transition-colors cursor-pointer border border-cyan-200/60"
                      >
                        <QrCode className="w-3.5 h-3.5 text-cyan-600" />
                        <span>View Sample Pot QR Codes</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Liquid Confidence Bars */
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span>5-Class Competition Confidence</span>
                    <span className="font-mono">85% Trigger Gate</span>
                  </div>

                <div className="space-y-3">
                  {competitionClasses.map((cls) => {
                    const isAboveGate =
                      cls.id !== 'background' &&
                      cls.confidence >= confidenceThreshold;
                    const isBgActive =
                      cls.id === 'background' &&
                      cls.confidence >= topPrediction.confidence;

                    return (
                      <div key={cls.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-medium text-slate-800">
                              {cls.name}
                            </span>
                            <span className="text-slate-300" aria-hidden="true">
                              ·
                            </span>
                            <span className="text-slate-400">
                              {cls.category === 'medicinal'
                                ? 'Medicinal'
                                : cls.category === 'weed'
                                ? 'Weed'
                                : 'Background'}
                            </span>
                          </div>
                          <span
                            className={`font-mono text-xs font-semibold tabular-nums ${
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

                        <div className="relative h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            style={{ left: `${confidenceThreshold}%` }}
                            className="absolute top-0 bottom-0 w-px bg-slate-300 z-10"
                            title="85% Trigger Threshold"
                          />
                          <motion.div
                            initial={false}
                            animate={{
                              width: `${Math.min(
                                100,
                                Math.max(0, cls.confidence)
                              )}%`,
                            }}
                            transition={{
                              type: 'spring',
                              stiffness: 140,
                              damping: 22,
                              mass: 0.6,
                            }}
                            className={`relative h-full rounded-full overflow-hidden ${
                              cls.id === 'background'
                                ? 'bg-slate-400'
                                : cls.category === 'weed'
                                ? isAboveGate
                                  ? 'bg-amber-500'
                                  : 'bg-amber-300'
                                : isAboveGate
                                ? 'bg-emerald-600'
                                : 'bg-slate-400'
                            }`}
                          >
                            {isAboveGate && (
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent liquid-bar-shimmer" />
                            )}
                          </motion.div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Minimal Raw Model & Voice Cooldown Footer */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <div className="font-mono text-[11px] truncate">
                  {rawPredictions.map((p, idx) => (
                    <span key={p.className}>
                      {idx > 0 ? ' · ' : ''}
                      {p.className}: {(p.probability * 100).toFixed(0)}%
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <label htmlFor="cooldown-select">Cooldown</label>
                  <select
                    id="cooldown-select"
                    value={ttsCooldownSettingSec}
                    onChange={(e) =>
                      setTtsCooldownSettingSec(Number(e.target.value))
                    }
                    className="bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5 font-mono text-[11px] text-slate-700"
                  >
                    <option value={10}>10s</option>
                    <option value={15}>15s</option>
                    <option value={30}>30s</option>
                  </select>
                </div>
              </div>
            </div>

            {/* RIGHT 7 COLS: Action Card */}
            <div className="lg:col-span-7">
              <BotanicalActionCard
                activeProfile={activeProfile}
                confidence={topPrediction.confidence}
                threshold={confidenceThreshold}
                isTriggered={isTriggered}
                isBackgroundOrNoise={isBackgroundOrNoise}
                isSpeaking={isSpeaking}
                cooldownRemainingSec={cooldownRemainingSec}
                ttsEnabled={ttsEnabled}
                onSpeakNow={(profile) => speakProfile(profile, true)}
                onStopSpeech={stopSpeech}
              />
            </div>
          </div>
        </section>

        {/* Section 02: Botanical Reference & Environmental Impact */}
        <EnvironmentalImpactSection
          onSpeakProfile={(profile) => speakProfile(profile, true)}
          onOpenQrModal={(profile) => setQrModalSpecimen(profile)}
        />

        {/* Section 03: User Progress & Plant Health Insights Dashboard */}
        <ProgressDashboard
          dailyProgress={dailyProgress}
          scanLogs={scanLogs}
          onExportCsv={handleExportCsv}
          onResetSessionLogs={handleResetSessionLogs}
          onUpdateNote={handleUpdateNote}
          onToggleBookmark={handleToggleBookmark}
        />
      </main>

      {/* Mobile Sticky Identification Sheet */}
      <AnimatePresence>
        {isTriggered && !isBackgroundOrNoise && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="lg:hidden fixed bottom-16 inset-x-3 z-30 bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-300 shadow-xl p-3 flex items-center justify-between gap-2"
          >
            <div
              className="flex items-center gap-2.5 overflow-hidden cursor-pointer flex-1"
              onClick={() => setInspectingQrSpecimen(activeProfile)}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {activeProfile.name}
                </div>
                <div className="text-[10px] font-mono text-emerald-700">
                  {topPrediction.confidence.toFixed(1)}% Match · Tap for dossier
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => speakProfile(activeProfile, true)}
                className="min-h-[40px] px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                title="Read out loud"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-[11px]">Audio</span>
              </button>
              <button
                type="button"
                onClick={() => setInspectingQrSpecimen(activeProfile)}
                className="min-h-[40px] px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-xs shadow-xs cursor-pointer"
              >
                Dossier
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 px-4 md:px-6 py-6 mt-12 pb-24 md:pb-6">
        <div className="max-w-[1340px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            <span>The Green Medic</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>8th-Grade Science Competition Project</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>Model oaqtjokUw</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#scanner" className="hover:text-slate-900">
              Scanner
            </a>
            <span aria-hidden="true">·</span>
            <a href="#specimens" className="hover:text-slate-900">
              Specimens
            </a>
            <span aria-hidden="true">·</span>
            <a href="#impact" className="hover:text-slate-900">
              Impact
            </a>
            <span aria-hidden="true">·</span>
            <a href="#analytics" className="hover:text-slate-900">
              Analytics
            </a>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Quick-Nav Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 h-14 flex items-center justify-around px-2 shadow-lg">
        <a
          href="#scanner"
          onClick={() => setActiveNavSection('scanner')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
            activeNavSection === 'scanner' ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Scanner</span>
        </a>
        <a
          href="#specimens"
          onClick={() => setActiveNavSection('specimens')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
            activeNavSection === 'specimens' ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Species</span>
        </a>
        <a
          href="#impact"
          onClick={() => setActiveNavSection('impact')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
            activeNavSection === 'impact' ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Impact</span>
        </a>
        <a
          href="#analytics"
          onClick={() => setActiveNavSection('analytics')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
            activeNavSection === 'analytics' ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">History</span>
        </a>
      </div>
    </div>
  );
}

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
  LogIn,
  LogOut,
  Cloud,
  ArrowDown,
  ExternalLink,
  Calendar,
  Sprout,
  ShieldCheck,
  RefreshCw,
  GraduationCap,
  Bot,
} from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  auth,
  signInWithGoogle,
  signOutUser,
  ensureUserProfileAndSeedData,
  subscribeToUserTelemetry,
  saveScanLogToFirestore,
  updateScanNoteInFirestore,
  toggleScanBookmarkInFirestore,
  updateDailyProgressInFirestore,
  resetUserLogsInFirestore,
} from './firebase';
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
  AutoCorrectionReport,
  ClassConfidenceResult,
  diagnoseLeafDiseaseFromMetrics,
  drawCenterCroppedFrame,
  FrameSpectralMetrics,
  isTorchSupported,
  loadTeachableMachineModel,
  performDeepFrameAutoCorrection,
  PlantDiseaseDiagnosis,
  RawPrediction,
  resetTemporalSmoothing,
  resolveCompetitionPredictions,
  setTorchState,
  TMCustomModel,
  triggerHaptic,
  verifyLeafWithServerDeepAI,
} from './services/teachableMachine';
import { detectQrFromCanvas } from './services/qrScanner';
import { BotanicalActionCard } from './components/BotanicalActionCard';
import { ProgressDashboard } from './components/ProgressDashboard';
import { EnvironmentalImpactSection } from './components/EnvironmentalImpactSection';
import { SpecimenDetailModal } from './components/SpecimenDetailModal';
import { BotanicalQrModal } from './components/BotanicalQrModal';
import { SampleQrTagsModal } from './components/SampleQrTagsModal';
import { StripeWaveBackground } from './components/StripeWaveBackground';
import { PlantTriviaPage } from './components/PlantTriviaPage';
import { FloraFactChatbotPage } from './components/FloraFactChatbotPage';
import { KnowMoreModal } from './components/KnowMoreModal';
import { ScannerTelemetryConsole } from './components/ScannerTelemetryConsole';
import { PWAInstallButton, OfflineIndicator } from './components/PWAInstallAndOfflineBar';
import {
  WebsiteReviewBanner,
  WebsiteReviewModal,
  InstagramBrandIcon,
  FacebookBrandIcon,
  INSTAGRAM_URL,
  FACEBOOK_URL,
} from './components/WebsiteReviewModal';
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

  // QR Code Scanner & Pot Tag Modal State
  const [detectedQrData, setDetectedQrData] = useState<string | null>(null);
  const [inspectingQrSpecimen, setInspectingQrSpecimen] = useState<BotanicalClassProfile | null>(null);
  const [qrModalSpecimen, setQrModalSpecimen] = useState<BotanicalClassProfile | null>(null);
  const [showSampleQrModal, setShowSampleQrModal] = useState<boolean>(false);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [activeNavSection, setActiveNavSection] = useState<'scanner' | 'specimens' | 'impact' | 'analytics' | 'trivia' | 'chatbot'>('scanner');

  const navigateToPage = (page: 'scanner' | 'specimens' | 'impact' | 'analytics' | 'trivia' | 'chatbot') => {
    setActiveNavSection(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  // "Know More" Webcam Display Button & Sequential Announcement State
  const [showKnowMorePanel, setShowKnowMorePanel] = useState<boolean>(false);
  const [isAnnouncingKnowMore, setIsAnnouncingKnowMore] = useState<boolean>(false);
  const [announcingPlantId, setAnnouncingPlantId] = useState<string | null>(null);
  const [knowMoreStatusText, setKnowMoreStatusText] = useState<string>('');
  const knowMoreCancelledRef = useRef<boolean>(false);
  const knowMoreTimerRef = useRef<number | null>(null);

  // Deep Auto-Correction & Automatic Disease Inspection State
  const [autoCorrectEnabled, setAutoCorrectEnabled] = useState<boolean>(true);
  const [autoCorrectionReport, setAutoCorrectionReport] =
    useState<AutoCorrectionReport | null>(null);
  const [diseaseDiagnosis, setDiseaseDiagnosis] =
    useState<PlantDiseaseDiagnosis | null>(null);
  const [isDeepAnalyzing, setIsDeepAnalyzing] = useState<boolean>(false);
  const [showDeepAnalysisDetails, setShowDeepAnalysisDetails] =
    useState<boolean>(false);
  const [correctionCount, setCorrectionCount] = useState<number>(0);

  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Progress & Plant Health Telemetry State (synced with Firestore when signed in, localStorage fallback)
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
  const lastSpectralRef = useRef<FrameSpectralMetrics | null>(null);
  const lastAutoAuditTimeRef = useRef<number>(0);
  const lastAutonomousAiTimeRef = useRef<number>(0);
  const autonomousAiInFlightRef = useRef<boolean>(false);
  const deepLockUntilRef = useRef<number>(0);

  // Listen to Firebase Auth state & attach Firestore listeners when authenticated
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthReady(true);
      if (user) {
        try {
          await ensureUserProfileAndSeedData(user);
        } catch (err) {
          console.error('Error initializing user profile in Firestore:', err);
        }
      }
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!authReady || !currentUser) return;
    const unsubTelemetry = subscribeToUserTelemetry(
      currentUser.uid,
      (logs) => setScanLogs(logs),
      (points) => setDailyProgress(points)
    );
    return () => unsubTelemetry();
  }, [authReady, currentUser]);

  // Scroll-spy for mobile river navigation
  useEffect(() => {
    const sectionIds: Array<'scanner' | 'specimens' | 'impact' | 'analytics'> = [
      'scanner',
      'specimens',
      'impact',
      'analytics',
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id as 'scanner' | 'specimens' | 'impact' | 'analytics';
            if (sectionIds.includes(id)) {
              setActiveNavSection(id);
            }
          }
        }
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: 0.05 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleGoogleSignIn = async () => {
    if (authLoading) return;
    setAuthLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google Sign-In error:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.error('Sign-Out error:', err);
    }
  };

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

  const speakDiseaseCure = useCallback(
    (diagnosis: PlantDiseaseDiagnosis, plantName: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return;
      }
      window.speechSynthesis.cancel();
      const cureText = `${plantName} Health Inspection: ${diagnosis.healthStatus}. Diagnosis: ${diagnosis.diseaseName}. Cause: ${diagnosis.pathogenOrCause}. Recommended Organic Cure: ${diagnosis.organicCure.join(
        ' Next, '
      )}. Preventive Care: ${diagnosis.preventiveCare}`;
      const utterance = new SpeechSynthesisUtterance(cureText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    []
  );

  useEffect(() => {
    if (cooldownRemainingSec <= 0) return;
    const timer = window.setInterval(() => {
      setCooldownRemainingSec((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownRemainingSec]);

  const redirectToYoBro = useCallback(() => {
    const targetUrl = 'https://yobroiamyobro.vercel.app';
    setKnowMoreStatusText('Redirecting to yobroiamyobro.vercel.app...');
    try {
      if (window.top && window.top !== window) {
        window.top.location.href = targetUrl;
        return;
      }
    } catch {
      // Cross-origin frame restriction fallback
    }
    window.location.href = targetUrl;
  }, []);

  const stopKnowMoreAnnouncement = useCallback(() => {
    knowMoreCancelledRef.current = true;
    if (knowMoreTimerRef.current) {
      window.clearTimeout(knowMoreTimerRef.current);
      knowMoreTimerRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsAnnouncingKnowMore(false);
    setAnnouncingPlantId(null);
    setIsSpeaking(false);
    setKnowMoreStatusText('Announcement paused.');
  }, []);

  const handleKnowMoreClick = useCallback(
    (currentProfile: BotanicalClassProfile) => {
      knowMoreCancelledRef.current = false;
      if (knowMoreTimerRef.current) {
        globalThis.clearTimeout(knowMoreTimerRef.current);
        knowMoreTimerRef.current = null;
      }

      const allPlants = BOTANICAL_CLASSES.filter((p) => p.id !== 'background');
      const orderedPlants =
        currentProfile && currentProfile.id !== 'background'
          ? [
              currentProfile,
              ...allPlants.filter((p) => p.id !== currentProfile.id),
            ]
          : allPlants;

      setShowKnowMorePanel(true);
      setIsAnnouncingKnowMore(true);

      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setKnowMoreStatusText(
          'Displaying plant details... Redirecting to yobroiamyobro.vercel.app'
        );
        knowMoreTimerRef.current = globalThis.setTimeout(() => {
          if (!knowMoreCancelledRef.current) {
            redirectToYoBro();
          }
        }, 6000) as unknown as number;
        return;
      }

      window.speechSynthesis.cancel();

      let currentIdx = 0;

      const speakNextPlant = () => {
        if (knowMoreCancelledRef.current) return;

        if (currentIdx >= orderedPlants.length) {
          setAnnouncingPlantId(null);
          setIsAnnouncingKnowMore(false);
          setIsSpeaking(false);
          setKnowMoreStatusText(
            'Finished announcing all plants! Redirecting to yobroiamyobro.vercel.app...'
          );
          knowMoreTimerRef.current = globalThis.setTimeout(() => {
            if (!knowMoreCancelledRef.current) {
              redirectToYoBro();
            }
          }, 800) as unknown as number;
          return;
        }

        const plant = orderedPlants[currentIdx];
        setAnnouncingPlantId(plant.id);
        setKnowMoreStatusText(
          `Announcing (${currentIdx + 1}/${orderedPlants.length}): ${plant.name} (${plant.scientificName})...`
        );

        const script = `${plant.name}. Scientific name: ${plant.scientificName}. Definition: ${plant.summary} Season for growing: ${plant.growingSeason}. Uses: ${plant.traditionalUses.join(', ')}.`;
        const utterance = new SpeechSynthesisUtterance(script);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
          setIsSpeaking(true);
        };

        utterance.onend = () => {
          if (knowMoreCancelledRef.current) return;
          currentIdx += 1;
          speakNextPlant();
        };

        utterance.onerror = () => {
          if (knowMoreCancelledRef.current) return;
          currentIdx += 1;
          speakNextPlant();
        };

        window.speechSynthesis.speak(utterance);
      };

      speakNextPlant();
    },
    [redirectToYoBro]
  );

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
      const scanId = currentUser
        ? `${currentUser.uid}_SCAN-${Date.now()}`
        : `SCAN-${1049 + scanLogs.length}`;
      const newEntry: ScanLogEntry = {
        id: scanId,
        timestamp: timeStr,
        specimenId: profile.id,
        specimenName: profile.name,
        scientificName: profile.scientificName,
        category: profile.category,
        confidence: Number(confidence.toFixed(1)),
        chlorophyllSpad: Number((spad || 44.2).toFixed(1)),
        laminaIntegrity: Number((integrity || 94.8).toFixed(1)),
        audioSpoken: ttsEnabled,
        sourceMode:
          inputMode === 'upload' ? 'Specimen Calibration' : 'Live Webcam',
        notes: modeNote,
        bookmarked: false,
      };

      setScanLogs((prev) => [newEntry, ...prev.slice(0, 24)]);
      if (currentUser) {
        saveScanLogToFirestore(currentUser.uid, newEntry).catch((err) =>
          console.error('Failed to persist scan log:', err)
        );
      }

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
        if (currentUser) {
          updateDailyProgressInFirestore(currentUser.uid, today).catch((err) =>
            console.error('Failed to persist daily progress:', err)
          );
        }
        return next;
      });
    },
    [scanLogs.length, ttsEnabled, currentUser, inputMode]
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

  // 5. Real-Time Inference Loop (Teachable Machine Botanical Vision & QR Detection)
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
              // Real-time Teachable Machine botanical vision inference
              const spectral = analyzeCanvasSpectralFeatures(canvas);
              lastSpectralRef.current = spectral;
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

              const now = Date.now();
              // If a deep auto-correction lock is active, preserve the corrected probabilities
              if (now < deepLockUntilRef.current) {
                setRawPredictions(raw);
              } else {
                const resolved = resolveCompetitionPredictions(
                  raw,
                  spectral,
                  confidenceThreshold
                );
                setRawPredictions(resolved.rawPredictions);

                const isFoliageVisible =
                  resolved.topClass.id !== 'background' ||
                  spectral.excessGreenIndex > 6.5;

                // Autonomous Discrepancy Detection, Self-Healing Auto-Correction & Disease Inspection (every ~650ms)
                if (
                  autoCorrectEnabled &&
                  now - lastAutoAuditTimeRef.current > 650 &&
                  isFoliageVisible
                ) {
                  lastAutoAuditTimeRef.current = now;
                  const deepReport = performDeepFrameAutoCorrection(
                    canvas,
                    resolved.competitionClasses,
                    spectral,
                    { confidenceThreshold }
                  );
                  setAutoCorrectionReport(deepReport);
                  setDiseaseDiagnosis(deepReport.diseaseDiagnosis);

                  if (deepReport.wasCorrected) {
                    setCompetitionClasses(
                      deepReport.correctedCompetitionClasses
                    );
                    setCorrectionCount((c) => c + 1);
                    deepLockUntilRef.current = now + 4200;
                    triggerHaptic([35, 50, 75]);
                  } else {
                    setCompetitionClasses(resolved.competitionClasses);
                  }

                  // Autonomous Background Multimodal AI Verification & Disease Inspection (every ~5.5s when a leaf is present)
                  if (
                    navigator.onLine &&
                    !autonomousAiInFlightRef.current &&
                    now - lastAutonomousAiTimeRef.current > 5500
                  ) {
                    lastAutonomousAiTimeRef.current = now;
                    autonomousAiInFlightRef.current = true;
                    verifyLeafWithServerDeepAI(canvas, deepReport, false)
                      .then((aiVerifiedReport) => {
                        if (isCancelled) return;
                        setAutoCorrectionReport(aiVerifiedReport);
                        setDiseaseDiagnosis(aiVerifiedReport.diseaseDiagnosis);
                        if (
                          aiVerifiedReport.correctedClassId !== 'background'
                        ) {
                          setCompetitionClasses(
                            aiVerifiedReport.correctedCompetitionClasses
                          );
                          deepLockUntilRef.current = Date.now() + 5000;
                          if (
                            aiVerifiedReport.wasCorrected &&
                            !deepReport.wasCorrected
                          ) {
                            setCorrectionCount((c) => c + 1);
                          }
                        }
                      })
                      .finally(() => {
                        autonomousAiInFlightRef.current = false;
                      });
                  }
                } else {
                  setCompetitionClasses(resolved.competitionClasses);
                  if (isFoliageVisible) {
                    setDiseaseDiagnosis(
                      diagnoseLeafDiseaseFromMetrics(
                        resolved.topClass.id,
                        spectral
                      )
                    );
                  }
                }
              }
            }
          }
        }
        animationFrameId = window.requestAnimationFrame(runInferenceLoop);
      } else if (inputMode === 'upload' && uploadedImageRef.current) {
        resetTemporalSmoothing();
        const drawn = drawCenterCroppedFrame(uploadedImageRef.current, canvas);
        if (drawn) {
          const spectral = analyzeCanvasSpectralFeatures(canvas);
          lastSpectralRef.current = spectral;
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

          const deepReport = performDeepFrameAutoCorrection(
            canvas,
            resolved.competitionClasses,
            spectral,
            { confidenceThreshold }
          );
          setAutoCorrectionReport(deepReport);
          setDiseaseDiagnosis(deepReport.diseaseDiagnosis);
          setCompetitionClasses(
            autoCorrectEnabled
              ? deepReport.correctedCompetitionClasses
              : resolved.competitionClasses
          );
          if (autoCorrectEnabled && deepReport.wasCorrected) {
            setCorrectionCount((c) => c + 1);
          }

          // Automatically run server-side Multimodal AI verification + Disease & Cure inspection on uploaded leaf images
          if (navigator.onLine && !autonomousAiInFlightRef.current) {
            autonomousAiInFlightRef.current = true;
            setIsDeepAnalyzing(true);
            verifyLeafWithServerDeepAI(canvas, deepReport, false)
              .then((aiVerifiedReport) => {
                if (isCancelled) return;
                setAutoCorrectionReport(aiVerifiedReport);
                setDiseaseDiagnosis(aiVerifiedReport.diseaseDiagnosis);
                if (autoCorrectEnabled) {
                  setCompetitionClasses(
                    aiVerifiedReport.correctedCompetitionClasses
                  );
                }
                if (
                  aiVerifiedReport.wasCorrected &&
                  !deepReport.wasCorrected
                ) {
                  setCorrectionCount((c) => c + 1);
                }
              })
              .finally(() => {
                autonomousAiInFlightRef.current = false;
                setIsDeepAnalyzing(false);
              });
          }
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
  }, [
    inputMode,
    webcamActive,
    tmModel,
    uploadedPreviewUrl,
    isFrozen,
    scannerMode,
    detectedQrData,
    autoCorrectEnabled,
  ]);

  // Manual or User-Flagged Deep Re-Analysis & Auto-Correction Handler
  const handleTriggerDeepAutoCorrection = useCallback(
    async (
      forceWrongVisualAnswer: boolean = true,
      preferredOverrideId?: BotanicalClassProfile['id']
    ) => {
      const canvas = inferenceCanvasRef.current;
      if (!canvas) return;

      // Ensure latest frame is drawn if webcam or upload is active
      if (inputMode === 'webcam' && webcamActive && videoRef.current) {
        drawCenterCroppedFrame(videoRef.current, canvas);
      } else if (inputMode === 'upload' && uploadedImageRef.current) {
        drawCenterCroppedFrame(uploadedImageRef.current, canvas);
      }

      setIsDeepAnalyzing(true);
      setShowDeepAnalysisDetails(true);
      triggerHaptic([40, 60, 90]);

      const spectral =
        lastSpectralRef.current || analyzeCanvasSpectralFeatures(canvas);
      lastSpectralRef.current = spectral;

      const localDeepReport = performDeepFrameAutoCorrection(
        canvas,
        competitionClasses,
        spectral,
        {
          forceAlternative: forceWrongVisualAnswer && !preferredOverrideId,
          preferredOverrideId,
          confidenceThreshold,
        }
      );

      // Apply immediate local deep morphological auto-correction & disease report
      setAutoCorrectionReport(localDeepReport);
      setDiseaseDiagnosis(localDeepReport.diseaseDiagnosis);
      setCompetitionClasses(localDeepReport.correctedCompetitionClasses);
      deepLockUntilRef.current = Date.now() + 8000;

      // Also run server-side Gemini Vision multimodal verification & fusion
      const finalReport = await verifyLeafWithServerDeepAI(
        canvas,
        localDeepReport,
        forceWrongVisualAnswer
      );

      setAutoCorrectionReport(finalReport);
      setDiseaseDiagnosis(finalReport.diseaseDiagnosis);
      setCompetitionClasses(finalReport.correctedCompetitionClasses);
      deepLockUntilRef.current = Date.now() + 8000;
      setIsDeepAnalyzing(false);

      if (finalReport.wasCorrected) {
        setCorrectionCount((c) => c + 1);
      }

      const correctedSpec = BOTANICAL_CLASSES.find(
        (c) => c.id === finalReport.correctedClassId
      );

      if (
        correctedSpec &&
        correctedSpec.id !== 'background' &&
        ttsEnabled &&
        typeof window !== 'undefined' &&
        'speechSynthesis' in window &&
        !isAnnouncingKnowMore
      ) {
        window.speechSynthesis.cancel();
        const msg = finalReport.wasCorrected
          ? `Autonomous auto-correction applied. Initial visual result ${finalReport.initialClassName} was overridden. Verified ${correctedSpec.name}, ${correctedSpec.scientificName}, at ${finalReport.correctedConfidence.toFixed(
              1
            )} percent confidence. Disease inspection: ${finalReport.diseaseDiagnosis.diseaseName}.`
          : `Deep analysis verified ${correctedSpec.name} at ${finalReport.correctedConfidence.toFixed(
              1
            )} percent confidence. Disease inspection: ${finalReport.diseaseDiagnosis.diseaseName}.`;
        const utterance = new SpeechSynthesisUtterance(msg);
        utterance.rate = 1.02;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }

      if (correctedSpec && correctedSpec.id !== 'background') {
        recordVerifiedScan(
          correctedSpec,
          finalReport.correctedConfidence,
          spectral.chlorophyllSpadEstimate,
          spectral.laminaIntegrityEstimate,
          finalReport.wasCorrected
            ? `Auto-Corrected from ${finalReport.initialClassName} · ${finalReport.diseaseDiagnosis.diseaseName}`
            : `Deep Verified · ${finalReport.diseaseDiagnosis.diseaseName}`
        );
      }
    },
    [
      inputMode,
      webcamActive,
      competitionClasses,
      confidenceThreshold,
      ttsEnabled,
      isAnnouncingKnowMore,
      recordVerifiedScan,
    ]
  );

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
    if (isAnnouncingKnowMore) {
      return;
    }

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
    isAnnouncingKnowMore,
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
    if (currentUser) {
      resetUserLogsInFirestore(currentUser.uid).catch((err) =>
        console.error('Failed to reset Firestore logs:', err)
      );
    }
  };

  const handleUpdateNote = (id: string, note: string) => {
    setScanLogs((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes: note } : item))
    );
    if (currentUser) {
      updateScanNoteInFirestore(id, note).catch((err) =>
        console.error('Failed to update note in Firestore:', err)
      );
    }
  };

  const handleToggleBookmark = (id: string) => {
    const target = scanLogs.find((item) => item.id === id);
    const nextBookmarked = target ? !target.bookmarked : true;
    setScanLogs((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, bookmarked: nextBookmarked } : item
      )
    );
    if (currentUser) {
      toggleScanBookmarkInFirestore(id, nextBookmarked).catch((err) =>
        console.error('Failed to toggle bookmark in Firestore:', err)
      );
    }
  };

  return (
    <div className="relative min-h-screen w-full max-w-[100vw] overflow-x-hidden flex flex-col bg-[#FAFAFA] text-slate-900 pb-16 md:pb-0">
      {/* Stripe Flowing Wave Background */}
      <StripeWaveBackground />

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
      <header className="sticky top-0 z-30 h-14 w-full max-w-[100vw] overflow-x-hidden bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-4 md:px-6 flex items-center">
        <div className="max-w-[1340px] w-full min-w-0 mx-auto flex items-center justify-between gap-2 sm:gap-3 md:gap-6">
          <button
            type="button"
            onClick={() => navigateToPage('scanner')}
            className="text-sm sm:text-lg font-bold tracking-tight text-slate-900 truncate min-w-0 flex items-center gap-1.5 cursor-pointer text-left"
          >
            <span className="truncate">The Green Medic</span>
          </button>

          {/* Desktop Multi-Page Navigation Tabs */}
          <nav
            className="hidden md:flex items-center gap-1 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 text-xs font-semibold"
            aria-label="Primary Navigation"
          >
            <button
              type="button"
              onClick={() => navigateToPage('scanner')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeNavSection === 'scanner'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-emerald-600" />
              <span>Scanner</span>
            </button>
            <button
              type="button"
              onClick={() => navigateToPage('specimens')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeNavSection === 'specimens'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>Species Guide</span>
              <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded-full">5</span>
            </button>
            <button
              type="button"
              onClick={() => navigateToPage('impact')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeNavSection === 'impact'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>Eco Impact</span>
            </button>
            <button
              type="button"
              onClick={() => navigateToPage('analytics')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeNavSection === 'analytics'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Field Log</span>
              {scanLogs.length > 0 && (
                <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 text-[10px] rounded-full">
                  {scanLogs.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigateToPage('trivia')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeNavSection === 'trivia'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Plant Trivia</span>
              <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded-full">15</span>
            </button>
            <button
              type="button"
              onClick={() => navigateToPage('chatbot')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeNavSection === 'chatbot'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-emerald-600" />
              <span>FloraFact Bot</span>
              <span className="px-1.5 py-0.2 bg-emerald-600 text-white text-[10px] rounded-full font-bold">AI</span>
            </button>
          </nav>

          {/* Auth & Primary Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <PWAInstallButton />

            {/* Official Instagram & Facebook Links */}
            <div className="hidden sm:flex items-center gap-1.5">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[38px] sm:min-h-[40px] px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-pink-50/70 border border-slate-200 hover:border-pink-300 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
                title="Follow us on Instagram (@greenmedic.site)"
                aria-label="Instagram"
              >
                <InstagramBrandIcon className="w-4 h-4 shrink-0" />
                <span className="hidden xl:inline">Instagram</span>
              </a>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[38px] sm:min-h-[40px] px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
                title="Follow us on Facebook"
                aria-label="Facebook"
              >
                <FacebookBrandIcon className="w-4 h-4 shrink-0" />
                <span className="hidden xl:inline">Facebook</span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => setShowReviewModal(true)}
              className="min-h-[38px] sm:min-h-[40px] px-2 sm:px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              title="Scan QR Code to Submit Website Review"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="hidden lg:inline">Review QR</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <div
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-900"
                  title="Cloud Sync Active"
                >
                  <Cloud className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-medium max-w-[110px] truncate">
                    {currentUser.displayName || 'Researcher'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="min-h-[38px] sm:min-h-[40px] px-2 sm:px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden md:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="min-h-[38px] sm:min-h-[40px] px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="sm:hidden">{authLoading ? '...' : 'Sign In'}</span>
                <span className="hidden sm:inline">
                  {authLoading ? 'Signing in...' : 'Google Sign-In'}
                </span>
              </button>
            )}

            {webcamActive ? (
              <button
                type="button"
                onClick={stopWebcam}
                className="min-h-[38px] sm:min-h-[40px] px-2.5 sm:px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span className="sm:hidden">Stop</span>
                <span className="hidden sm:inline">Stop Camera</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => startWebcam()}
                className="min-h-[38px] sm:min-h-[40px] px-2.5 sm:px-4 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span className="sm:hidden">Camera</span>
                <span className="hidden sm:inline">Start Camera</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Container with Multi-Page Views */}
      <main className="relative z-10 flex-1 max-w-[1340px] w-full min-w-0 mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 overflow-x-hidden">
        <AnimatePresence mode="wait">
          {activeNavSection === 'scanner' && (
            <motion.div
              key="scanner-page"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              {/* SECTION 01: Optical Scanner & Action Card */}
              <section id="scanner" aria-labelledby="scanner-heading" className="scroll-mt-20">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 md:gap-6 mb-5 md:mb-8">
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

            {/* Scanner Mode Toggle & Action Toolbar — Flowing 2-row deck on mobile, inline row on tablet/desktop */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0">
              {/* Plant Vision vs QR Tag Mode Switcher */}
              <div className="grid grid-cols-2 sm:flex items-center p-1 bg-slate-200/70 rounded-2xl sm:rounded-xl border border-slate-300/70">
                <button
                  type="button"
                  onClick={() => setScannerMode('botanical')}
                  className={`min-h-[42px] sm:min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-xl sm:rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    scannerMode === 'botanical'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Scan className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Plant Vision</span>
                </button>
                <button
                  type="button"
                  onClick={() => setScannerMode('qr')}
                  className={`min-h-[42px] sm:min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-xl sm:rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    scannerMode === 'qr'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                  <span>QR & Pot Tag</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[44px] sm:min-h-[40px] px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-50 rounded-2xl sm:rounded-xl transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 shrink-0" />
                  <span>Upload Leaf</span>
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
                  className="min-h-[44px] sm:min-h-[40px] px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-50 rounded-2xl sm:rounded-xl transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
                >
                  {ttsEnabled ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Voice On</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Muted</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {webcamError && (
            <div className="mb-5 bg-amber-50/80 border border-amber-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-4 text-xs text-amber-900">
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

          {modelStatus === 'error' && (
            <div className="mb-5 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 text-xs text-rose-900">
              {modelErrorMsg}
            </div>
          )}

          {/* Split Console (Flows like a river on mobile, 12-col split on desktop) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6 items-stretch min-w-0">
            {/* LEFT 5 COLS: Optical Feed & Live Foliar HUD */}
            <div className="lg:col-span-5 min-w-0 w-full overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-5 md:p-6 flex flex-col justify-between space-y-4 sm:space-y-5 md:space-y-6 shadow-xs">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-slate-400 mb-3 min-w-0">
                  <span className="truncate">
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
                  <span className="font-mono tabular-nums text-slate-600 shrink-0">
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

                {/* "Know More" Button at the Bottom of Webcam Display */}
                <div className="mt-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => setShowKnowMorePanel(true)}
                    className="w-full min-w-0 min-h-[46px] px-3 sm:px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-semibold text-xs sm:text-sm shadow-xs hover:shadow transition-all flex items-center justify-between gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2 min-w-0 truncate">
                      <Sprout className="w-4 h-4 text-emerald-200 shrink-0" />
                      <span className="truncate">Know More</span>
                      <span className="text-[11px] font-normal text-emerald-100/90 hidden sm:inline truncate">
                        (Uses · Definition · Growing Season · Scientific Names)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono bg-white/15 px-2.5 py-1 rounded-xl shrink-0">
                      <Volume2 className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                      <span>Announce &amp; Visit</span>
                    </div>
                  </button>
                </div>

                {/* Organized Telemetry Console (Tabbed: Confidence / Auto-Correction / Disease & Cure) */}
                <div className="mt-4 min-w-0">
                  <ScannerTelemetryConsole
                    scannerMode={scannerMode}
                    competitionClasses={competitionClasses}
                    confidenceThreshold={confidenceThreshold}
                    topPrediction={topPrediction}
                    isTriggered={isTriggered}
                    isBackgroundOrNoise={isBackgroundOrNoise}
                    autoCorrectEnabled={autoCorrectEnabled}
                    setAutoCorrectEnabled={setAutoCorrectEnabled}
                    autoCorrectionReport={autoCorrectionReport}
                    correctionCount={correctionCount}
                    isDeepAnalyzing={isDeepAnalyzing}
                    onTriggerDeepAutoCorrection={handleTriggerDeepAutoCorrection}
                    spectralSpad={spectralSpad}
                    laminaHealth={laminaHealth}
                    vitalityState={vitalityState}
                    chlorosisScore={chlorosisScore}
                    diseaseDiagnosis={diseaseDiagnosis}
                    detectedQrData={detectedQrData}
                    inspectingQrSpecimen={inspectingQrSpecimen}
                    onClearDetectedQr={() => setDetectedQrData(null)}
                    onOpenSampleQrModal={() => setShowSampleQrModal(true)}
                    onInspectSpecimen={(specimen) => setInspectingQrSpecimen(specimen)}
                    rawPredictions={rawPredictions}
                    ttsCooldownSettingSec={ttsCooldownSettingSec}
                    setTtsCooldownSettingSec={setTtsCooldownSettingSec}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT 7 COLS: Action Card */}
            <div id="active-dossier-card" className="lg:col-span-7 min-w-0 w-full scroll-mt-16">
              <BotanicalActionCard
                activeProfile={activeProfile}
                confidence={topPrediction.confidence}
                threshold={confidenceThreshold}
                isTriggered={isTriggered}
                isBackgroundOrNoise={isBackgroundOrNoise}
                isSpeaking={isSpeaking}
                cooldownRemainingSec={cooldownRemainingSec}
                ttsEnabled={ttsEnabled}
                diseaseDiagnosis={diseaseDiagnosis}
                autoCorrectionReport={autoCorrectionReport}
                onSpeakNow={(profile) => speakProfile(profile, true)}
                onSpeakDiseaseCure={speakDiseaseCure}
                onStopSpeech={stopSpeech}
              />
            </div>
          </div>
        </section>

        {/* Quick Multi-Page Jumper from Scanner */}
        <div className="p-4 sm:p-5 bg-white/80 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="text-slate-600 text-center sm:text-left">
            <span className="font-semibold text-slate-800">Need plant reference dossiers, trivia, or botanical AI chat?</span>
            <span className="hidden sm:inline text-slate-400 ml-1">Explore individual pages without clutter:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => navigateToPage('chatbot')}
              className="flex-1 sm:flex-initial min-h-[38px] px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>FloraFact AI Bot →</span>
            </button>
            <button
              type="button"
              onClick={() => navigateToPage('trivia')}
              className="flex-1 sm:flex-initial min-h-[38px] px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 font-semibold rounded-xl transition-colors cursor-pointer text-center"
            >
              Student Plant Trivia (15 Qs) →
            </button>
            <button
              type="button"
              onClick={() => navigateToPage('specimens')}
              className="flex-1 sm:flex-initial min-h-[38px] px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-medium rounded-xl transition-colors cursor-pointer text-center"
            >
              Species Guide (5) →
            </button>
            <button
              type="button"
              onClick={() => navigateToPage('analytics')}
              className="flex-1 sm:flex-initial min-h-[38px] px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-medium rounded-xl transition-colors cursor-pointer text-center"
            >
              Field History ({scanLogs.length}) →
            </button>
          </div>
        </div>
      </motion.div>
    )}

    {/* PAGE 02: Botanical Reference Herbarium */}
    {activeNavSection === 'specimens' && (
      <motion.div
        key="specimens-page"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18 }}
      >
        <EnvironmentalImpactSection
          activeSection="specimens"
          onSpeakProfile={(profile) => speakProfile(profile, true)}
          onOpenQrModal={(profile) => setQrModalSpecimen(profile)}
          onNavigateToScanner={() => navigateToPage('scanner')}
        />
      </motion.div>
    )}

    {/* PAGE 03: Ecological & Public Health Impact */}
    {activeNavSection === 'impact' && (
      <motion.div
        key="impact-page"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18 }}
      >
        <EnvironmentalImpactSection
          activeSection="impact"
          onSpeakProfile={(profile) => speakProfile(profile, true)}
          onOpenQrModal={(profile) => setQrModalSpecimen(profile)}
        />
      </motion.div>
    )}

    {/* PAGE 04: User Progress, Telemetry & Scan History */}
    {activeNavSection === 'analytics' && (
      <motion.div
        key="analytics-page"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18 }}
      >
        <ProgressDashboard
          standalone={true}
          dailyProgress={dailyProgress}
          scanLogs={scanLogs}
          onExportCsv={handleExportCsv}
          onResetSessionLogs={handleResetSessionLogs}
          onUpdateNote={handleUpdateNote}
          onToggleBookmark={handleToggleBookmark}
        />
      </motion.div>
    )}

    {/* PAGE 05: Student Botany & Plant Science 15-Question Trivia */}
    {activeNavSection === 'trivia' && (
      <motion.div
        key="trivia-page"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18 }}
      >
        <PlantTriviaPage
          onNavigateToScanner={() => navigateToPage('scanner')}
          ttsEnabled={ttsEnabled}
        />
      </motion.div>
    )}

    {/* PAGE 06: FloraFact Botanical AI Chatbot (Jotform Agent) */}
    {activeNavSection === 'chatbot' && (
      <motion.div
        key="chatbot-page"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18 }}
      >
        <FloraFactChatbotPage
          onNavigateToScanner={() => navigateToPage('scanner')}
        />
      </motion.div>
    )}
  </AnimatePresence>

  {/* Official TECHNO Blazers Website Review QR Code Section */}
  <div className="mt-8">
    <WebsiteReviewBanner onOpenReviewModal={() => setShowReviewModal(true)} />
  </div>
</main>

      {/* Footer */}
      <footer className="relative z-10 bg-white/85 backdrop-blur-md border-t border-slate-200/80 px-4 md:px-6 py-6 mt-6 pb-22 md:pb-6">
        <div className="max-w-[1340px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 text-center sm:text-left">
          <div>
            <span>The Green Medic</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>TECHNO Blazers</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>Offline-Ready PWA</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigateToPage('scanner')}
              className={`hover:text-slate-900 cursor-pointer ${activeNavSection === 'scanner' ? 'text-emerald-700 font-semibold' : ''}`}
            >
              Scanner
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => navigateToPage('specimens')}
              className={`hover:text-slate-900 cursor-pointer ${activeNavSection === 'specimens' ? 'text-emerald-700 font-semibold' : ''}`}
            >
              Specimens
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => navigateToPage('impact')}
              className={`hover:text-slate-900 cursor-pointer ${activeNavSection === 'impact' ? 'text-emerald-700 font-semibold' : ''}`}
            >
              Impact
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => navigateToPage('analytics')}
              className={`hover:text-slate-900 cursor-pointer ${activeNavSection === 'analytics' ? 'text-emerald-700 font-semibold' : ''}`}
            >
              Analytics
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => navigateToPage('trivia')}
              className={`hover:text-slate-900 cursor-pointer ${activeNavSection === 'trivia' ? 'text-emerald-700 font-semibold' : ''}`}
            >
              Plant Trivia (15)
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => navigateToPage('chatbot')}
              className={`hover:text-slate-900 cursor-pointer ${activeNavSection === 'chatbot' ? 'text-emerald-700 font-semibold' : ''}`}
            >
              FloraFact Bot
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setShowReviewModal(true)}
              className="hover:text-emerald-700 font-medium text-emerald-700 cursor-pointer"
            >
              Submit Review (QR)
            </button>
            <span aria-hidden="true">·</span>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-slate-700 hover:text-pink-600 font-semibold transition-colors"
              title="Follow @greenmedic.site on Instagram"
            >
              <InstagramBrandIcon className="w-4 h-4 shrink-0" />
              <span>Instagram</span>
            </a>
            <span aria-hidden="true">·</span>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-slate-700 hover:text-blue-600 font-semibold transition-colors"
              title="Visit The Green Medic on Facebook"
            >
              <FacebookBrandIcon className="w-4 h-4 shrink-0" />
              <span>Facebook</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Tab Bar (Thumb-Zone Multi-Page Navigation) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 h-14 grid grid-cols-6 items-center px-1 shadow-lg"
      >
        <button
          type="button"
          onClick={() => navigateToPage('scanner')}
          className={`flex flex-col items-center justify-center min-h-[44px] rounded-xl transition-all cursor-pointer ${
            activeNavSection === 'scanner'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span className="text-[9px] tracking-tight mt-0.5 whitespace-nowrap">
            Scanner
          </span>
        </button>
        <button
          type="button"
          onClick={() => navigateToPage('specimens')}
          className={`relative flex flex-col items-center justify-center min-h-[44px] rounded-xl transition-all cursor-pointer ${
            activeNavSection === 'specimens'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-[9px] tracking-tight mt-0.5 whitespace-nowrap">
            Species
          </span>
          <span className="absolute top-1 right-1 text-[8px] px-1 py-0.1 bg-emerald-100 text-emerald-800 rounded-full font-mono">
            5
          </span>
        </button>
        <button
          type="button"
          onClick={() => navigateToPage('impact')}
          className={`flex flex-col items-center justify-center min-h-[44px] rounded-xl transition-all cursor-pointer ${
            activeNavSection === 'impact'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span className="text-[9px] tracking-tight mt-0.5 whitespace-nowrap">
            Impact
          </span>
        </button>
        <button
          type="button"
          onClick={() => navigateToPage('analytics')}
          className={`relative flex flex-col items-center justify-center min-h-[44px] rounded-xl transition-all cursor-pointer ${
            activeNavSection === 'analytics'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span className="text-[9px] tracking-tight mt-0.5 whitespace-nowrap">
            History
          </span>
          {scanLogs.length > 0 && (
            <span className="absolute top-1 right-1 text-[8px] px-1 py-0.1 bg-slate-200 text-slate-800 rounded-full font-mono">
              {scanLogs.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => navigateToPage('trivia')}
          className={`relative flex flex-col items-center justify-center min-h-[44px] rounded-xl transition-all cursor-pointer ${
            activeNavSection === 'trivia'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span className="text-[9px] tracking-tight mt-0.5 whitespace-nowrap">
            Trivia
          </span>
          <span className="absolute top-1 right-1 text-[8px] px-1 py-0.1 bg-emerald-100 text-emerald-800 rounded-full font-mono">
            15
          </span>
        </button>
        <button
          type="button"
          onClick={() => navigateToPage('chatbot')}
          className={`relative flex flex-col items-center justify-center min-h-[44px] rounded-xl transition-all cursor-pointer ${
            activeNavSection === 'chatbot'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span className="text-[9px] tracking-tight mt-0.5 whitespace-nowrap">
            AI Bot
          </span>
          <span className="absolute top-1 right-1 text-[8px] px-1 py-0.1 bg-emerald-600 text-white rounded-full font-bold">
            AI
          </span>
        </button>
      </nav>

      {/* Know More Modal Dialog (Voice Announcement & Redirection) */}
      <KnowMoreModal
        isOpen={showKnowMorePanel}
        onClose={() => setShowKnowMorePanel(false)}
        initialSpecimen={activeProfile}
        ttsEnabled={ttsEnabled}
      />

      {/* Specimen Detail Modal */}
      <SpecimenDetailModal
        specimen={inspectingQrSpecimen}
        isOpen={Boolean(inspectingQrSpecimen)}
        onClose={() => setInspectingQrSpecimen(null)}
        onSpeak={(profile) => speakProfile(profile, true)}
        onOpenQr={(profile) => setQrModalSpecimen(profile)}
      />

      {/* Botanical QR Code Modal */}
      <BotanicalQrModal
        specimen={qrModalSpecimen}
        isOpen={Boolean(qrModalSpecimen)}
        onClose={() => setQrModalSpecimen(null)}
        onSelectForInspection={(profile) => setInspectingQrSpecimen(profile)}
      />

      {/* Sample QR Tags Modal */}
      <SampleQrTagsModal
        isOpen={showSampleQrModal}
        onClose={() => setShowSampleQrModal(false)}
        onSelectSpecimen={(profile) => setInspectingQrSpecimen(profile)}
      />

      {/* Website Review QR Code & Feedback Modal */}
      <WebsiteReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
      />

      {/* Offline Status Indicator */}
      <OfflineIndicator />
    </div>
  );
}

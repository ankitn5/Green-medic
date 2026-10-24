import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Volume2,
  VolumeX,
  ExternalLink,
  Calendar,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { BOTANICAL_CLASSES, BotanicalClassProfile } from '../data/botanicalData';

interface KnowMoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSpecimen?: BotanicalClassProfile | null;
  ttsEnabled: boolean;
}

const REDIRECT_URL = 'https://yobroiamyobro.vercel.app';

export const KnowMoreModal: React.FC<KnowMoreModalProps> = ({
  isOpen,
  onClose,
  initialSpecimen,
  ttsEnabled,
}) => {
  const plants = BOTANICAL_CLASSES.filter((c) => c.id !== 'background');
  const [selectedPlant, setSelectedPlant] = useState<BotanicalClassProfile>(() => {
    if (initialSpecimen && initialSpecimen.id !== 'background') {
      return initialSpecimen;
    }
    return plants[0];
  });

  const [isAnnouncing, setIsAnnouncing] = useState(false);
  const [announcingStatus, setAnnouncingStatus] = useState<string>('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const timerRef = useRef<number | null>(null);
  const isCancelledRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Update selected plant when modal opens with a specific specimen
  useEffect(() => {
    if (isOpen && initialSpecimen && initialSpecimen.id !== 'background') {
      setSelectedPlant(initialSpecimen);
    }
  }, [isOpen, initialSpecimen]);

  // Clean up voice and timers on close
  useEffect(() => {
    if (!isOpen) {
      stopAnnouncement();
    }
  }, [isOpen]);

  const stopAnnouncement = () => {
    isCancelledRef.current = true;
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsAnnouncing(false);
    setAnnouncingStatus('');
    setCountdown(null);
  };

  const handleRedirect = () => {
    stopAnnouncement();
    onClose();
    if (typeof window !== 'undefined') {
      try {
        window.open(REDIRECT_URL, '_blank', 'noopener,noreferrer');
      } catch {
        window.location.href = REDIRECT_URL;
      }
    }
  };

  const startSequentialAnnouncement = () => {
    if (!synthRef.current) {
      handleRedirect();
      return;
    }

    stopAnnouncement();
    isCancelledRef.current = false;
    setIsAnnouncing(true);

    const announcementItems = [
      {
        label: `Plant name and scientific name: ${selectedPlant.name}, scientifically classified as ${selectedPlant.scientificName}.`,
        status: `Announcing ${selectedPlant.name} (${selectedPlant.scientificName})...`,
      },
      {
        label: `Botanical definition: ${selectedPlant.summary}`,
        status: 'Announcing botanical definition...',
      },
      {
        label: `Season for growing: ${selectedPlant.growingSeason}.`,
        status: 'Announcing season for growing...',
      },
      {
        label: `Plant uses: ${selectedPlant.traditionalUses.slice(0, 3).join('. ')}.`,
        status: 'Announcing medicinal & traditional uses...',
      },
    ];

    let currentStep = 0;

    const speakNextStep = () => {
      if (isCancelledRef.current) return;

      if (currentStep >= announcementItems.length) {
        setAnnouncingStatus('Announcement complete! Redirecting now...');
        setIsAnnouncing(false);
        // Start 3 second countdown before redirect
        let sec = 3;
        setCountdown(sec);
        timerRef.current = window.setInterval(() => {
          sec -= 1;
          if (sec <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleRedirect();
          } else {
            setCountdown(sec);
          }
        }, 1000);
        return;
      }

      const item = announcementItems[currentStep];
      setAnnouncingStatus(item.status);

      const utterance = new SpeechSynthesisUtterance(item.label);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      utterance.onend = () => {
        if (!isCancelledRef.current) {
          currentStep += 1;
          setTimeout(speakNextStep, 450);
        }
      };

      utterance.onerror = () => {
        if (!isCancelledRef.current) {
          currentStep += 1;
          speakNextStep();
        }
      };

      synthRef.current?.speak(utterance);
    };

    speakNextStep();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              stopAnnouncement();
              onClose();
            }}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="relative z-10 w-full max-w-2xl bg-white border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Botanical Encyclopedia
                  </h2>
                  <p className="text-xs text-slate-500">
                    Scientific names · Botanical definition · Growing season · Plant uses
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  stopAnnouncement();
                  onClose();
                }}
                className="w-8 h-8 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Species Selector Tabs */}
            <div className="px-5 sm:px-6 pt-3 pb-2 bg-white border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {plants.map((plant) => {
                  const isSelected = selectedPlant.id === plant.id;
                  const isWeed = plant.category === 'weed';
                  return (
                    <button
                      key={plant.id}
                      type="button"
                      onClick={() => {
                        stopAnnouncement();
                        setSelectedPlant(plant);
                      }}
                      className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? isWeed
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                            : 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200/80 border border-transparent'
                      }`}
                    >
                      {isWeed ? (
                        <ShieldAlert className="w-3.5 h-3.5" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      <span>{plant.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-slate-800">
              {/* Primary Plant Title & Scientific Taxonomy */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900">{selectedPlant.name}</h3>
                    <span
                      className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                        selectedPlant.category === 'weed'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}
                    >
                      {selectedPlant.category === 'weed' ? 'Invasive Weed' : 'Medicinal Herb'}
                    </span>
                  </div>
                  <p className="text-xs font-mono italic text-emerald-700 mt-0.5">
                    Scientific Name: {selectedPlant.scientificName} · Family {selectedPlant.family}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={isAnnouncing ? stopAnnouncement : startSequentialAnnouncement}
                    className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-2xs ${
                      isAnnouncing
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                    }`}
                  >
                    {isAnnouncing ? (
                      <>
                        <VolumeX className="w-4 h-4" />
                        <span>Stop Speech</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" />
                        <span>Announce All</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Live Announcing Status Banner */}
              {isAnnouncing && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-3 text-xs text-emerald-900 animate-pulse">
                  <div className="flex items-center gap-2 font-medium">
                    <Volume2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{announcingStatus}</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700">Audio Active</span>
                </div>
              )}

              {/* Countdown Banner if redirecting */}
              {countdown !== null && (
                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-950">
                  <span className="font-semibold">
                    Finished announcing! Redirecting to partner portal in {countdown}s...
                  </span>
                  <button
                    type="button"
                    onClick={handleRedirect}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium cursor-pointer"
                  >
                    Go Immediately
                  </button>
                </div>
              )}

              {/* 4 Core Pillars Required by Prompt: Definition, Season, Uses, Scientific Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* 1. Definition */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                    Botanical Definition
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    {selectedPlant.summary}
                  </p>
                </div>

                {/* 2. Growing Season */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                      Season for Growing
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                    {selectedPlant.growingSeason}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Optimal soil temperature and sunlight requirements for highest foliar yield.
                  </p>
                </div>

                {/* 3. Plant Uses */}
                <div className="md:col-span-2 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                    Traditional, Clinical & Agricultural Uses
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedPlant.traditionalUses.map((use, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/60 text-xs text-slate-800 flex items-start gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                        <span>{use}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer with Redirection Action */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-500 text-center sm:text-left">
                Announces plant botany then redirects to <strong className="text-slate-800">yobroiamyobro.vercel.app</strong>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    stopAnnouncement();
                    onClose();
                  }}
                  className="flex-1 sm:flex-initial min-h-[40px] px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium cursor-pointer transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleRedirect}
                  className="flex-1 sm:flex-initial min-h-[40px] px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <span>Visit yobroiamyobro</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

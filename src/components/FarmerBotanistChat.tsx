import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sprout,
  X,
  Send,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  MessageCircleQuestion,
} from 'lucide-react';
import { BotanicalClassProfile } from '../data/botanicalData';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface FarmerBotanistChatProps {
  activeProfile: BotanicalClassProfile;
  confidence: number;
  isTriggered: boolean;
}

const QUICK_FARMER_QUESTIONS = [
  'Why do crop leaves turn yellow (chlorosis) and how can I fix it?',
  'How do I prepare Neem leaf extract as a natural farm bio-pesticide?',
  'How do I safely remove toxic Parthenium weed from my crop field?',
  'How can Aloe Vera or Tulsi be used as natural plant growth boosters?',
];

export const FarmerBotanistChat: React.FC<FarmerBotanistChatProps> = ({
  activeProfile,
  confidence,
  isTriggered,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'model',
      text: 'Namaste & Hello Farmer! I am your Field Botanist Assistant. Ask me anything about leaf diseases, soil nutrients, organic bio-pesticides (like Neem & Tulsi), weed control, or plant biology.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [messages, isOpen]);

  const stopVoice = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
  };

  const toggleSpeakMessage = (msg: ChatMessage) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingMessageId === msg.id) {
      stopVoice();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(msg.text);
    utterance.rate = 0.98;
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);
    setSpeakingMessageId(msg.id);
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/botanist-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
          activeSpecimen:
            activeProfile.id !== 'background'
              ? {
                  name: activeProfile.name,
                  scientificName: activeProfile.scientificName,
                  category: activeProfile.category,
                  compounds: activeProfile.traditionalUses,
                  primaryAction: activeProfile.summary,
                  cautionNote: activeProfile.safetyAndEcologicalNote,
                  confidence,
                }
              : null,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Could not reach the Field Botanist service.');
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      const fallbackMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text:
          err instanceof Error
            ? `Connection note: ${err.message}`
            : 'Unable to reach the Field Botanist server right now. Please try again in a moment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleResetChat = () => {
    stopVoice();
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: 'Chat cleared. Ask me any question about botany, leaf health, soil care, or farm remedies!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const hasActiveSpecimen = activeProfile.id !== 'background';

  return (
    <>
      {/* Small Floating Button (Positioned bottom-left so Jotform Botanical Bot sits cleanly in bottom-right) */}
      <div className="fixed bottom-18 md:bottom-6 left-4 md:left-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Open Farmer AI Botanist Chat"
          className="group flex items-center gap-2 min-h-[44px] px-3.5 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg shadow-emerald-950/20 border border-emerald-500/40 transition-all active:scale-95 cursor-pointer"
        >
          <span className="w-6 h-6 rounded-full bg-emerald-600/90 flex items-center justify-center shrink-0">
            {isOpen ? (
              <X className="w-3.5 h-3.5 text-white" />
            ) : (
              <Sprout className="w-3.5 h-3.5 text-emerald-100" />
            )}
          </span>
          <span className="text-xs font-semibold tracking-tight pr-0.5">
            {isOpen ? 'Close Guide' : 'Farmer Quick Guide'}
          </span>
        </button>
      </div>

      {/* Expandable Farmer Botanist Chat Modal / Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs"
            />

            <motion.aside
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              aria-label="Farmer AI Botanist Assistant"
              className="fixed bottom-0 left-0 right-0 md:bottom-20 md:left-6 md:right-auto z-50 w-full md:w-[390px] max-h-[82vh] md:max-h-[580px] bg-white rounded-t-3xl md:rounded-2xl border border-slate-200/90 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Mobile Drag Handle */}
              <div className="md:hidden w-10 h-1.5 bg-slate-300 rounded-full mx-auto mt-2.5 mb-1 shrink-0" />

              {/* Header */}
              <div className="px-4 py-3 bg-emerald-950 text-white flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-800/90 border border-emerald-600/40 flex items-center justify-center shrink-0">
                    <Sprout className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xs font-bold tracking-tight text-white truncate">
                      Farmer Botanist Guide
                    </h2>
                    <p className="text-[11px] text-emerald-200/80 truncate">
                      Botany, Soil Care & Organic Crop Remedies
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={handleResetChat}
                    title="Clear conversation"
                    className="w-8 h-8 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-900/80 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      stopVoice();
                      setIsOpen(false);
                    }}
                    title="Close chat"
                    className="w-8 h-8 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-900/80 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Active Specimen Context Bar (if a plant is currently selected/detected) */}
              {hasActiveSpecimen && (
                <div className="px-3.5 py-2 bg-emerald-50/90 border-b border-emerald-200/70 flex items-center justify-between gap-2 shrink-0">
                  <div className="text-[11px] text-emerald-950 truncate">
                    <span className="font-semibold">Scanner Plant:</span>{' '}
                    <span>{activeProfile.name}</span>{' '}
                    <span className="italic text-emerald-700">
                      ({activeProfile.scientificName})
                    </span>
                    {isTriggered && (
                      <span className="ml-1 font-mono text-[10px] text-emerald-700">
                        · {confidence.toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      sendMessage(
                        `Tell me how farmers can identify and use ${activeProfile.name} (${activeProfile.scientificName}) on the farm, including its botanical traits and precautions.`
                      )
                    }
                    disabled={isLoading}
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-[10px] font-semibold transition-colors cursor-pointer"
                  >
                    Ask About {activeProfile.name.split(' ')[0]}
                  </button>
                </div>
              )}

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50/60">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  const isSpeakingThis = speakingMessageId === msg.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isUser ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                          isUser
                            ? 'bg-emerald-700 text-white rounded-br-xs shadow-2xs'
                            : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs shadow-2xs'
                        }`}
                      >
                        {msg.text}
                      </div>

                      <div className="mt-1 px-1 flex items-center gap-2 text-[10px] text-slate-400">
                        <span>{msg.timestamp}</span>
                        {!isUser && (
                          <button
                            type="button"
                            onClick={() => toggleSpeakMessage(msg)}
                            className="inline-flex items-center gap-1 text-slate-500 hover:text-emerald-700 font-medium cursor-pointer"
                            title="Listen to answer"
                          >
                            {isSpeakingThis ? (
                              <>
                                <VolumeX className="w-3 h-3 text-emerald-700" />
                                <span className="text-emerald-700">Stop Audio</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3" />
                                <span>Listen</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Quick Farmer Questions (shown when conversation is short) */}
                {messages.length <= 2 && !isLoading && (
                  <div className="pt-1 space-y-1.5">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 px-0.5">
                      <MessageCircleQuestion className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Common Farmer Botany Questions:</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {QUICK_FARMER_QUESTIONS.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => sendMessage(q)}
                          className="text-left px-3 py-2 rounded-xl bg-white hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-300 text-[11px] text-slate-700 transition-colors cursor-pointer"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isLoading && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white border border-slate-200/80 w-fit text-xs text-slate-500">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                    <span>Analyzing botanical guidance...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form
                onSubmit={handleFormSubmit}
                className="p-2.5 bg-white border-t border-slate-200/80 flex items-center gap-2 shrink-0"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about leaves, soil, pests, or remedies..."
                  disabled={isLoading}
                  className="flex-1 min-h-[40px] px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  aria-label="Send botany question"
                  className="min-h-[40px] min-w-[40px] rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

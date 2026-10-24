import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Bot,
  ExternalLink,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  ShieldCheck,
  WifiOff,
  Sprout,
  HelpCircle,
} from 'lucide-react';

interface FloraFactChatbotPageProps {
  onNavigateToScanner: () => void;
}

export const JOTFORM_AGENT_URL = 'https://www.jotform.com/agent/01a1696dffb870008f0747a1f57f8fcdd009';

const SUGGESTED_QUESTIONS = [
  'What are the key medicinal benefits and daily uses of Tulsi (Holy Basil)?',
  'How do I identify Crabgrass weed vs healthy lawn turf grass?',
  'How to prepare an organic Neem leaf and oil spray for plant pest defense?',
  'What are natural remedies for Peppermint foliar rust and black spots?',
  'Can I consume Tulsi and Peppermint leaves together as a herbal tea infusion?',
  'What is the difference between Holy Basil and sweet culinary basil?',
];

export const FloraFactChatbotPage: React.FC<FloraFactChatbotPageProps> = ({
  onNavigateToScanner,
}) => {
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const handleCopyPrompt = (text: string, index: number) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-[1340px] mx-auto min-w-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5 min-w-0">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <button
              type="button"
              onClick={onNavigateToScanner}
              className="hover:text-emerald-700 font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Scanner</span>
            </button>
            <span aria-hidden="true">·</span>
            <span>FloraFact AI Agent</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-xl inline-flex">
              <Bot className="w-6 h-6" />
            </span>
            <span>FloraFact Botanical Assistant</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Your dedicated AI herbal assistant powered by Jotform Agent. Ask questions about medicinal plant taxonomy, foliar disease cures, dosage, or ecological weed control.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleReload}
            className="min-h-[40px] px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Reload chatbot session"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Reload Chat</span>
          </button>

          <a
            href={JOTFORM_AGENT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[40px] px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-2xs"
            title="Open FloraFact in a full browser tab"
          >
            <span>Full-Screen Window</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Offline Notice if disconnected */}
      {!isOnline && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-amber-900">
          <WifiOff className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="font-semibold block">You are currently offline</span>
            <span>FloraFact AI Agent requires an internet connection to process queries. Your offline species guide and camera telemetry remain fully functional!</span>
          </div>
        </div>
      )}

      {/* Main Chatbot Viewport Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-w-0">
        {/* Chatbot iFrame Viewport: 8 cols on desktop */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs flex flex-col min-w-0">
          {/* Subheader bar */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-800">FloraFact Agent Active</span>
              <span className="text-slate-300">·</span>
              <span className="font-mono text-[11px] text-slate-400">Jotform AI Bot</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-md">
              Secure Sandbox
            </span>
          </div>

          {/* iFrame with Loading Skeleton */}
          <div className="relative w-full h-[620px] sm:h-[680px] bg-slate-50 min-w-0 overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/90 backdrop-blur-xs">
                <RefreshCw className="w-7 h-7 text-emerald-600 animate-spin" />
                <div className="text-center">
                  <div className="text-xs font-semibold text-slate-800">Loading FloraFact Assistant...</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Connecting to Jotform Botanical Agent</div>
                </div>
              </div>
            )}

            <iframe
              key={iframeKey}
              src={JOTFORM_AGENT_URL}
              title="FloraFact Botanical AI Chatbot"
              onLoad={() => setIsLoading(false)}
              className="w-full h-full border-0"
              allow="microphone *; camera *; display-capture *; clipboard-write;"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
          </div>
        </div>

        {/* Sidebar: Suggested Inquiries & Quick Guides: 4 cols on desktop */}
        <div className="lg:col-span-4 space-y-4 min-w-0">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 border-b border-slate-100 pb-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Suggested Questions</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Tap any inquiry below to copy it, then paste it directly into FloraFact:
            </p>

            <div className="space-y-2">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleCopyPrompt(q, idx)}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-emerald-50 hover:border-emerald-200 transition-all text-xs text-slate-700 flex items-start justify-between gap-2 cursor-pointer group"
                >
                  <span className="leading-snug break-words">{q}</span>
                  <span className="shrink-0 mt-0.5 text-slate-400 group-hover:text-emerald-700">
                    {copiedIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* FloraFact Information Card */}
          <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/50 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-950 font-bold">
              <Sprout className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>About FloraFact Agent</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              FloraFact is trained on botanical taxonomy, ethnobotanical pharmacology, and sustainable organic agronomy to assist students, herbalists, and researchers.
            </p>
            <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-800">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Verified Botanical Agent</span>
              </span>
              <a
                href={JOTFORM_AGENT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline hover:text-emerald-950"
              >
                External Link
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'motion/react';
import { X, QrCode, Download, Sparkles, Check } from 'lucide-react';
import { BotanicalClassProfile } from '../data/botanicalData';

interface BotanicalQrModalProps {
  specimen: BotanicalClassProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectForInspection?: (specimen: BotanicalClassProfile) => void;
}

export const BotanicalQrModal: React.FC<BotanicalQrModalProps> = ({
  specimen,
  isOpen,
  onClose,
  onSelectForInspection,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!specimen) return;

    const tagPayload = JSON.stringify({
      app: 'The Green Medic',
      code: specimen.classificationCode,
      species: specimen.id,
      name: specimen.name,
      sci: specimen.scientificName,
      cat: specimen.category,
    });

    QRCode.toDataURL(tagPayload, {
      width: 280,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR:', err));
  }, [specimen]);

  if (!isOpen || !specimen) return null;

  const handleCopyTag = () => {
    if (!specimen) return;
    navigator.clipboard.writeText(
      `[Green Medic Pot Tag] ${specimen.classificationCode} - ${specimen.name} (${specimen.scientificName})`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrDataUrl || !specimen) return;
    const link = document.createElement('a');
    link.download = `pot-tag-${specimen.id}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.98 }}
          transition={{ type: 'spring', damping: 26, stiffness: 260 }}
          className="bg-white rounded-t-3xl sm:rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 text-center relative"
          role="dialog"
          aria-modal="true"
        >
          {/* Mobile Sheet Grab Handle */}
          <div className="sm:hidden pb-3 flex justify-center">
            <div className="w-10 h-1.5 rounded-full bg-slate-300" />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close QR Modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="text-xs text-emerald-700 font-medium mb-1">
            Botanical Pot Tag & Herbarium QR
          </div>

          <h3 className="text-lg font-bold text-slate-900">{specimen.name}</h3>
          <p className="text-xs text-slate-500 italic mt-0.5">{specimen.scientificName}</p>
          <div className="text-[11px] font-mono text-slate-400 mt-1">
            Tag: {specimen.classificationCode}
          </div>

          <div className="my-4 sm:my-5 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 inline-block">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR Code for ${specimen.name}`}
                referrerPolicy="no-referrer"
                className="w-44 h-44 sm:w-48 sm:h-48 mx-auto rounded-xl"
              />
            ) : (
              <div className="w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center text-xs text-slate-400">
                Generating code...
              </div>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto mb-5">
            Point The Green Medic camera in <strong>QR & Pot Tag</strong> mode to scan this specimen live from another screen or printed pot marker.
          </p>

          <div className="grid grid-cols-3 sm:flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="min-h-[44px] sm:min-h-[38px] px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>Save PNG</span>
            </button>
            <button
              type="button"
              onClick={handleCopyTag}
              className="min-h-[44px] sm:min-h-[38px] px-3 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" /> : <QrCode className="w-3.5 h-3.5 shrink-0" />}
              <span>{copied ? 'Copied' : 'Copy Tag'}</span>
            </button>
            {onSelectForInspection && (
              <button
                type="button"
                onClick={() => {
                  onSelectForInspection(specimen);
                  onClose();
                }}
                className="min-h-[44px] sm:min-h-[38px] px-3 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Dossier</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'motion/react';
import { X, QrCode, Download, ExternalLink, Sparkles, Check } from 'lucide-react';
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

    // Standardized pot tag payload format
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 text-center relative"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close QR Modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium mb-3">
            <QrCode className="w-3.5 h-3.5" />
            <span>Botanical Pot Tag & Herbarium QR</span>
          </div>

          <h3 className="text-lg font-bold text-slate-900">{specimen.name}</h3>
          <p className="text-xs text-slate-500 italic mt-0.5">{specimen.scientificName}</p>
          <div className="text-[11px] font-mono text-slate-400 mt-1">
            Tag: {specimen.classificationCode}
          </div>

          <div className="my-5 p-3 bg-slate-50 rounded-xl border border-slate-200/80 inline-block">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR Code for ${specimen.name}`}
                className="w-48 h-48 mx-auto rounded-lg"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                Generating code...
              </div>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto mb-4">
            Point "The Green Medic" camera in <strong>QR & Pot Tag</strong> mode to scan this specimen live from another screen or printed pot marker.
          </p>

          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save PNG</span>
            </button>
            <button
              type="button"
              onClick={handleCopyTag}
              className="px-3.5 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <QrCode className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
            {onSelectForInspection && (
              <button
                type="button"
                onClick={() => {
                  onSelectForInspection(specimen);
                  onClose();
                }}
                className="px-3.5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Open Dossier</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

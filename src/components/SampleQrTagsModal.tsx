import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, QrCode, Download, ExternalLink, Leaf } from 'lucide-react';
import QRCode from 'qrcode';
import { BOTANICAL_CLASSES, BotanicalClassProfile } from '../data/botanicalData';

interface SampleQrTagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSpecimen?: (specimen: BotanicalClassProfile) => void;
}

export const SampleQrTagsModal: React.FC<SampleQrTagsModalProps> = ({
  isOpen,
  onClose,
  onSelectSpecimen,
}) => {
  const [qrUrls, setQrUrls] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!isOpen) return;

    const generateAll = async () => {
      const urls: Record<string, string> = {};
      for (const specimen of BOTANICAL_CLASSES) {
        if (specimen.id === 'background') continue;
        const payload = JSON.stringify({
          app: 'The Green Medic',
          code: specimen.classificationCode,
          species: specimen.id,
          name: specimen.name,
          sci: specimen.scientificName,
        });
        try {
          urls[specimen.id] = await QRCode.toDataURL(payload, {
            width: 180,
            margin: 1,
            color: { dark: '#0f172a', light: '#ffffff' },
          });
        } catch (e) {
          console.error(e);
        }
      }
      setQrUrls(urls);
    };

    generateAll();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 text-left relative max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 text-xs font-medium mb-1">
                <QrCode className="w-3.5 h-3.5" />
                <span>Field Testing & Botanical Pot Tags</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Botanical Specimen QR Codes
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Point "The Green Medic" camera in <strong>QR & Pot Tag</strong> mode to scan any of these tags in real time.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Grid of QR tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 overflow-y-auto flex-1">
            {BOTANICAL_CLASSES.filter((c) => c.id !== 'background').map((specimen) => (
              <div
                key={specimen.id}
                className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col items-center text-center justify-between hover:border-slate-300 transition-colors"
              >
                <div className="w-full flex items-center justify-between text-[11px] text-slate-400 font-mono mb-2">
                  <span>{specimen.classificationCode}</span>
                  <span className="capitalize text-emerald-700 font-medium">{specimen.category}</span>
                </div>

                <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs my-1">
                  {qrUrls[specimen.id] ? (
                    <img
                      src={qrUrls[specimen.id]}
                      alt={`QR Code for ${specimen.name}`}
                      className="w-32 h-32"
                    />
                  ) : (
                    <div className="w-32 h-32 flex items-center justify-center text-xs text-slate-300">
                      Generating...
                    </div>
                  )}
                </div>

                <div className="mt-2">
                  <div className="text-sm font-semibold text-slate-900">{specimen.name}</div>
                  <div className="text-xs italic text-slate-500">{specimen.scientificName}</div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 w-full flex items-center justify-center gap-2">
                  {onSelectSpecimen && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectSpecimen(specimen);
                        onClose();
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Inspect
                    </button>
                  )}
                  {qrUrls[specimen.id] && (
                    <a
                      href={qrUrls[specimen.id]}
                      download={`pot-tag-${specimen.id}.png`}
                      className="px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-400">
            <span>8th-Grade Competition Herbarium System</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

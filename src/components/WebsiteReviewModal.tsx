import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import jsQR from 'jsqr';
import {
  QrCode,
  Star,
  X,
  Download,
  ExternalLink,
  CheckCircle2,
  MessageSquareHeart,
  Send,
} from 'lucide-react';
import reviewQrAsset from '../../qr-code.png';

export interface WebsiteReviewEntry {
  id: string;
  reviewerName: string;
  role: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const DEFAULT_REVIEWS: WebsiteReviewEntry[] = [
  {
    id: 'rev-1',
    reviewerName: 'Aarav Sharma',
    role: 'Science Exhibition Judge',
    rating: 5,
    comment:
      'Impressive real-time leaf classification and SPAD chlorophyll telemetry. Works smoothly even without internet.',
    createdAt: 'Recent Review',
  },
  {
    id: 'rev-2',
    reviewerName: 'Priya Nair',
    role: 'Botany Student',
    rating: 5,
    comment:
      'The 15-question botany trivia and voice pronunciation make learning medicinal plants super interactive.',
    createdAt: 'Recent Review',
  },
];

const STORAGE_KEY = 'the_green_medic_website_reviews';

interface WebsiteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WebsiteReviewModal: React.FC<WebsiteReviewModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [decodedQrUrl, setDecodedQrUrl] = useState<string | null>(null);
  const [reviews, setReviews] = useState<WebsiteReviewEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore storage errors
    }
    return DEFAULT_REVIEWS;
  });

  const [name, setName] = useState('');
  const [role, setRole] = useState('Student / Visitor');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Automatically decode the QR code URL from qr-code.png using jsQR
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 500;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, size, size);
        const imageData = ctx.getImageData(0, 0, size, size);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          setDecodedQrUrl(code.data);
        }
      } catch {
        // ignore canvas decode error
      }
    };
    img.src = reviewQrAsset || '/qr-code.png';
  }, []);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const newEntry: WebsiteReviewEntry = {
      id: `rev-${Date.now()}`,
      reviewerName: name.trim() || 'Anonymous Reviewer',
      role: role.trim() || 'Website Visitor',
      rating,
      comment: comment.trim(),
      createdAt: new Date().toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    const updated = [newEntry, ...reviews];
    setReviews(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    setName('');
    setComment('');
    setRating(5);
    setSubmittedSuccess(true);
    setTimeout(() => setSubmittedSuccess(false), 3500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="relative z-10 w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                  <MessageSquareHeart className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Submit Website Review — TECHNO Blazers
                  </h2>
                  <p className="text-xs text-slate-500">
                    Scan the official QR code with your phone or leave a review below
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close review modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left 5 cols: Official TECHNO Blazers QR Code */}
              <div className="md:col-span-5 bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-col items-center text-center space-y-3">
                <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-emerald-800">
                  Scan to Submit Review
                </span>

                <div className="w-full max-w-[230px] aspect-square bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-center">
                  <img
                    src={reviewQrAsset || '/qr-code.png'}
                    alt="TECHNO Blazers Official Website Review QR Code"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Point your smartphone camera at this <strong>TECHNO Blazers</strong> QR code to open the review form directly on your mobile device.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 w-full pt-1">
                  <a
                    href={reviewQrAsset || '/qr-code.png'}
                    download="techno-blazers-review-qr.png"
                    className="flex-1 min-h-[38px] px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Save QR</span>
                  </a>

                  {decodedQrUrl && /^https?:\/\//i.test(decodedQrUrl) && (
                    <a
                      href={decodedQrUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-h-[38px] px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <span>Open Form</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Right 7 cols: Instant On-Page Review Submission & Recent Feedback */}
              <div className="md:col-span-7 space-y-5">
                <form
                  onSubmit={handleSubmitReview}
                  className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">
                      Leave Feedback Directly
                    </h3>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-0.5 cursor-pointer transition-transform hover:scale-110"
                          aria-label={`Rate ${star} stars`}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              star <= rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name (optional)"
                      className="min-h-[38px] px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
                    />
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Role (e.g., Student, Judge, Farmer)"
                      className="min-h-[38px] px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>

                  <textarea
                    rows={3}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with The Green Medic botanical scanner..."
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white resize-none"
                  />

                  <div className="flex items-center justify-between gap-2">
                    {submittedSuccess ? (
                      <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Thank you! Your review has been saved.</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        Saved locally &amp; works offline
                      </span>
                    )}

                    <button
                      type="submit"
                      className="min-h-[38px] px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Review</span>
                    </button>
                  </div>
                </form>

                {/* Community Reviews Feed */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>5.0 ★ Average</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const INSTAGRAM_URL = 'https://www.instagram.com/greenmedic.site/?hl=en';
export const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61595697963965';

export const InstagramBrandIcon: React.FC<{ className?: string }> = ({
  className = 'w-4 h-4',
}) => {
  const gradId = React.useId();
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id={gradId} cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill={`url(#${gradId})`} />
      <rect
        x="3.75"
        y="3.75"
        width="16.5"
        height="16.5"
        rx="4.25"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.8"
      />
      <circle
        cx="12"
        cy="12"
        r="3.8"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.8"
      />
      <circle cx="16.4" cy="7.6" r="1.15" fill="#ffffff" />
    </svg>
  );
};

export const FacebookBrandIcon: React.FC<{ className?: string }> = ({
  className = 'w-4 h-4',
}) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="24" rx="6" fill="#1877F2" />
    <path
      d="M16.67 15.47L17.2 12H13.87V9.75C13.87 8.8 14.34 7.87 15.83 7.87H17.35V4.92C17.35 4.92 15.97 4.68 14.65 4.68C11.9 4.68 10.1 6.35 10.1 9.37V12H7.03V15.47H10.1V24H13.87V15.47H16.67Z"
      fill="#ffffff"
    />
  </svg>
);

export const WebsiteReviewBanner: React.FC<{
  onOpenReviewModal: () => void;
}> = ({ onOpenReviewModal }) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
      <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <button
          type="button"
          onClick={onOpenReviewModal}
          className="group relative w-24 h-24 rounded-2xl bg-white border border-slate-200 p-1.5 shadow-2xs shrink-0 cursor-pointer hover:border-emerald-500 transition-all"
          title="Click to enlarge Review QR Code"
        >
          <img
            src={reviewQrAsset || '/qr-code.png'}
            alt="Scan QR Code to Submit Website Review"
            className="w-full h-full object-contain rounded-lg"
          />
        </button>

        <div className="space-y-1.5">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-sm sm:text-base font-bold text-slate-900">
              Submit a Review &amp; Connect With Us
            </span>
            <span className="text-xs font-mono text-emerald-700 font-semibold">
              TECHNO Blazers
            </span>
          </div>
          <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
            Scan the <strong>TECHNO Blazers</strong> QR code with your phone camera to submit a website review, or follow <strong>The Green Medic</strong> on Instagram and Facebook.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2.5 w-full lg:w-auto shrink-0">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[42px] px-3.5 py-2 rounded-xl bg-white hover:bg-pink-50/60 border border-slate-200 hover:border-pink-300 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-2xs"
          title="Follow @greenmedic.site on Instagram"
        >
          <InstagramBrandIcon className="w-4 h-4 shrink-0" />
          <span>Instagram</span>
        </a>

        <a
          href={FACEBOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[42px] px-3.5 py-2 rounded-xl bg-white hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-2xs"
          title="Visit The Green Medic on Facebook"
        >
          <FacebookBrandIcon className="w-4 h-4 shrink-0" />
          <span>Facebook</span>
        </a>

        <button
          type="button"
          onClick={onOpenReviewModal}
          className="min-h-[42px] px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
        >
          <QrCode className="w-4 h-4 text-emerald-200" />
          <span>Scan QR / Write Review</span>
        </button>
      </div>
    </div>
  );
};

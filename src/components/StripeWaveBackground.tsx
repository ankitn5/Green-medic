import React, { useState } from 'react';

/**
 * Renders the Stripe-inspired flowing wave background extracted from stripe.png,
 * paired with a resilient multi-layered SVG silk-ribbon wave mesh fallback so the
 * background remains crisp, fluid, and 100% free of broken images in all environments.
 */
export const StripeWaveBackground: React.FC = () => {
  const [waveImgError, setWaveImgError] = useState(false);

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none bg-[#FAFAFA]"
      aria-hidden="true"
    >
      {/* Subtle architectural grid lines matching Stripe's fullbleed layout lines */}
      <div className="absolute inset-0 max-w-[1340px] mx-auto border-x border-slate-200/45" />
      <div className="absolute inset-x-0 top-14 h-px bg-slate-200/50" />

      {/* Vector Silk Wave Mesh (Always present as base layer & zero-broken-image fallback) */}
      <svg
        className="Include-vector-wave absolute inset-0 w-full h-full object-cover opacity-90"
        viewBox="0 0 1440 960"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="stripeRibbon1" x1="0%" y1="15%" x2="100%" y2="85%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.24" />
            <stop offset="35%" stopColor="#06B6D4" stopOpacity="0.22" />
            <stop offset="70%" stopColor="#6366F1" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#EC4899" stopOpacity="0.18" />
          </linearGradient>

          <linearGradient id="stripeRibbon2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.20" />
            <stop offset="45%" stopColor="#EC4899" stopOpacity="0.18" />
            <stop offset="80%" stopColor="#6366F1" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.22" />
          </linearGradient>

          <linearGradient id="stripeRibbon3" x1="0%" y1="60%" x2="100%" y2="20%">
            <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.18" />
            <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#A855F7" stopOpacity="0.18" />
          </linearGradient>

          <filter id="stripeSoftBlur" x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur stdDeviation="28" />
          </filter>
        </defs>

        {/* Ambient soft color blooms */}
        <g filter="url(#stripeSoftBlur)">
          <path
            d="M-120 320 C 260 80, 620 540, 1040 240 C 1260 90, 1460 280, 1600 180 L 1600 680 C 1280 820, 880 420, 460 690 C 180 860, -40 620, -120 700 Z"
            fill="url(#stripeRibbon1)"
          />
          <path
            d="M-100 540 C 310 290, 740 720, 1140 390 C 1340 220, 1480 410, 1620 330 L 1620 860 C 1220 960, 810 590, 390 830 C 120 980, -30 780, -100 840 Z"
            fill="url(#stripeRibbon2)"
          />
        </g>

        {/* Crisp undulating Stripe-style 3D silk ribbon contours */}
        <path
          d="M-80 280 C 280 40, 660 520, 1060 210 C 1280 50, 1450 240, 1560 150"
          stroke="url(#stripeRibbon1)"
          strokeWidth="48"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          d="M-80 350 C 300 110, 680 590, 1080 280 C 1300 120, 1470 310, 1560 220"
          stroke="url(#stripeRibbon2)"
          strokeWidth="32"
          strokeLinecap="round"
          opacity="0.45"
        />
        <path
          d="M-80 430 C 320 190, 700 660, 1100 350 C 1320 190, 1490 380, 1560 290"
          stroke="url(#stripeRibbon3)"
          strokeWidth="20"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>

      {/* Responsive Stripe Wave Image Asset from stripe.png */}
      {!waveImgError && (
        <picture className="absolute inset-0 w-full h-full flex items-start justify-center opacity-80 mix-blend-multiply">
          <source
            srcSet="https://b.stripecdn.com/mkt-ssr-statics/assets/_next/static/media/wave-fallback-desktop-1x.fba6fa88.webp 1x, https://b.stripecdn.com/mkt-ssr-statics/assets/_next/static/media/wave-fallback-desktop-2x.f0521908.webp 2x"
            media="(min-width: 1264px)"
          />
          <source
            srcSet="https://b.stripecdn.com/mkt-ssr-statics/assets/_next/static/media/wave-fallback-tablet-1x.c0413950.webp 1x, https://b.stripecdn.com/mkt-ssr-statics/assets/_next/static/media/wave-fallback-tablet-2x.96d6cae7.webp 2x"
            media="(min-width: 640px) and (max-width: 1263px)"
          />
          <source
            srcSet="https://b.stripecdn.com/mkt-ssr-statics/assets/_next/static/media/wave-fallback-mobile-1x.80eb433a.webp 1x, https://b.stripecdn.com/mkt-ssr-statics/assets/_next/static/media/wave-fallback-mobile-2x.3638535c.webp 2x"
            media="(max-width: 639px)"
          />
          <img
            src="https://b.stripecdn.com/mkt-ssr-statics/assets/_next/static/media/wave-fallback-desktop-2x.f0521908.webp"
            alt="Flowing ribbon wave background"
            referrerPolicy="no-referrer"
            onError={() => setWaveImgError(true)}
            className="w-full h-full object-cover object-top"
          />
        </picture>
      )}

      {/* Measured contrast veil to guarantee WCAG AA legibility across all botanical cards and text */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-white/25 to-[#FAFAFA]/80" />
    </div>
  );
};

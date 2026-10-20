import React from 'react';
import { BotanicalClassProfile } from '../data/botanicalData';

interface BotanicalSpecimenGraphicProps {
  specimenId: BotanicalClassProfile['id'];
  className?: string;
  showScaleBar?: boolean;
}

export const BotanicalSpecimenGraphic: React.FC<BotanicalSpecimenGraphicProps> = ({
  specimenId,
  className = 'w-full h-48',
  showScaleBar = true,
}) => {
  return (
    <div
      className={`relative overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center ${className}`}
    >
      {/* Subtle laboratory millimeter calibration grid */}
      <svg
        className="absolute inset-0 w-full h-full opacity-35 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={`grid-${specimenId}`}
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="0.75"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${specimenId})`} />
      </svg>

      {/* Main Botanical Herbarium Vector */}
      {specimenId === 'tulsi' && (
        <svg
          viewBox="0 0 240 180"
          className="relative z-10 w-4/5 h-4/5"
          aria-label="Ocimum tenuiflorum (Tulsi) botanical leaf illustration"
        >
          {/* Petiole & Stem */}
          <path
            d="M120 168 L120 132"
            stroke="#33691E"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Ovate-elliptic leaf blade with finely serrate margin */}
          <path
            d="M120 18 C142 32 162 56 164 88 C165 114 146 132 120 136 C94 132 75 114 76 88 C78 56 98 32 120 18 Z"
            fill="#2E7D32"
            stroke="#1B5E20"
            strokeWidth="2"
          />
          {/* Serrated edge highlights */}
          <path
            d="M120 22 L120 134"
            stroke="#A5D6A7"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Pinnate-reticulate secondary veins */}
          <path
            d="M120 44 Q138 38 148 48 M120 64 Q145 56 156 70 M120 84 Q146 76 158 92 M120 104 Q140 98 149 112"
            fill="none"
            stroke="#81C784"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M120 44 Q102 38 92 48 M120 64 Q95 56 84 70 M120 84 Q94 76 82 92 M120 104 Q100 98 91 112"
            fill="none"
            stroke="#81C784"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )}

      {specimenId === 'neem' && (
        <svg
          viewBox="0 0 240 180"
          className="relative z-10 w-4/5 h-4/5"
          aria-label="Azadirachta indica (Neem) compound pinnate leaf illustration"
        >
          {/* Central Rachis */}
          <path
            d="M120 166 Q120 90 120 20"
            fill="none"
            stroke="#33691E"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Asymmetric falcate-lanceolate leaflets (Left & Right pairs) */}
          <g fill="#1B5E20" stroke="#0D3B10" strokeWidth="1.4">
            {/* Pair 1 (Bottom) */}
            <path d="M120 132 C95 122 68 128 52 142 C72 146 98 144 120 134 Z" />
            <path d="M120 132 C145 122 172 128 188 142 C168 146 142 144 120 134 Z" />
            {/* Pair 2 (Middle) */}
            <path d="M120 96 C92 84 64 90 46 104 C68 110 96 108 120 98 Z" />
            <path d="M120 96 C148 84 176 90 194 104 C172 110 144 108 120 98 Z" />
            {/* Pair 3 (Upper) */}
            <path d="M120 62 C98 52 74 56 58 68 C76 74 100 72 120 64 Z" />
            <path d="M120 62 C142 52 166 56 182 68 C164 74 140 72 120 64 Z" />
            {/* Apical Leaflet */}
            <path d="M120 16 C130 30 132 44 120 54 C108 44 110 30 120 16 Z" />
          </g>
          {/* Midrib veins on leaflets */}
          <path
            d="M118 133 L62 140 M122 133 L178 140 M118 97 L56 102 M122 97 L184 102 M118 63 L68 67 M122 63 L172 67"
            stroke="#A5D6A7"
            strokeWidth="1.2"
          />
        </svg>
      )}

      {specimenId === 'peppermint' && (
        <svg
          viewBox="0 0 240 180"
          className="relative z-10 w-4/5 h-4/5"
          aria-label="Mentha piperita (Peppermint) sharply serrate leaf illustration"
        >
          {/* Square Lamiaceae Stem */}
          <rect x="117" y="134" width="6" height="32" fill="#004D40" rx="1" />
          {/* Lanceolate-ovate leaf with sharp serrations */}
          <path
            d="M120 16 L132 30 L128 34 L144 48 L139 52 L154 68 L148 73 L160 90 L152 95 L158 112 L144 126 L120 136 L96 126 L82 112 L88 95 L80 90 L92 73 L86 68 L101 52 L96 48 L112 34 L108 30 Z"
            fill="#00695C"
            stroke="#004D40"
            strokeWidth="2"
          />
          {/* Prominent arcuate venation */}
          <path
            d="M120 20 L120 134"
            stroke="#B2DFDB"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M120 46 Q135 42 142 50 M120 68 Q140 62 150 72 M120 90 Q142 84 152 94 M120 112 Q136 108 142 116"
            fill="none"
            stroke="#80CBC4"
            strokeWidth="1.5"
          />
          <path
            d="M120 46 Q105 42 98 50 M120 68 Q100 62 90 72 M120 90 Q98 84 88 94 M120 112 Q104 108 98 116"
            fill="none"
            stroke="#80CBC4"
            strokeWidth="1.5"
          />
        </svg>
      )}

      {specimenId === 'weed' && (
        <svg
          viewBox="0 0 240 180"
          className="relative z-10 w-4/5 h-4/5"
          aria-label="Common invasive weed deeply incised runcinate leaf illustration"
        >
          {/* Taproot crown & basal stem */}
          <path d="M120 166 L120 138" stroke="#689F38" strokeWidth="5" />
          {/* Deeply incised runcinate/pinnatifid weed leaf lobes */}
          <path
            d="M120 20 L142 42 L126 52 L162 68 L132 82 L168 102 L130 114 L152 132 L120 140 L88 132 L110 114 L72 102 L108 82 L78 68 L114 52 L98 42 Z"
            fill="#558B2F"
            stroke="#33691E"
            strokeWidth="2"
          />
          {/* Irregular midrib */}
          <path
            d="M120 24 L120 138"
            stroke="#DCE775"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {/* Secondary lobe veins */}
          <path
            d="M120 50 L152 66 M120 80 L158 100 M120 112 L144 128 M120 50 L88 66 M120 80 L82 100 M120 112 L96 128"
            stroke="#C5E1A5"
            strokeWidth="1.4"
          />
        </svg>
      )}

      {specimenId === 'background' && (
        <svg
          viewBox="0 0 240 180"
          className="relative z-10 w-4/5 h-4/5"
          aria-label="Ambient background and non-botanical noise rejection gate"
        >
          <rect
            x="44"
            y="28"
            width="152"
            height="124"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <line x1="44" y1="28" x2="196" y2="152" stroke="#CBD5E1" strokeWidth="1.2" />
          <line x1="196" y1="28" x2="44" y2="152" stroke="#CBD5E1" strokeWidth="1.2" />
          <circle cx="120" cy="90" r="24" fill="#F1F5F9" stroke="#64748B" strokeWidth="1.5" />
          <text
            x="120"
            y="94"
            textAnchor="middle"
            className="font-mono text-[10px] fill-slate-600 font-semibold"
          >
            NULL
          </text>
        </svg>
      )}

      {showScaleBar && (
        <div className="absolute bottom-2 right-2.5 flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
          <span>10 mm</span>
          <span className="inline-block w-6 h-0.5 bg-slate-400" />
        </div>
      )}
    </div>
  );
};

/**
 * Draws a calibrated synthetic specimen frame onto a 224x224 HTMLCanvasElement
 * so the Teachable Machine neural network can run real tensor inference even when
 * testing without a physical leaf in front of the webcam.
 */
export function renderSpecimenToCanvas(
  canvas: HTMLCanvasElement,
  specimenId: BotanicalClassProfile['id']
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  if (specimenId === 'background') {
    // Render neutral desk/skin-tone ambient noise texture
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#E2E8F0');
    grad.addColorStop(0.5, '#CBD5E1');
    grad.addColorStop(1, '#94A3B8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle non-botanical geometric blocks
    ctx.fillStyle = '#D6C7B2';
    ctx.fillRect(w * 0.25, h * 0.3, w * 0.5, h * 0.45);
    return;
  }

  // Subtle laboratory light backdrop
  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(0, 0, w, h);

  const palette: Record<
    Exclude<BotanicalClassProfile['id'], 'background'>,
    { fill: string; stroke: string; vein: string }
  > = {
    tulsi: { fill: '#2E7D32', stroke: '#1B5E20', vein: '#A5D6A7' },
    neem: { fill: '#1B5E20', stroke: '#0D3B10', vein: '#81C784' },
    peppermint: { fill: '#00695C', stroke: '#004D40', vein: '#80CBC4' },
    weed: { fill: '#558B2F', stroke: '#33691E', vein: '#DCE775' },
  };

  const colors = palette[specimenId];

  ctx.save();
  ctx.translate(w / 2, h / 2);

  // Leaf silhouette
  ctx.beginPath();
  if (specimenId === 'tulsi') {
    ctx.ellipse(0, 0, w * 0.26, h * 0.36, 0, 0, Math.PI * 2);
  } else if (specimenId === 'neem') {
    ctx.ellipse(-w * 0.14, -h * 0.08, w * 0.16, h * 0.07, -0.3, 0, Math.PI * 2);
    ctx.ellipse(w * 0.14, -h * 0.08, w * 0.16, h * 0.07, 0.3, 0, Math.PI * 2);
    ctx.ellipse(-w * 0.15, h * 0.1, w * 0.16, h * 0.07, -0.3, 0, Math.PI * 2);
    ctx.ellipse(w * 0.15, h * 0.1, w * 0.16, h * 0.07, 0.3, 0, Math.PI * 2);
    ctx.ellipse(0, -h * 0.26, w * 0.08, h * 0.14, 0, 0, Math.PI * 2);
  } else if (specimenId === 'peppermint') {
    ctx.moveTo(0, -h * 0.38);
    ctx.quadraticCurveTo(w * 0.32, -h * 0.1, w * 0.22, h * 0.28);
    ctx.lineTo(0, h * 0.36);
    ctx.lineTo(-w * 0.22, h * 0.28);
    ctx.quadraticCurveTo(-w * 0.32, -h * 0.1, 0, -h * 0.38);
  } else {
    // Weed jagged lobes
    ctx.moveTo(0, -h * 0.38);
    ctx.lineTo(w * 0.26, -h * 0.18);
    ctx.lineTo(w * 0.1, -h * 0.06);
    ctx.lineTo(w * 0.3, h * 0.12);
    ctx.lineTo(w * 0.12, h * 0.22);
    ctx.lineTo(0, h * 0.36);
    ctx.lineTo(-w * 0.12, h * 0.22);
    ctx.lineTo(-w * 0.3, h * 0.12);
    ctx.lineTo(-w * 0.1, -h * 0.06);
    ctx.lineTo(-w * 0.26, -h * 0.18);
    ctx.closePath();
  }
  ctx.fillStyle = colors.fill;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = colors.stroke;
  ctx.stroke();

  // Midrib vein
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.32);
  ctx.lineTo(0, h * 0.36);
  ctx.strokeStyle = colors.vein;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.restore();
}

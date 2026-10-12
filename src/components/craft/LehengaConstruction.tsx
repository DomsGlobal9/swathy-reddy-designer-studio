import { motion, MotionValue, useTransform } from 'framer-motion';

export interface LehengaStrokeItem {
  id: string;
  d: string;
  range: [number, number];
  tone?: 'ivory' | 'gold' | 'sheer' | 'accent';
  width?: number;
  glow?: boolean;
}

/**
 * Exceptional Haute Couture Lehanga Construction.
 * Proportioned on a 520 x 790 royal croquis canvas.
 * Center axis X = 260.
 * Features:
 * - 16-Kali voluminous umbrella flare with realistic 3D folds
 * - Designer sweet-heart choli with structural princess darts & lace cuffs
 * - Ornate Kamarbandh waistband with chevron zari
 * - Flowing side Latkans with tiered jhumka bells, pearls & silk fringe
 * - Grand double-border with scalloped kangana trims
 * - Ethereal sheer dupatta drape with fluid cross-body cascades & trailing veil
 * - Zardozi buti motifs & shimmering sequin sparkles
 */
export const LEHANGA_STROKES: LehengaStrokeItem[] = [
  // ── PHASE 1: ATELIER FORM & CROQUIS (0.05 - 0.28) ──────────────────────────
  {
    // Haute Couture Head & Sculpted Profile
    id: 'croquis-head',
    d: 'M260 30 C270 30 278 41 278 54 C278 67 270 78 260 78 C250 78 242 67 242 54 C242 41 250 30 260 30 Z',
    range: [0.06, 0.15],
    tone: 'ivory',
    width: 1.6
  },
  {
    // High Fashion Chignon Bun
    id: 'croquis-bun',
    d: 'M251 30 C251 18 269 18 269 30',
    range: [0.09, 0.16],
    tone: 'gold',
    width: 1.5,
    glow: true
  },
  {
    // Bridal Maang Tikka with Suspended Teardrop Pearl
    id: 'croquis-tikka',
    d: 'M260 30 L260 46 M257 47 A3 3 0 1 0 263 47 A3 3 0 1 0 257 47',
    range: [0.12, 0.20],
    tone: 'gold',
    width: 1.6,
    glow: true
  },
  {
    // Swan Neck & Defined Atelier Collarbones
    id: 'croquis-neck',
    d: 'M253 78 C252 88 250 100 248 108 M267 78 C268 88 270 100 272 108 M230 110 C244 113 254 110 260 114 C266 110 276 113 290 110',
    range: [0.15, 0.25],
    tone: 'ivory',
    width: 1.5
  },
  {
    // Left Shoulder & Bent Arm (Hand poised gracefully on hip)
    id: 'croquis-arm-left',
    d: 'M248 108 C234 111 220 114 206 120 C192 144 182 172 180 200 C178 226 192 244 220 250 M220 140 C204 168 195 196 198 220 C200 230 205 238 222 242',
    range: [0.18, 0.30],
    tone: 'ivory',
    width: 1.6
  },
  {
    // Right Shoulder & Relaxed Couture Arm
    id: 'croquis-arm-right',
    d: 'M272 108 C286 111 300 114 314 120 C324 146 331 178 329 210 C327 242 318 274 309 302 M298 140 C309 172 314 204 312 236 C310 258 305 280 301 300',
    range: [0.20, 0.32],
    tone: 'ivory',
    width: 1.6
  },

  // ── PHASE 2: THE DESIGNER CHOLI (BLOUSE) (0.24 - 0.44) ───────────────────────
  {
    // Sweetheart Bridal Neckline
    id: 'choli-neckline',
    d: 'M224 122 C236 139 252 147 260 147 C268 147 284 139 296 122',
    range: [0.24, 0.33],
    tone: 'gold',
    width: 2.0,
    glow: true
  },
  {
    // Tailored Princess Darts & Center Seam
    id: 'choli-darts',
    d: 'M234 139 C241 157 243 179 242 205 M286 139 C279 157 277 179 278 205 M260 147 L260 208',
    range: [0.28, 0.38],
    tone: 'ivory',
    width: 1.4
  },
  {
    // Cropped Choli Hemline & Scalloped Cutwork Lace
    id: 'choli-hemline',
    d: 'M220 204 C240 212 280 212 300 204 M220 208 C240 216 280 216 300 208',
    range: [0.32, 0.40],
    tone: 'gold',
    width: 1.8,
    glow: true
  },
  {
    // Sleeve Cuffs with Fine Embroidered Zari Trims
    id: 'choli-sleeves',
    d: 'M194 158 C200 164 210 162 216 154 M304 154 C310 162 320 164 326 158',
    range: [0.34, 0.42],
    tone: 'gold',
    width: 1.6
  },
  {
    // Bare Midriff Contour & Navel Jewel
    id: 'choli-midriff',
    d: 'M222 206 C220 220 219 233 222 244 M298 206 C300 220 301 233 298 244 M260 229 A1.5 1.5 0 1 0 260 232 A1.5 1.5 0 1 0 260 229',
    range: [0.36, 0.44],
    tone: 'ivory',
    width: 1.4
  },

  // ── PHASE 3: THE GRAND UMBRELLA LEHANGA SKIRT (0.40 - 0.64) ─────────────────
  {
    // Royal Embroidered Waistband (Kamarbandh)
    id: 'lehanga-waistband',
    d: 'M222 244 C242 252 278 252 298 244 M220 259 C241 268 279 268 300 259 M224 251 L230 246 L236 252 L242 246 L248 252 L254 246 L260 252 L266 246 L272 252 L278 246 L284 252 L290 246 L296 252',
    range: [0.40, 0.50],
    tone: 'gold',
    width: 1.8,
    glow: true
  },
  {
    // Left Grand Umbrella Flare (Dramatic couture sweep outward)
    id: 'lehanga-flare-left',
    d: 'M220 259 C202 320 168 395 125 475 C80 560 38 640 18 710',
    range: [0.46, 0.62],
    tone: 'ivory',
    width: 2.4
  },
  {
    // Right Grand Umbrella Flare (Symmetrical dramatic sweep)
    id: 'lehanga-flare-right',
    d: 'M300 259 C318 320 352 395 395 475 C440 560 482 640 502 710',
    range: [0.46, 0.62],
    tone: 'ivory',
    width: 2.4
  },
  {
    // Undulating Couture Bottom Hemline (Graceful curved base on the floor)
    id: 'lehanga-bottom-hem',
    d: 'M18 710 C65 728 125 718 190 728 C250 738 310 738 370 728 C435 718 475 726 502 710',
    range: [0.52, 0.64],
    tone: 'ivory',
    width: 2.2
  },
  {
    // 3D Interior Underside Fabric Folds & Can-can Volume
    id: 'lehanga-hem-folds',
    d: 'M18 710 C36 724 64 728 92 716 M155 726 C182 739 212 739 242 728 M280 728 C310 739 340 739 368 726 M430 716 C458 728 484 722 502 710',
    range: [0.56, 0.67],
    tone: 'gold',
    width: 1.5
  },

  // ── PHASE 4: THE 16-KALI FLOWING RADIATING PANELS (0.60 - 0.78) ─────────────
  {
    // Center Kali (The regal spine of the skirt)
    id: 'kali-center',
    d: 'M260 268 C260 370 260 560 260 736',
    range: [0.60, 0.72],
    tone: 'gold',
    width: 1.7
  },
  {
    // Tier 1 Kalis (Inner central pleats)
    id: 'kalis-tier-1',
    d: 'M246 266 C238 370 224 555 200 732 M274 266 C282 370 296 555 320 732',
    range: [0.62, 0.74],
    tone: 'ivory',
    width: 1.5
  },
  {
    // Tier 2 Kalis (Mid-flared panels)
    id: 'kalis-tier-2',
    d: 'M234 264 C214 370 182 550 142 724 M286 264 C306 370 338 550 378 724',
    range: [0.65, 0.76],
    tone: 'gold',
    width: 1.5
  },
  {
    // Tier 3 Kalis (Outer sweeping panels)
    id: 'kalis-tier-3',
    d: 'M224 261 C194 365 140 540 82 718 M296 261 C326 365 380 540 438 718',
    range: [0.68, 0.78],
    tone: 'ivory',
    width: 1.4
  },
  {
    // Tier 4 Kalis (Deep side billow panels)
    id: 'kalis-tier-4',
    d: 'M221 260 C182 355 108 525 44 712 M299 260 C338 355 412 525 476 712',
    range: [0.70, 0.80],
    tone: 'gold',
    width: 1.3
  },

  // ── PHASE 5: GRAND ZARDOZI HEM BORDER & LATKANS (0.72 - 0.88) ────────────────
  {
    // Broad Upper Zari Hem Border Band
    id: 'border-band-upper',
    d: 'M32 670 C78 688 135 680 198 690 C250 700 300 700 355 690 C410 680 460 688 488 670',
    range: [0.72, 0.82],
    tone: 'gold',
    width: 2.0,
    glow: true
  },
  {
    // Mid Border Guide Band
    id: 'border-band-mid',
    d: 'M25 690 C71 708 128 700 192 710 C248 720 302 720 360 710 C418 700 468 708 495 690',
    range: [0.75, 0.84],
    tone: 'gold',
    width: 1.7
  },
  {
    // Scalloped Kangana Hemline Cutwork Trims
    id: 'border-scallops',
    d: 'M20 710 Q28 718 37 712 Q46 719 55 713 Q64 720 73 714 Q82 721 91 716 Q100 722 109 717 Q118 723 127 718 Q136 724 145 720 Q154 725 163 721 Q172 726 181 722 Q190 727 199 723 Q208 728 217 725 Q226 729 235 726 Q244 730 253 727 Q262 730 271 727 Q280 730 289 726 Q298 729 307 725 Q316 728 325 723 Q334 727 343 722 Q352 726 361 721 Q370 725 379 720 Q388 724 397 718 Q406 723 415 717 Q424 722 433 716 Q442 721 451 714 Q460 720 469 713 Q478 719 487 712 Q495 717 502 710',
    range: [0.77, 0.87],
    tone: 'gold',
    width: 2.0,
    glow: true
  },
  {
    // Royal Border Zari Chevrons
    id: 'border-chevrons',
    d: 'M34 682 L42 672 L50 682 L58 672 L66 682 L74 672 L82 682 L90 672 L98 682 L106 672 L114 682 L122 672 L130 682 L138 672 L146 682 L154 672 L162 682 L170 672 L178 682 L186 672 L194 682 L202 672 L210 682 L218 672 L226 682 L234 672 L242 682 L250 672 L258 682 L266 672 L274 682 L282 672 L290 682 L298 672 L306 682 L314 672 L322 682 L330 672 L338 682 L346 672 L354 682 L362 672 L370 682 L378 672 L386 682 L394 672 L402 682 L410 672 L418 682 L426 672 L434 682 L442 672 L450 682 L458 672 L466 682 L474 672 L482 682',
    range: [0.79, 0.88],
    tone: 'gold',
    width: 1.2
  },
  {
    // Signature Designer Latkans (Hanging from left hip along the flare)
    id: 'latkan-tassels',
    d: 'M218 259 C212 295 214 330 206 370 C201 405 204 445 196 488 M218 259 C215 285 220 315 214 345 C210 375 213 408 208 440 M200 370 C200 360 212 360 212 370 C215 379 197 379 200 370 Z M206 379 L206 388 M202 385 L202 390 M210 385 L210 390 M201 440 C201 428 215 428 215 440 C219 451 197 451 201 440 Z M208 451 L208 465 M203 462 L203 468 M213 462 L213 468 M190 488 C190 473 206 473 206 488 C210 502 186 502 190 488 Z M194 502 L188 530 M198 502 L198 535 M202 502 L208 530',
    range: [0.76, 0.88],
    tone: 'gold',
    width: 1.7,
    glow: true
  },

  // ── PHASE 6: SHEER DUPATTA DRAPE & ZARI MOTIFS (0.82 - 0.98) ─────────────────
  {
    // Cross-Body Sheer Dupatta Cascading across Bust to Left Hip
    id: 'dupatta-diagonal',
    d: 'M302 122 C288 155 254 195 222 235 C206 275 190 335 176 410 C162 500 152 605 146 715',
    range: [0.82, 0.93],
    tone: 'sheer',
    width: 2.0,
    glow: true
  },
  {
    // Secondary Pleated Dupatta Folds & Embroidered Border Lace
    id: 'dupatta-folds',
    d: 'M312 126 C298 165 268 208 232 248 M222 235 C203 277 186 338 172 413 C158 503 148 608 142 718',
    range: [0.84, 0.94],
    tone: 'gold',
    width: 1.4
  },
  {
    // Billowing Sheer Dupatta Cape/Veil Trailing on Right Side
    id: 'dupatta-cape',
    d: 'M318 124 C355 178 388 262 408 365 C424 468 422 580 405 690 C395 745 375 778 356 788 M304 124 C340 176 374 258 394 362 C410 465 408 576 392 686',
    range: [0.85, 0.96],
    tone: 'sheer',
    width: 1.7
  },
  {
    // Hand-embroidered Royal Floral Zari Bootis across Kalidar Skirt
    id: 'zari-bootis',
    d: 'M196 360 C201 365 203 370 196 377 C189 370 191 365 196 360 Z M260 360 C265 365 267 370 260 377 C253 370 255 365 260 360 Z M324 360 C329 365 331 370 324 377 C317 370 319 365 324 360 Z M158 475 C163 481 166 487 158 495 C150 487 153 481 158 475 Z M224 475 C229 481 232 487 224 495 C216 487 219 481 224 475 Z M296 475 C301 481 304 487 296 495 C288 487 291 481 296 475 Z M362 475 C367 481 370 487 362 495 C354 487 357 481 362 475 Z M120 600 C126 607 130 614 120 623 C110 614 114 607 120 600 Z M190 600 C196 607 200 614 190 623 C180 614 184 607 190 600 Z M260 600 C266 607 270 614 260 623 C250 614 254 607 260 600 Z M330 600 C336 607 340 614 330 623 C320 614 324 607 330 600 Z M400 600 C406 607 410 614 400 623 C390 614 394 607 400 600 Z',
    range: [0.88, 0.98],
    tone: 'gold',
    width: 1.5,
    glow: true
  },
  {
    // The Couturier's Needle & Guiding Golden Silk Thread
    id: 'couture-needle-thread',
    d: 'M440 55 L415 90 M438 60 L435 65 M415 90 C385 130 350 85 310 118',
    range: [0.08, 0.97],
    tone: 'gold',
    width: 1.6,
    glow: true
  }
];

export interface LehengaConstructionProps {
  progress: MotionValue<number>;
  reduce: boolean;
}

export function LehengaConstruction({ progress, reduce }: LehengaConstructionProps) {
  const getStrokeColor = (tone?: LehengaStrokeItem['tone']) => {
    switch (tone) {
      case 'gold':
        return 'url(#gold-zari-gradient)';
      case 'sheer':
        return 'url(#sheer-dupatta-gradient)';
      case 'accent':
        return '#E5C158';
      case 'ivory':
      default:
        return '#F4EEE4';
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg
        viewBox="0 0 520 790"
        className="h-[80vh] w-auto max-w-full drop-shadow-[0_8px_32px_rgba(212,175,55,0.25)] select-none"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          {/* Radiant 24k Zari Gold Gradient */}
          <linearGradient id="gold-zari-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9EDB8" />
            <stop offset="35%" stopColor="#D4AF37" />
            <stop offset="70%" stopColor="#C59B27" />
            <stop offset="100%" stopColor="#EEDAA2" />
          </linearGradient>

          {/* Ethereal Sheer Dupatta Gradient */}
          <linearGradient id="sheer-dupatta-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F4EEE4" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#F4EEE4" stopOpacity="0.4" />
          </linearGradient>

          {/* Couture Zari Glow Filter */}
          <filter id="zari-couture-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {LEHANGA_STROKES.map((item) => (
          <LehengaStroke
            key={item.id}
            item={item}
            strokeColor={getStrokeColor(item.tone)}
            progress={progress}
            reduce={reduce}
          />
        ))}

        {/* Ambient sequin sparkle points that shimmer when embroidery nears completion */}
        <LehengaSparkles progress={progress} reduce={reduce} />
      </svg>
    </div>
  );
}

function LehengaStroke({
  item,
  strokeColor,
  progress,
  reduce
}: {
  item: LehengaStrokeItem;
  strokeColor: string;
  progress: MotionValue<number>;
  reduce: boolean;
}) {
  const pathLength = useTransform(progress, item.range, [0, 1]);
  const opacity = useTransform(progress, [item.range[0], item.range[0] + 0.008], [0, 1]);

  return (
    <motion.path
      d={item.d}
      stroke={strokeColor}
      strokeWidth={item.width ?? 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      filter={item.glow ? 'url(#zari-couture-glow)' : undefined}
      style={reduce ? undefined : { pathLength, opacity }}
    />
  );
}

const SPARKLE_POINTS = [
  { cx: 196, cy: 360 },
  { cx: 260, cy: 360 },
  { cx: 324, cy: 360 },
  { cx: 158, cy: 475 },
  { cx: 224, cy: 475 },
  { cx: 296, cy: 475 },
  { cx: 362, cy: 475 },
  { cx: 190, cy: 600 },
  { cx: 260, cy: 600 },
  { cx: 330, cy: 600 },
  { cx: 206, cy: 380 }, // latkan bead
  { cx: 208, cy: 450 }  // latkan lower bead
];

function LehengaSparkles({ progress, reduce }: { progress: MotionValue<number>; reduce: boolean }) {
  const sparkleOpacity = useTransform(progress, [0.86, 0.96], [0, 1]);

  return (
    <motion.g style={reduce ? undefined : { opacity: sparkleOpacity }}>
      {SPARKLE_POINTS.map((pt, i) => (
        <g key={`spark-${i}`}>
          <circle cx={pt.cx} cy={pt.cy} r={2.2} fill="#FFEAA7" filter="url(#zari-couture-glow)" />
          <line
            x1={pt.cx - 4}
            y1={pt.cy}
            x2={pt.cx + 4}
            y2={pt.cy}
            stroke="#FFF2C6"
            strokeWidth={0.8}
          />
          <line
            x1={pt.cx}
            y1={pt.cy - 4}
            x2={pt.cx}
            y2={pt.cy + 4}
            stroke="#FFF2C6"
            strokeWidth={0.8}
          />
        </g>
      ))}
    </motion.g>
  );
}

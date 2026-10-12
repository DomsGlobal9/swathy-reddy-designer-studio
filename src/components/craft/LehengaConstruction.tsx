import { motion, MotionValue, useTransform } from 'framer-motion';

export interface LehengaStrokeItem {
  id: string;
  d: string;
  range: [number, number];
  stroke?: string;
  width?: number;
}

/**
 * Minimalist, elegant haute-couture Lehanga line art.
 * Pure, fluid, poetic strokes proportioned on a 300 x 620 canvas.
 * Designed to construct gracefully while scrolling without visual clutter.
 */
export const LEHANGA_STROKES: LehengaStrokeItem[] = [
  // 1. The Main Couturier Silhouette:
  // Head -> Swan Neck -> Shoulders -> Choli Bodice -> Flared Lehanga Skirt -> Hem -> Back up
  {
    id: 'lehanga-silhouette',
    d: 'M150 50 C159 50 165 59 165 70 C165 81 159 90 150 90 C141 90 135 81 135 70 C135 59 141 50 150 50 M144 90 C144 100 143 107 141 112 C134 114 126 118 120 125 C124 146 126 168 131 188 C130 198 129 208 129 218 C117 285 92 385 68 485 C48 545 38 580 34 595 C78 608 150 610 222 608 C248 604 260 599 266 595 C262 580 252 545 232 485 C208 385 183 285 171 218 C171 208 170 198 169 188 C174 168 176 146 180 125 C174 118 166 114 159 112 C157 107 156 100 156 90',
    range: [0.10, 0.65],
    stroke: '#F4EEE4',
    width: 1.6
  },

  // 2. The Choli (Blouse): Sweetheart neckline & cropped waistline
  {
    id: 'choli-neckline-hem',
    d: 'M133 128 C143 140 157 140 167 128 M131 188 C150 195 169 188',
    range: [0.58, 0.70],
    stroke: '#F4EEE4',
    width: 1.5
  },

  // 3. The Lehanga Waistband (Clean defined belt)
  {
    id: 'lehanga-waistband',
    d: 'M129 218 C150 225 171 218 M128 228 C150 235 172 228',
    range: [0.65, 0.74],
    stroke: '#E2CA7B',
    width: 1.5
  },

  // 4. The Fluid Skirt Kalis (Pleats fanning out gracefully to create the flare)
  {
    id: 'skirt-kalis',
    d: 'M150 228 C150 345 150 475 150 604 M141 226 C132 345 116 475 96 601 M159 226 C168 345 184 475 204 601 M134 224 C116 345 88 475 64 597 M166 224 C184 345 212 475 236 597',
    range: [0.70, 0.84],
    stroke: '#F4EEE4',
    width: 1.3
  },

  // 5. The Royal Hem Border (Clean double-contour at the bottom)
  {
    id: 'hem-border',
    d: 'M38 578 C80 592 150 594 220 592 C245 588 258 583 263 578 M42 566 C82 580 150 582 218 580 C242 576 254 571 259 566',
    range: [0.78, 0.88],
    stroke: '#E2CA7B',
    width: 1.4
  },

  // 6. The Dupatta Drape (A single, sweeping poetic couture curve)
  {
    id: 'dupatta-drape',
    d: 'M120 125 C146 170 172 225 190 285 C204 340 210 405 202 475 C194 450 186 422 178 395',
    range: [0.82, 0.94],
    stroke: '#F4EEE4',
    width: 1.5
  },

  // 7. Delicate Latkan Accent (Single minimal cord and teardrop at hip)
  {
    id: 'latkan-accent',
    d: 'M129 228 C124 265 126 305 122 345 M120 347 A2 2 0 1 0 124 347 A2 2 0 1 0 120 347',
    range: [0.86, 0.95],
    stroke: '#E2CA7B',
    width: 1.3
  }
];

export interface LehengaConstructionProps {
  progress: MotionValue<number>;
  reduce: boolean;
}

export function LehengaConstruction({ progress, reduce }: LehengaConstructionProps) {
  return (
    <div className="relative flex items-center justify-center">
      <svg
        viewBox="0 0 300 620"
        className="h-[78vh] w-auto max-w-full select-none"
        fill="none"
        aria-hidden="true"
      >
        {LEHANGA_STROKES.map((item) => (
          <LehengaStroke
            key={item.id}
            item={item}
            progress={progress}
            reduce={reduce}
          />
        ))}
      </svg>
    </div>
  );
}

function LehengaStroke({
  item,
  progress,
  reduce
}: {
  item: LehengaStrokeItem;
  progress: MotionValue<number>;
  reduce: boolean;
}) {
  const pathLength = useTransform(progress, item.range, [0, 1]);
  const opacity = useTransform(progress, [item.range[0], item.range[0] + 0.005], [0, 1]);

  return (
    <motion.path
      d={item.d}
      stroke={item.stroke || '#F4EEE4'}
      strokeWidth={item.width ?? 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={reduce ? undefined : { pathLength, opacity }}
    />
  );
}

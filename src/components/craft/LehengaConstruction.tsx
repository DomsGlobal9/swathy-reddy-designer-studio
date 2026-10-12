import { motion, MotionValue, useTransform } from 'framer-motion';

export interface LehengaStrokeItem {
  id: string;
  d: string;
  range: [number, number];
  stroke?: string;
  width?: number;
}

/**
 * Haute Couture Bridal Lehanga Sketch.
 * Balanced elegance: rich in authentic bridal craftsmanship,
 * with clean, flowing, organic line-art curves that construct gracefully on scroll.
 * Proportioned on a 320 x 650 canvas. Center X = 160.
 */
export const LEHANGA_STROKES: LehengaStrokeItem[] = [
  // 1. The Main Couturier Silhouette:
  // Head -> Swan Neck -> Shoulders -> Choli Bodice -> Flared Bell Skirt -> Undulating Hem -> Back up
  {
    id: 'silhouette',
    d: 'M160 46 C169 46 176 55 176 66 C176 77 169 86 160 86 C151 86 144 77 144 66 C144 55 151 46 160 46 M154 86 C154 96 153 104 151 108 C144 110 135 115 128 122 C132 144 135 168 139 190 C138 200 137 210 138 220 C125 285 96 385 66 475 C42 540 25 585 15 605 C40 618 75 610 110 618 C140 624 180 624 210 618 C245 610 280 618 305 605 C295 585 278 540 254 475 C224 385 195 285 182 220 C183 210 182 200 181 190 C185 168 188 144 192 122 C185 115 176 110 169 108 C167 104 166 96 166 86',
    range: [0.08, 0.62],
    stroke: '#F4EEE4',
    width: 1.7
  },

  // 2. Bridal Coiffure: Chignon Bun & Delicate Maang Tikka
  {
    id: 'hair-bun-tikka',
    d: 'M153 46 C153 36 167 36 167 46 M160 46 L160 58 M158 59 A2 2 0 1 0 162 59 A2 2 0 1 0 158 59',
    range: [0.12, 0.22],
    stroke: '#E2CA7B',
    width: 1.4
  },

  // 3. Tailored Choli (Blouse): Sweetheart neckline, princess darts & cropped waistline
  {
    id: 'choli-details',
    d: 'M141 126 C151 138 169 138 179 126 M145 137 C149 154 150 172 149 190 M175 137 C171 154 170 172 171 190 M139 190 C160 197 181 190',
    range: [0.24, 0.42],
    stroke: '#F4EEE4',
    width: 1.5
  },

  // 4. Ornate Waistband (Kamarbandh)
  {
    id: 'waistband',
    d: 'M138 220 C160 228 182 220 M137 232 C160 240 183 232',
    range: [0.40, 0.52],
    stroke: '#E2CA7B',
    width: 1.7
  },

  // 5. Flowing Skirt Kalis (7 organic radiating panel pleats with 3D drape)
  {
    id: 'skirt-kalis',
    d: 'M160 236 C160 345 160 480 160 624 M152 235 C145 345 134 480 118 620 M168 235 C175 345 186 480 202 620 M144 233 C130 340 104 475 76 615 M176 233 C190 340 216 475 244 615 M139 232 C118 335 78 470 42 610 M181 232 C202 335 242 470 278 610',
    range: [0.52, 0.74],
    stroke: '#F4EEE4',
    width: 1.3
  },

  // 6. Grand Zari Hem Border Band
  {
    id: 'hem-border-lines',
    d: 'M22 582 C52 595 90 588 130 596 C160 601 190 601 220 596 C255 588 288 595 298 582 M18 594 C48 607 86 600 126 608 C158 613 188 613 218 608 C252 600 285 607 302 594',
    range: [0.70, 0.82],
    stroke: '#E2CA7B',
    width: 1.5
  },

  // 7. Scalloped Kangana Hemline Trim
  {
    id: 'hem-scallops',
    d: 'M16 605 Q25 612 35 607 Q45 613 55 608 Q65 614 75 609 Q85 615 95 610 Q105 616 115 611 Q125 617 135 612 Q145 618 155 613 Q165 618 175 613 Q185 617 195 612 Q205 616 215 611 Q225 615 235 610 Q245 614 255 609 Q265 613 275 608 Q285 612 295 607 Q300 610 304 605',
    range: [0.75, 0.86],
    stroke: '#E2CA7B',
    width: 1.5
  },

  // 8. Signature Bridal Latkan (Hanging from left hip with tiered jhumki bells & silk fringe)
  {
    id: 'latkan',
    d: 'M137 232 C133 268 135 305 130 345 C127 380 131 418 124 455 M126 345 C126 338 134 338 134 345 C136 352 124 352 126 345 Z M130 352 L130 358 M127 356 L127 359 M133 356 L133 359 M120 455 C120 445 132 445 132 455 C135 465 117 465 120 455 Z M122 465 L118 482 M126 465 L126 486 M130 465 L134 482',
    range: [0.72, 0.86],
    stroke: '#E2CA7B',
    width: 1.4
  },

  // 9. Royal Dupatta Drape (Cascading across bust and sweeping along the lehanga)
  {
    id: 'dupatta-front',
    d: 'M178 120 C165 150 148 190 136 226 C122 268 108 325 96 395 C84 475 75 558 72 616',
    range: [0.78, 0.92],
    stroke: '#F4EEE4',
    width: 1.6
  },

  // 10. Secondary Sheer Veil Trailing Behind Right Shoulder
  {
    id: 'dupatta-trailing',
    d: 'M184 122 C206 168 226 245 238 335 C248 425 246 515 234 600',
    range: [0.82, 0.95],
    stroke: 'rgba(244, 238, 228, 0.65)',
    width: 1.4
  },

  // 11. Handcrafted Paisley Butas across Kalis (Gracefully spaced, luxury accents)
  {
    id: 'paisley-butas',
    d: 'M95 435 C98 439 100 443 95 449 C90 443 92 439 95 435 Z M160 435 C163 439 165 443 160 449 C155 443 157 439 160 435 Z M225 435 C228 439 230 443 225 449 C220 443 222 439 225 435 Z M125 535 C128 539 130 543 125 549 C120 543 122 539 125 535 Z M195 535 C198 539 200 543 195 549 C190 543 192 539 195 535 Z',
    range: [0.84, 0.96],
    stroke: '#E2CA7B',
    width: 1.4
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
        viewBox="0 0 320 650"
        className="h-[80vh] w-auto max-w-full select-none drop-shadow-[0_4px_20px_rgba(212,175,55,0.15)]"
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

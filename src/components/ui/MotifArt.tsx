import { motion, MotionValue } from 'framer-motion';
import { motifs } from '../../data/motifs';
import type { MotifName } from '../../types/catalog';

type MotifArtProps = {
  motif: MotifName;
  draw?: MotionValue<number>;
  color?: string;
  strokeWidth?: number;
  className?: string;
};

export function MotifArt({ motif, draw, color = 'currentColor', strokeWidth = 1.1, className = '' }: MotifArtProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" aria-hidden="true" className={`h-full w-full ${className}`}>
      {motifs[motif].map((d) =>
      <motion.path
        key={d}
        d={d}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={draw ? { pathLength: draw } : undefined} />

      )}
    </svg>);

}
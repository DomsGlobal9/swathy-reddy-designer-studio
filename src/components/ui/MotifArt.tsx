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
      {/* Soft ink bleed effect */}
      <g style={{ filter: 'blur(3px)', opacity: 0.4 }}>
        {motifs[motif].map((d) =>
        <motion.path
          key={`blur-${d}`}
          d={d}
          stroke={color}
          strokeWidth={strokeWidth * 2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={draw ? { pathLength: draw } : undefined} />
        )}
      </g>
      {/* Sharp, delicate fine line */}
      <g>
        {motifs[motif].map((d) =>
        <motion.path
          key={`sharp-${d}`}
          d={d}
          stroke={color}
          strokeWidth={strokeWidth * 0.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={draw ? { pathLength: draw } : undefined} />
        )}
      </g>
    </svg>);

}
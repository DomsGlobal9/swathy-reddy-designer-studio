import { useRef } from 'react';
import { motion, MotionValue, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { MotifArt } from './MotifArt';
import type { MotifName } from '../../types/catalog';

const tones = {
  oxblood: '#6B1C22',
  zari: '#A07C3B',
  ink: '#1D1815',
  ivory: '#F4EEE4'
};

type DriftingMotifProps = {
  motif: MotifName;
  /** Position + width, e.g. "left-[4%] top-[10%] w-[240px]" */
  className?: string;
  tone?: keyof typeof tones;
  opacity?: number;
  /** Vertical parallax distance in px — larger feels closer */
  drift?: number;
  /** Horizontal sway in px */
  sway?: number;
  /** Rotation range in degrees */
  spin?: number;
  strokeWidth?: number;
  /** Use a parent's scroll progress (for pinned sections) */
  progress?: MotionValue<number>;
  drawRange?: [number, number];
};

/**
 * A faint hand-drawn motif that sits behind the content,
 * inks itself in as it enters the viewport and drifts at its own depth.
 */
export function DriftingMotif({
  motif,
  className = '',
  tone = 'oxblood',
  opacity = 0.18,
  drift = 80,
  sway = 0,
  spin = 6,
  strokeWidth = 1.1,
  progress,
  drawRange = [0.05, 0.45]
}: DriftingMotifProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: progress ? undefined : ref,
    offset: ['start end', 'end start']
  });
  const p = progress ?? scrollYProgress;
  const y = useTransform(p, [0, 1], [drift, -drift]);
  const x = useTransform(p, [0, 1], [-sway, sway]);
  const rotate = useTransform(p, [0, 1], [-spin, spin]);
  const draw = useTransform(p, drawRange, [0, 1]);

  return (
    <div ref={progress ? undefined : ref} aria-hidden="true" className={`pointer-events-none absolute aspect-square mix-blend-multiply ${className}`} style={{ opacity: opacity * 1.5 }}>
      <motion.div className="h-full w-full" style={reduce ? undefined : { y, x, rotate }}>
        <MotifArt motif={motif} draw={reduce ? undefined : draw} color={tones[tone]} strokeWidth={strokeWidth} />
      </motion.div>
    </div>);

}
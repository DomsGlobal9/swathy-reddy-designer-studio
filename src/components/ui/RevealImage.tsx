import { useRef } from 'react';
import { motion, useMotionTemplate, useReducedMotion, useScroll, useTransform } from 'framer-motion';

type RevealImageProps = {
  src: string;
  alt: string;
  className?: string;
  parallax?: number;
};

export function RevealImage({ src, alt, className = '', parallax = 6 }: RevealImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const inset = useTransform(scrollYProgress, [0.04, 0.38], [100, 0]);
  const clipPath = useMotionTemplate`inset(${inset}% 0% 0% 0%)`;
  const y = useTransform(scrollYProgress, [0, 1], [`-${parallax}%`, `${parallax}%`]);
  const scale = 1 + parallax * 2.4 / 100;

  return (
    <motion.div
      ref={ref}
      style={reduce ? undefined : { clipPath }}
      className={`overflow-hidden bg-paper ${className}`}>
      
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        style={reduce ? undefined : { y, scale }}
        className="h-full w-full object-cover" />
      
    </motion.div>);

}
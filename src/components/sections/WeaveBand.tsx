import { Fragment, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { fabricNames, craftWords } from '../../data/motifs';
import { MotifArt } from '../ui/MotifArt';
import type { MotifName } from '../../types/catalog';

const bandMotifs: MotifName[] = ['paisley', 'jasmine', 'lotus', 'kolam'];

export function WeaveBand() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const forward = useTransform(scrollYProgress, [0, 1], ['0%', '-28%']);
  const backward = useTransform(scrollYProgress, [0, 1], ['-28%', '0%']);
  const row = [...fabricNames, ...fabricNames];
  const small = [...craftWords, ...craftWords, ...craftWords, ...craftWords];

  return (
    <section
      ref={ref}
      aria-label="Fabrics we work with"
      className="relative z-20 overflow-hidden border-y border-line bg-ivory py-10 md:py-14">
      
      <motion.div style={reduce ? undefined : { x: forward }} className="flex w-max items-center gap-8 md:gap-12">
        {row.map((word, i) =>
        <Fragment key={`${word}-${i}`}>
            <span className="whitespace-nowrap font-display text-5xl italic leading-none md:text-[5.5rem]">{word}</span>
            <span className="h-10 w-10 shrink-0 text-oxblood md:h-16 md:w-16">
              <MotifArt motif={bandMotifs[i % bandMotifs.length]} strokeWidth={2.4} />
            </span>
          </Fragment>
        )}
      </motion.div>
      <motion.div
        style={reduce ? undefined : { x: backward }}
        className="mt-6 flex w-max items-center gap-10 md:mt-8"
        aria-hidden="true">
        
        {small.map((word, i) =>
        <span key={`${word}-${i}`} className="flex items-center gap-10 whitespace-nowrap text-[12px] uppercase tracking-[0.3em] text-stone">
            {word}
            <span className="h-1 w-1 rounded-full bg-zari" />
          </span>
        )}
      </motion.div>
    </section>);

}
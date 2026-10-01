import { shopHome } from '../../lib/shop';
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { occasions } from '../../data/story';
import type { Occasion } from '../../types/catalog';
import { ChapterMark } from '../ui/ChapterMark';
import { ArrowLink } from '../ui/ArrowLink';
import { FadeUp } from '../ui/FadeUp';
import { DriftingMotif } from '../ui/DriftingMotif';

export function OccasionSection() {
  return (
    <section id="occasions" className="relative z-20 bg-ivory">
      <DriftingMotif motif="kolam" tone="zari" className="right-[8%] top-16 w-[160px] md:w-[240px]" opacity={0.35} drift={60} spin={30} />
      <div className="relative mx-auto max-w-[1440px] px-5 pb-16 pt-28 md:px-10 md:pb-24 md:pt-40">
        <FadeUp>
          <ChapterMark numeral="vi" label="Shop by occasion" />
          <h2 className="mt-6 font-display text-[2.8rem] leading-[1] tracking-[-0.02em] md:text-7xl">
            Where will <em>you wear it?</em>
          </h2>
        </FadeUp>
      </div>
      <div className="relative">
        {occasions.map((occasion) =>
        <OccasionPanel key={occasion.id} occasion={occasion} />
        )}
      </div>
    </section>);

}

function OccasionPanel({ occasion }: {occasion: Occasion;}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.15, 1]);

  return (
    <div id={occasion.id} ref={ref} className="sticky top-0 h-[100svh] overflow-hidden bg-ink">
      <motion.img
        src={occasion.image}
        alt={`${occasion.name} occasion`}
        loading="lazy"
        style={reduce ? undefined : { scale }}
        className="absolute inset-0 h-full w-full object-cover" />
      
      <div className="absolute inset-0 bg-ink/40" />
      <div className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-end px-5 pb-14 md:px-10 md:pb-20">
        <h3 className="font-display text-[4.2rem] leading-[0.9] tracking-[-0.03em] text-ivory md:text-[9rem]">
          {occasion.name}
        </h3>
        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-sm text-[15px] leading-relaxed text-ivory/85">{occasion.description}</p>
          <ArrowLink tone="ivory" href={shopHome()}>
            Explore {occasion.name}
          </ArrowLink>
        </div>
      </div>
    </div>);

}
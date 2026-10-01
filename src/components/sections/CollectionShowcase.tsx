import { useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  MotionValue,
  useMotionTemplate,
  useMotionValueEvent,
  useScroll,
  useTransform } from
'framer-motion';
import { useShopData } from '../../context/ShopData';
import type { Collection } from '../../types/catalog';
import { ChapterMark } from '../ui/ChapterMark';
import { ArrowLink } from '../ui/ArrowLink';
import { easeOut } from '../../utils/format';
import { DriftingMotif } from '../ui/DriftingMotif';

export function CollectionShowcase() {
  /*
   * Only collections that have a photograph of their OWN here -- a different piece from the one the
   * grid below uses. Fewer than two and the section steps aside rather than repeat a picture.
   * Decided out here, because the body's scroll tracking needs its section to exist.
   */
  const { collections: all, status } = useShopData();
  const collections = all.filter(c => c.showcaseImage);
  if (status !== 'live' || collections.length < 2) return null;
  return <ShowcaseBody collections={collections} />;
}

function ShowcaseBody({ collections }: { collections: Collection[] }) {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const next = Math.min(collections.length - 1, Math.max(0, Math.floor(v * collections.length)));
    setActive((prev) => prev === next ? prev : next);
  });

  const current = collections[Math.min(active, collections.length - 1)];

  return (
    <section ref={ref} aria-label="The collection" className="relative z-20 h-[420vh] bg-ivory">
      <div className="sticky top-0 h-screen overflow-hidden">
        <DriftingMotif motif="lotus" tone="zari" progress={scrollYProgress} drawRange={[0, 0.35]} className="-left-10 bottom-[4%] w-[220px] md:w-[340px]" opacity={0.3} drift={140} spin={10} />
        <DriftingMotif motif="paisley" progress={scrollYProgress} drawRange={[0.4, 0.8]} className="right-[14%] top-[6%] hidden w-[240px] lg:block" opacity={0.14} drift={120} sway={-50} spin={16} />
        <div className="relative mx-auto flex h-full max-w-[1440px] flex-col px-5 pb-8 pt-20 md:px-10 lg:grid lg:grid-cols-12 lg:items-center lg:pb-0 lg:pt-16">
          <div className="lg:col-span-5">
            <ChapterMark numeral="iv" label="The collection" />
            <div className="relative mt-4 h-[4.2rem] w-full overflow-hidden px-4 -mx-4 md:h-[6rem] lg:mt-8 xl:h-[7rem]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.h2
                  key={current.id}
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  exit={{ y: '-100%', opacity: 0 }}
                  transition={{ duration: 0.3, ease: easeOut }}
                  className="absolute inset-0 w-full whitespace-nowrap px-4 font-display text-[3.6rem] leading-none tracking-[-0.03em] md:text-[5rem] xl:text-[6rem]">
                  
                  {current.name}
                </motion.h2>
              </AnimatePresence>
            </div>
            <div className="hidden lg:block">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: easeOut }}>
                  
                  <p className="mt-8 text-[12px] uppercase tracking-[0.26em] text-oxblood">{current.tagline}</p>
                  <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-stone">{current.description}</p>
                </motion.div>
              </AnimatePresence>
              <ArrowLink className="mt-10" href={current.href}>
                Explore {current.name}
              </ArrowLink>
            </div>
          </div>

          <div className="relative mt-6 min-h-0 flex-1 lg:col-span-4 lg:col-start-6 lg:mt-0 lg:h-[76vh] lg:flex-none">
            <div className="relative mx-auto h-full max-h-[76vh] aspect-[3/4] overflow-hidden bg-paper">
              {collections.map((collection, i) =>
              <CollectionLayer
                key={collection.id}
                src={collection.showcaseImage as string}
                alt={`${collection.name} collection`}
                index={i}
                count={collections.length}
                progress={scrollYProgress} />

              )}
            </div>
          </div>

          <div className="mt-6 flex items-end justify-between lg:hidden">
            <p className="text-[12px] uppercase tracking-[0.24em] text-oxblood">{current.tagline}</p>
            <span className="text-[13px] text-stone">
              {active + 1} / {collections.length}
            </span>
          </div>

          <ol className="hidden lg:col-span-2 lg:col-start-11 lg:flex lg:flex-col lg:gap-5">
            {collections.map((collection, i) =>
            <li key={collection.id} className="flex items-center gap-4">
                <span
                className={`h-px bg-oxblood transition-[width] duration-300 ease-out ${i === active ? 'w-8' : 'w-0'}`} />
              
                <span
                className={`font-display text-lg transition-colors duration-200 ${
                i === active ? 'text-ink' : 'text-stone/60'}`
                }>
                
                  {collection.name}
                </span>
              </li>
            )}
          </ol>
        </div>
      </div>
    </section>);

}

function CollectionLayer({
  src,
  alt,
  index,
  count,
  progress
}: {src: string;alt: string;index: number;count: number;progress: MotionValue<number>;}) {
  /* How many collections there are comes from the shop now, so it is passed in, not assumed. */
  const at = index / count;
  const inset = useTransform(progress, index === 0 ? [0, 1] : [at - 0.09, at + 0.01], index === 0 ? [0, 0] : [100, 0]);
  const clipPath = useMotionTemplate`inset(${inset}% 0% 0% 0%)`;
  const scale = useTransform(progress, index === 0 ? [0, 0.25] : [at - 0.09, at + 0.12], [1.12, 1]);
  return (
    <motion.div className="absolute inset-0 overflow-hidden" style={{ clipPath }}>
      <motion.img src={src} alt={alt} loading="lazy" style={{ scale }} className="h-full w-full object-cover" />
    </motion.div>);

}
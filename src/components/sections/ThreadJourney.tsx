import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { threadStages } from '../../data/story';
import { easeOut } from '../../utils/format';
import { DriftingMotif } from '../ui/DriftingMotif';

const railPath =
'M30 0 C30 30 30 45 30 60 C30 100 8 120 14 150 C20 170 30 170 30 180 C30 220 52 240 46 270 C42 290 30 290 30 300 C30 340 8 360 14 390 C20 410 30 410 30 420 C30 460 52 480 46 510 C42 530 30 530 30 540 C30 565 30 585 30 600';

const tilts = [-2.5, 1.8, -1.2, 2.2, -1.6];

export function ThreadJourney() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const pathLength = useTransform(scrollYProgress, [0, 0.9], [0.1, 1]);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const next = Math.min(threadStages.length - 1, Math.max(0, Math.floor(v * threadStages.length)));
    setActive((prev) => prev === next ? prev : next);
  });

  const stage = threadStages[active];

  return (
    <section ref={ref} aria-label="Follow the thread" className="relative z-20 h-[500vh] bg-paper">
      <div className="sticky top-0 h-screen overflow-hidden">
        <DriftingMotif motif="kolam" progress={scrollYProgress} drawRange={[0, 0.3]} className="right-[3%] top-[8%] w-[200px] md:w-[300px]" opacity={0.18} drift={120} spin={40} />
        <DriftingMotif motif="peacock" tone="zari" progress={scrollYProgress} drawRange={[0.3, 0.7]} className="bottom-[-6%] left-[26%] hidden w-[280px] lg:block" opacity={0.3} drift={160} spin={14} />
        <DriftingMotif motif="paisley" progress={scrollYProgress} drawRange={[0.6, 0.95]} className="right-[30%] top-[-4%] hidden w-[220px] lg:block" opacity={0.14} drift={100} sway={60} />
        <div className="relative mx-auto flex h-full max-w-[1440px] flex-col px-5 pb-8 pt-20 md:px-10 lg:grid lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-0 lg:pt-16">
          <div className="lg:col-span-3 lg:h-[72vh]">
            <h2 className="font-display text-4xl leading-[1] tracking-[-0.02em] md:text-5xl">
              Follow
              <br className="hidden lg:block" /> <em>the thread</em>
            </h2>

            <ol className="mt-5 flex gap-4 lg:hidden" aria-hidden="true">
              {threadStages.map((s, i) =>
              <li
                key={s.title}
                className={`text-[13px] transition-colors duration-200 ${i === active ? 'text-oxblood' : 'text-stone/50'}`}>
                
                  0{i + 1}
                </li>
              )}
            </ol>

            <div className="relative mt-10 hidden h-[calc(100%-7rem)] lg:block">
              <svg viewBox="0 0 60 600" preserveAspectRatio="none" className="absolute left-0 top-0 h-full w-[60px]" fill="none" aria-hidden="true">
                <path d={railPath} stroke="#6B1C22" strokeOpacity={0.14} strokeWidth={1.2} />
                <motion.path
                  d={railPath}
                  stroke="#6B1C22"
                  strokeWidth={1.4}
                  strokeLinecap="round"
                  style={reduce ? undefined : { pathLength }} />
                
              </svg>
              <ol>
                {threadStages.map((s, i) =>
                <li
                  key={s.title}
                  className="absolute left-0 flex -translate-y-1/2 items-center"
                  style={{ top: `${10 + i * 20}%` }}>
                  
                    <span
                    className={`ml-[25px] h-[10px] w-[10px] rounded-full border border-oxblood transition-colors duration-200 ${
                    i <= active ? 'bg-oxblood' : 'bg-paper'}`
                    } />
                  
                    <span
                    className={`ml-6 whitespace-nowrap text-[12px] uppercase tracking-[0.22em] transition-colors duration-200 ${
                    i === active ? 'text-ink' : 'text-stone/60'}`
                    }>
                    
                      0{i + 1} — {s.title}
                    </span>
                  </li>
                )}
              </ol>
            </div>
          </div>

          <div className="relative mt-6 min-h-0 flex-1 lg:col-span-5 lg:mt-0 lg:h-[72vh] lg:flex-none">
            <div className="relative mx-auto aspect-[3/4] h-full max-h-[72vh]">
              {threadStages.map((s, i) =>
              <motion.img
                key={s.title}
                src={s.sketch}
                alt={i === active ? `Ink sketch: ${s.title}` : ''}
                aria-hidden={i !== active}
                loading="lazy"
                initial={false}
                animate={{
                  opacity: i === active ? 1 : 0,
                  rotate: tilts[i],
                  scale: i === active ? 1 : 0.97
                }}
                transition={{ duration: 0.3, ease: easeOut }}
                className="absolute inset-0 h-full w-full object-cover shadow-[0_18px_40px_-24px_rgba(29,24,21,0.45)]" />

              )}
            </div>
          </div>

          <div className="mt-6 lg:col-span-4 lg:mt-0">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={stage.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.25, ease: easeOut }}>
                
                <p className="font-display text-5xl italic text-oxblood md:text-7xl lg:text-8xl">0{active + 1}</p>
                <h3 className="mt-2 font-display text-3xl md:text-5xl lg:mt-6">{stage.title}</h3>
                <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-stone lg:mt-6">{stage.description}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>);

}
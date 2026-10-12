import { shopHome } from '../../lib/shop';
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { images } from '../../data/images';
import { ArrowLink } from '../ui/ArrowLink';
import { DriftingMotif } from '../ui/DriftingMotif';
import { easeOut } from '../../utils/format';

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.06, 1]);
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '-20%']);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  const lines = [
  { text: 'The art of', italic: false },
  { text: 'family.', italic: true }];


  return (
    <section id="top" ref={ref} className="relative h-[100svh] min-h-[580px] w-full overflow-hidden bg-paper">
      <motion.div
        style={reduce ? undefined : { y: imageY, scale: imageScale }}
        className="absolute inset-0 origin-top">
        
        <img
          src={images.hero}
          alt="An elegant Indian family celebrating at the temple in festive attire"
          fetchPriority="high"
          className="h-full w-full object-cover object-[32%_top] sm:object-[28%_top] md:object-[26%_top] lg:object-[22%_top]" />
        
        {/* Responsive gradient: bottom-to-top on mobile/tablet portrait, left-to-right on desktop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20 lg:bg-gradient-to-r lg:from-transparent lg:via-black/30 lg:to-black/85" />
      </motion.div>

      <DriftingMotif
        motif="jasmine"
        progress={scrollYProgress}
        drawRange={[0.02, 0.35]}
        className="right-[3%] top-[12%] hidden sm:block w-[160px] md:w-[220px] lg:right-[6%] lg:w-[280px]"
        opacity={0.4}
        drift={-60}
        spin={8}
        strokeWidth={1.3} />
      

      <div className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-end pb-12 sm:pb-16 px-5 pt-20 lg:justify-center lg:px-10 lg:pt-28 lg:pb-16">
        <motion.div
          style={reduce ? undefined : { y: copyY, opacity: copyOpacity }}
          className="flex flex-col items-center text-center lg:ml-auto lg:items-end lg:text-right lg:translate-y-4">
          <h1 className="font-display text-[13vw] sm:text-[10vw] md:text-[8vw] lg:text-[6.5vw] xl:text-[7vw] leading-[0.94] tracking-[-0.03em] text-ivory">
            {lines.map((line, i) => (
              <span key={line.text} className="block overflow-hidden pt-[0.2em] -mt-[0.2em] pb-[0.6em] -mb-[0.6em] px-[0.4em] -mx-[0.4em]">
                <motion.span
                  className={`block ${line.italic ? 'italic' : ''}`}
                  initial={reduce ? false : { y: '120%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.35, ease: easeOut, delay: 0.2 + i * 0.08 }}
                >
                  {line.text}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.div
            className="mt-6 sm:mt-8 flex flex-col items-center gap-5 sm:gap-6 lg:items-end"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut', delay: 0.45 }}>
            
            <p className="max-w-[18rem] text-[14px] sm:text-[15px] leading-relaxed text-ivory/85 lg:text-right">
              Contemporary Indian fashion, chosen by hand in Hyderabad.
            </p>
            <ArrowLink href={shopHome()} tone="ivory" className="text-ivory">Explore collection</ArrowLink>
          </motion.div>
        </motion.div>
      </div>

      <span data-thread-anchor aria-hidden="true" className="absolute bottom-[6%] right-[16%] h-px w-px" />
    </section>);

}
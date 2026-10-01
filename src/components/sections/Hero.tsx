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
    <section id="top" ref={ref} className="relative h-[100svh] min-h-[620px] w-full overflow-hidden bg-paper">
      <motion.div
        style={reduce ? undefined : { y: imageY, scale: imageScale }}
        className="absolute inset-0 origin-top">
        
        <img
          src={images.hero}
          alt="An elegant Indian family dressed in premium traditional attire, standing in a sunlit heritage courtyard"
          fetchPriority="high"
          className="h-full w-full object-cover object-[70%_top] md:object-[center_top]" />
        
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
      </motion.div>

      <DriftingMotif
        motif="jasmine"
        progress={scrollYProgress}
        drawRange={[0.02, 0.35]}
        className="left-[3%] top-[12%] w-[180px] md:left-[6%] md:w-[300px]"
        opacity={0.55}
        drift={-60}
        spin={8}
        strokeWidth={1.3} />
      

      <div className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-center px-5 pt-20 pb-12 md:px-10 md:pt-24 md:pb-16">
        <motion.div style={reduce ? undefined : { y: copyY, opacity: copyOpacity }}>
          <h1 className="font-display text-[16.5vw] leading-[0.94] tracking-[-0.03em] text-ivory md:text-[8.4vw]">
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
            className="mt-8 flex flex-col items-start gap-6"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut', delay: 0.45 }}>
            
            <p className="max-w-[17rem] text-[15px] leading-relaxed text-ivory/80">
              Contemporary Indian fashion, chosen by hand in Hyderabad.
            </p>
            <ArrowLink href={shopHome()} className="text-ivory">Explore collection</ArrowLink>
          </motion.div>
        </motion.div>
      </div>

      <span data-thread-anchor aria-hidden="true" className="absolute bottom-[6%] right-[16%] h-px w-px" />
    </section>);

}
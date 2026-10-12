import { useRef } from 'react';
import { motion, MotionValue, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { fabrics } from '../../data/catalog';
import { ChapterMark } from '../ui/ChapterMark';
import { LehengaConstruction } from '../craft/LehengaConstruction';

export function CraftSection() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.18, 1]);
  const drift = useTransform(scrollYProgress, [0, 1], ['-3%', '3%']);
  const closing = useTransform(scrollYProgress, [0.88, 0.96], [0, 1]);

  return (
    <section ref={ref} aria-label="The craft" className="relative z-20 h-[380vh] bg-ink">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Fabric Background Layers */}
        <motion.div className="absolute inset-0" style={reduce ? undefined : { scale, y: drift }}>
          {fabrics.map((fabric, i) => (
            <FabricLayer key={fabric.name} src={fabric.image} alt={fabric.name} index={i} progress={scrollYProgress} />
          ))}
        </motion.div>
        <div className="absolute inset-0 bg-ink/50" />

        <div className="relative mx-auto grid h-full max-w-[1440px] grid-cols-1 items-center px-5 md:grid-cols-12 md:px-10">
          {/* Left Editorial Info & Fabric Story */}
          <div className="relative z-10 md:col-span-6">
            <ChapterMark numeral="iii" label="The craft" tone="ivory" />
            <h2 className="mt-8 font-display text-[3rem] leading-[0.98] tracking-[-0.02em] text-ivory md:text-[5.2rem]">
              It starts with
              <br />
              <em>the fabric.</em>
            </h2>

            <div className="relative mt-12 h-16">
              {fabrics.map((fabric, i) => (
                <FabricCaption key={fabric.name} name={fabric.name} origin={fabric.origin} index={i} progress={scrollYProgress} />
              ))}
            </div>
          </div>

          {/* Right Haute Couture Lehanga Line Art */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex w-full items-center justify-end opacity-40 md:static md:col-span-5 md:col-start-8 md:h-full md:w-auto md:justify-center md:opacity-100">
            <LehengaConstruction progress={scrollYProgress} reduce={!!reduce} />
          </div>
        </div>

        {/* Closing Couture Quote */}
        <motion.p
          style={{ opacity: closing }}
          className="absolute bottom-10 right-5 font-display text-lg italic text-ivory/90 md:right-10"
        >
          — and the thread becomes a lehenga.
        </motion.p>
      </div>
    </section>
  );
}

type LayerProps = {
  index: number;
  progress: MotionValue<number>;
};

function useSegmentOpacity(index: number, progress: MotionValue<number>) {
  const count = fabrics.length;
  const start = index / count;
  const end = (index + 1) / count;
  const fade = 0.05;
  const input =
    index === 0
      ? [0, end - fade, end + fade]
      : index === count - 1
      ? [start - fade, start + fade, 1]
      : [start - fade, start + fade, end - fade, end + fade];
  const output = index === 0 ? [1, 1, 0] : index === count - 1 ? [0, 1, 1] : [0, 1, 1, 0];
  return useTransform(progress, input, output);
}

function FabricLayer({ src, alt, index, progress }: LayerProps & { src: string; alt: string }) {
  const opacity = useSegmentOpacity(index, progress);
  return (
    <motion.img
      src={src}
      alt={`Close-up of ${alt}`}
      loading="lazy"
      style={{ opacity }}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

function FabricCaption({ name, origin, index, progress }: LayerProps & { name: string; origin: string }) {
  const opacity = useSegmentOpacity(index, progress);
  const y = useTransform(opacity, [0, 1], [10, 0]);
  return (
    <motion.div style={{ opacity, y }} className="absolute left-0 top-0 border-l border-ivory/50 pl-5">
      <p className="font-display text-2xl italic text-ivory">{name}</p>
      <p className="mt-1 text-[13px] text-ivory/75">{origin}</p>
    </motion.div>
  );
}
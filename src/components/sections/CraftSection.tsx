import { useRef } from 'react';
import { motion, MotionValue, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { fabrics } from '../../data/catalog';
import { ChapterMark } from '../ui/ChapterMark';

const sareeStrokes = [
{
  d: 'M150 600 C148 582 138 562 100 548 C132 553 176 553 206 546 C197 470 189 380 181 300 C178 262 186 232 181 200 C177 160 187 126 172 109 C165 103 159 99 157 93 C173 86 173 51 150 50 C127 50 127 86 143 93 C141 99 135 103 128 109 C114 126 123 160 119 200 C115 240 121 270 117 300 C109 380 103 470 100 548',
  range: [0.12, 0.62] as [number, number]
},
{ d: 'M119 206 C140 214 162 214 181 206', range: [0.6, 0.66] as [number, number] },
{
  d: 'M128 109 C150 150 172 196 194 246 C212 292 220 346 214 404 C206 384 198 366 188 344',
  range: [0.64, 0.78] as [number, number]
},
{
  d: 'M140 424 C138 462 136 502 133 546 M152 404 C152 452 152 500 152 549 M164 424 C166 462 168 502 171 546',
  range: [0.76, 0.88] as [number, number]
},
{ d: 'M101 530 C134 536 174 536 205 529', range: [0.86, 0.94] as [number, number] }];


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
        <motion.div className="absolute inset-0" style={reduce ? undefined : { scale, y: drift }}>
          {fabrics.map((fabric, i) =>
          <FabricLayer key={fabric.name} src={fabric.image} alt={fabric.name} index={i} progress={scrollYProgress} />
          )}
        </motion.div>
        <div className="absolute inset-0 bg-ink/50" />

        <div className="relative mx-auto grid h-full max-w-[1440px] grid-cols-1 items-center px-5 md:grid-cols-12 md:px-10">
          <div className="relative z-10 md:col-span-6">
            <ChapterMark numeral="iii" label="The craft" tone="ivory" />
            <h2 className="mt-8 font-display text-[3rem] leading-[0.98] tracking-[-0.02em] text-ivory md:text-[5.2rem]">
              It starts with
              <br />
              <em>the fabric.</em>
            </h2>
            <div className="relative mt-12 h-16">
              {fabrics.map((fabric, i) =>
              <FabricCaption key={fabric.name} name={fabric.name} origin={fabric.origin} index={i} progress={scrollYProgress} />
              )}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex w-full items-center justify-end opacity-40 md:static md:col-span-5 md:col-start-8 md:h-full md:w-auto md:justify-center md:opacity-100">
            <svg viewBox="0 0 300 600" className="h-[78vh] w-auto" fill="none" aria-hidden="true">
              {sareeStrokes.map((stroke) =>
              <SareeStroke key={stroke.d} d={stroke.d} range={stroke.range} progress={scrollYProgress} reduce={!!reduce} />
              )}
            </svg>
          </div>
        </div>

        <motion.p
          style={{ opacity: closing }}
          className="absolute bottom-10 right-5 font-display text-lg italic text-ivory/90 md:right-10">
          
          — and the thread becomes a saree.
        </motion.p>
      </div>
    </section>);

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
  index === 0 ?
  [0, end - fade, end + fade] :
  index === count - 1 ?
  [start - fade, start + fade, 1] :
  [start - fade, start + fade, end - fade, end + fade];
  const output = index === 0 ? [1, 1, 0] : index === count - 1 ? [0, 1, 1] : [0, 1, 1, 0];
  return useTransform(progress, input, output);
}

function FabricLayer({ src, alt, index, progress }: LayerProps & {src: string;alt: string;}) {
  const opacity = useSegmentOpacity(index, progress);
  return (
    <motion.img
      src={src}
      alt={`Close-up of ${alt}`}
      loading="lazy"
      style={{ opacity }}
      className="absolute inset-0 h-full w-full object-cover" />);


}

function FabricCaption({ name, origin, index, progress }: LayerProps & {name: string;origin: string;}) {
  const opacity = useSegmentOpacity(index, progress);
  const y = useTransform(opacity, [0, 1], [10, 0]);
  return (
    <motion.div style={{ opacity, y }} className="absolute left-0 top-0 border-l border-ivory/50 pl-5">
      <p className="font-display text-2xl italic text-ivory">{name}</p>
      <p className="mt-1 text-[13px] text-ivory/75">{origin}</p>
    </motion.div>);

}

function SareeStroke({
  d,
  range,
  progress,
  reduce





}: {d: string;range: [number, number];progress: MotionValue<number>;reduce: boolean;}) {
  const pathLength = useTransform(progress, range, [0, 1]);
  const opacity = useTransform(progress, [range[0], range[0] + 0.005], [0, 1]);
  return (
    <motion.path
      d={d}
      stroke="#F4EEE4"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={reduce ? undefined : { pathLength, opacity }} />);


}
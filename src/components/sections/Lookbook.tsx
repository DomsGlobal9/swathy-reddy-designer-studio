import { lookbook } from '../../data/story';
import { FadeUp } from '../ui/FadeUp';
import { RevealImage } from '../ui/RevealImage';
import { DriftingMotif } from '../ui/DriftingMotif';

export function Lookbook() {
  return (
    <section id="lookbook" className="relative bg-ivory px-5 pb-32 pt-28 md:px-10 md:pb-48 md:pt-44">
      <span data-thread-anchor aria-hidden="true" className="absolute left-[34%] top-10 h-px w-px" />
      <div className="relative mx-auto max-w-[1320px]">
        <DriftingMotif motif="peacock" className="left-[2%] top-[22%] hidden w-[300px] md:block" opacity={0.16} drift={180} spin={12} />
        <DriftingMotif motif="jasmine" tone="zari" className="right-[0%] top-[4%] w-[180px] md:right-[6%] md:w-[260px]" opacity={0.32} drift={120} sway={40} />
        <DriftingMotif motif="lotus" className="bottom-[2%] left-[8%] w-[200px] md:left-[4%] md:w-[280px]" opacity={0.16} drift={90} spin={8} />
        <DriftingMotif motif="needle" tone="zari" className="bottom-[20%] right-[2%] hidden w-[240px] md:block" opacity={0.3} drift={140} sway={-40} />
        <FadeUp className="md:absolute md:left-0 md:top-0 md:w-[36%]">
          <h2 className="font-display text-[3.4rem] leading-[0.95] tracking-[-0.03em] md:text-[6.5rem]">
            Look<em>book</em>
          </h2>
          <p className="mt-4 text-[15px] text-stone">Festive 2026 — photographed across Hyderabad.</p>
        </FadeUp>

        <span data-thread-anchor aria-hidden="true" className="absolute left-[40%] top-[34%] hidden h-px w-px md:block" />
        <span data-thread-anchor aria-hidden="true" className="absolute left-[54%] top-[62%] hidden h-px w-px md:block" />

        <div className="relative mt-14 flex flex-col md:mt-0">
          {lookbook.map((look, i) =>
          <figure key={look.id} className={look.placement}>
              <RevealImage src={look.image} alt={look.alt} className={`relative z-20 ${look.aspect}`} parallax={5} />
              <figcaption className="mt-4 flex gap-4 text-[13px] text-stone">
                <span className="font-display italic text-oxblood">Look 0{i + 1}</span>
                <span>{look.caption}</span>
              </figcaption>
            </figure>
          )}
          <FadeUp className="mt-20 md:ml-[56%] md:-mt-[8%] md:w-[36%]">
            <blockquote className="font-display text-3xl italic leading-[1.15] md:text-5xl">
              “Dressed for no one but herself.”
            </blockquote>
          </FadeUp>
        </div>
      </div>
    </section>);

}
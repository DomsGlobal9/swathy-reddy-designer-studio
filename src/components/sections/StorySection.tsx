import { images } from '../../data/images';
import { ChapterMark } from '../ui/ChapterMark';
import { DriftingMotif } from '../ui/DriftingMotif';
import { FadeUp } from '../ui/FadeUp';
import { RevealImage } from '../ui/RevealImage';

export function StorySection() {
  return (
    <section id="story" className="relative bg-ivory px-5 pb-32 pt-10 md:px-10 md:pb-52 md:pt-20">
      <DriftingMotif motif="peacock" tone="zari" className="right-[2%] top-[2%] w-[200px] md:right-[4%] md:w-[300px]" opacity={0.3} drift={140} spin={12} />
      <DriftingMotif motif="needle" className="bottom-[6%] left-[40%] hidden w-[260px] md:block" opacity={0.2} drift={90} sway={-40} />
      <div className="relative mx-auto grid max-w-[1320px] grid-cols-1 gap-y-14 md:grid-cols-12">
        <div className="md:col-span-6 md:row-span-2">
          <RevealImage
            src={images.boutiqueInterior}
            alt="Inside Swathy Reddy Designer Studio: lime-plaster walls, teak rails and folded silk sarees"
            className="relative z-20 aspect-[4/5]" />
          
        </div>

        <div className="relative md:col-span-5 md:col-start-8 md:pt-24">
          <span data-thread-anchor aria-hidden="true" className="absolute -left-10 top-0 h-px w-px md:-left-16" />
          <FadeUp>
            <ChapterMark numeral="ii" label="Our story" />
          </FadeUp>
          <FadeUp delay={0.05}>
            <h2 className="mt-8 font-display text-[2.6rem] leading-[1.02] tracking-[-0.02em] md:text-6xl">
              More than
              <br />
              <em>a boutique.</em>
            </h2>
          </FadeUp>
          <FadeUp delay={0.1}>
            <p className="mt-8 max-w-md text-[15px] leading-relaxed text-stone">
              Swathy Reddy Designer Studio brings together Indian craftsmanship, contemporary silhouettes and thoughtfully
              selected pieces for women who want fashion to feel personal.
            </p>
          </FadeUp>
        </div>

        <figure className="relative md:col-span-4 md:col-start-8 md:mt-10">
          <RevealImage
            src={images.founder}
            alt="Swathi Reddy in her atelier, examining a length of gold zari silk"
            className="relative z-20 aspect-[3/4]"
            parallax={4} />
          
          <figcaption className="mt-6 border-l border-oxblood pl-5">
            <p className="font-display text-xl italic leading-snug md:text-2xl">
              “I wanted a place where a woman could touch the cloth before she chose it.”
            </p>
            <p className="mt-3 text-[13px] text-stone">Swathy Reddy, founder</p>
          </figcaption>
          <span data-thread-anchor aria-hidden="true" className="absolute -right-4 bottom-0 h-px w-px md:-right-24" />
        </figure>
      </div>
    </section>);

}
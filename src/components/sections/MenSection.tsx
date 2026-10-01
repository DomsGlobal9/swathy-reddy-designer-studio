import { images } from '../../data/images';
import { ChapterMark } from '../ui/ChapterMark';
import { DriftingMotif } from '../ui/DriftingMotif';
import { FadeUp } from '../ui/FadeUp';
import { RevealImage } from '../ui/RevealImage';

export function MenSection() {
  return (
    <section id="men" className="relative bg-ivory px-5 pb-24 pt-28 md:px-10 md:pb-40 md:pt-44">
      <span data-thread-anchor aria-hidden="true" className="absolute left-[40%] top-10 h-px w-px" />
      <DriftingMotif motif="paisley" className="-right-10 top-[6%] w-[220px] md:right-[2%] md:w-[340px]" opacity={0.14} drift={-120} spin={-10} />
      <div className="relative mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-y-16 md:grid-cols-12">
        <figure className="relative md:col-span-5 md:col-start-2 order-last md:order-first">
          <span data-thread-anchor aria-hidden="true" className="absolute -left-12 top-[18%] h-px w-px" />
          <RevealImage
            src={images.menPortrait}
            alt="Portrait of a man in traditional attire"
            className="relative z-20 aspect-[3/4]" />
          
          <figcaption className="mt-4 flex justify-between text-[13px] text-stone">
            <span className="font-display italic">Classic Kurta, refined edges</span>
            <span>The Menswear Edit</span>
          </figcaption>
          <span data-thread-anchor aria-hidden="true" className="absolute -right-6 bottom-[22%] h-px w-px md:-right-14" />
        </figure>

        <div className="md:col-span-5 md:col-start-8">
          <FadeUp>
            <ChapterMark numeral="ii" label="The man" />
          </FadeUp>
          <FadeUp delay={0.05}>
            <h2 className="mt-8 font-display text-[2.9rem] leading-[1] tracking-[-0.02em] md:text-[4.6rem]">
              For the man
              <br />
              who honors
              <br />
              <em>his legacy.</em>
            </h2>
          </FadeUp>
          <FadeUp delay={0.1}>
            <p className="mt-10 max-w-sm text-[15px] leading-relaxed text-stone">
              He appreciates the fine details. He dresses for the moments that matter, bringing understated elegance to every occasion.
            </p>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

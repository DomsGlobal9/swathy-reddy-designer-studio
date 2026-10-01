import { images } from '../../data/images';
import { ChapterMark } from '../ui/ChapterMark';
import { DriftingMotif } from '../ui/DriftingMotif';
import { FadeUp } from '../ui/FadeUp';
import { RevealImage } from '../ui/RevealImage';

export function WomanSection() {
  return (
    <section id="about" className="relative bg-ivory px-5 pb-24 pt-28 md:px-10 md:pb-40 md:pt-44">
      <span data-thread-anchor aria-hidden="true" className="absolute left-[60%] top-10 h-px w-px" />
      <DriftingMotif motif="paisley" className="-left-10 top-[6%] w-[220px] md:left-[2%] md:w-[340px]" opacity={0.14} drift={120} spin={10} />
      <DriftingMotif motif="lotus" tone="zari" className="bottom-[4%] right-[38%] hidden w-[220px] md:block" opacity={0.28} drift={60} sway={30} />
      <div className="relative mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-y-16 md:grid-cols-12">
        <div className="md:col-span-6">
          <FadeUp>
            <ChapterMark numeral="i" label="The woman" />
          </FadeUp>
          <FadeUp delay={0.05}>
            <h2 className="mt-8 font-display text-[2.9rem] leading-[1] tracking-[-0.02em] md:text-[4.6rem]">
              For the woman
              <br />
              who wears
              <br />
              <em>her own story.</em>
            </h2>
          </FadeUp>
          <FadeUp delay={0.1}>
            <p className="mt-10 max-w-sm text-[15px] leading-relaxed text-stone">
              She doesn't dress for the room. She dresses for the memory — the wedding she'll talk about for years, the
              ordinary Tuesday that deserved silk.
            </p>
          </FadeUp>
        </div>

        <figure className="relative md:col-span-5 md:col-start-8">
          <span data-thread-anchor aria-hidden="true" className="absolute -left-12 top-[18%] h-px w-px" />
          <RevealImage
            src={images.portrait}
            alt="Portrait of a woman in an ivory chanderi saree with a fine gold border"
            className="relative z-20 aspect-[3/4]" />
          
          <figcaption className="mt-4 flex justify-between text-[13px] text-stone">
            <span className="font-display italic">Ivory chanderi, zari edge</span>
            <span>The Signature Edit</span>
          </figcaption>
          <span data-thread-anchor aria-hidden="true" className="absolute -right-6 bottom-[22%] h-px w-px md:-right-14" />
        </figure>
      </div>
    </section>);

}
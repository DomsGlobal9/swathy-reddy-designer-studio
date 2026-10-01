import { shopHome } from '../../lib/shop';
import { images } from '../../data/images';
import { ArrowLink } from '../ui/ArrowLink';
import { FadeUp } from '../ui/FadeUp';
import { DriftingMotif } from '../ui/DriftingMotif';

export function FinalStatement() {
  return (
    <section className="relative bg-ivory px-5 pb-32 pt-24 text-center md:px-10 md:pb-44 md:pt-32">
      <DriftingMotif motif="paisley" className="left-[-6%] top-[14%] w-[220px] md:left-[6%] md:w-[340px]" opacity={0.16} drift={100} spin={-12} />
      <DriftingMotif motif="peacock" tone="zari" className="right-[-6%] top-[26%] w-[200px] md:right-[8%] md:w-[320px]" opacity={0.32} drift={140} spin={10} />
      <DriftingMotif motif="kolam" className="bottom-[6%] left-[30%] hidden w-[160px] md:block" opacity={0.18} drift={50} spin={30} />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center">
        <div className="relative w-36 md:w-48">
          <span data-thread-anchor aria-hidden="true" className="absolute left-1/2 top-[18%] h-px w-px" />
          <img
            src={images.sketchHer}
            alt="Ink sketch of a woman walking in a saree"
            loading="lazy"
            className="relative z-20 aspect-[3/4] w-full object-cover mix-blend-multiply" />
          
        </div>
        <FadeUp className="mt-14">
          <h2 className="font-display text-[3.4rem] leading-[0.95] tracking-[-0.03em] md:text-[7rem]">
            Dress like <em>yourself.</em>
          </h2>
          <p className="mx-auto mt-8 max-w-md text-[15px] leading-relaxed text-stone">
            Discover pieces that become part of your story.
          </p>
          <ArrowLink className="mt-10" href={shopHome()}>
            Explore the collection
          </ArrowLink>
        </FadeUp>
      </div>
    </section>);

}
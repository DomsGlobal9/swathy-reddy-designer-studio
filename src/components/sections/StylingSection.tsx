import { images } from '../../data/images';
import { ChapterMark } from '../ui/ChapterMark';
import { FadeUp } from '../ui/FadeUp';
import { RevealImage } from '../ui/RevealImage';
import { DriftingMotif } from '../ui/DriftingMotif';
import { ArrowRightIcon } from 'lucide-react';

type StylingSectionProps = {
  onBook: () => void;
};

export function StylingSection({ onBook }: StylingSectionProps) {
  return (
    <section id="styling" className="relative bg-ivory px-5 py-28 md:px-10 md:py-44">
      <span data-thread-anchor aria-hidden="true" className="absolute left-[52%] top-12 h-px w-px" />
      <DriftingMotif motif="needle" className="right-[4%] top-[8%] w-[200px] md:w-[300px]" opacity={0.2} drift={110} spin={10} />
      <DriftingMotif motif="lotus" tone="zari" className="bottom-[6%] right-[26%] hidden w-[220px] md:block" opacity={0.3} drift={70} sway={40} />
      <div className="relative mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-y-14 md:grid-cols-12">
        <div className="md:col-span-6">
          <RevealImage
            src={images.stylist}
            alt="A stylist adjusting the pleats of a sage green silk saree on a client in the boutique"
            className="relative z-20 aspect-[4/5]" />
          
        </div>
        <div className="relative md:col-span-5 md:col-start-8">
          <FadeUp>
            <ChapterMark numeral="viii" label="Personal styling" />
          </FadeUp>
          <FadeUp delay={0.05}>
            <h2 className="mt-8 font-display text-[2.8rem] leading-[1] tracking-[-0.02em] md:text-6xl">
              Let us find
              <br />
              <em>your look.</em>
            </h2>
          </FadeUp>
          <FadeUp delay={0.1}>
            <p className="mt-8 max-w-md text-[15px] leading-relaxed text-stone">
              One-to-one styling for your next occasion — a wedding, a festival, or a day you simply want to feel like
              yourself. Ninety minutes in the boutique or on a video call, complimentary with bridal orders.
            </p>
            <button
              type="button"
              onClick={onBook}
              className="group mt-10 inline-flex items-center gap-4 whitespace-nowrap bg-ink px-7 py-4 text-[12px] font-medium uppercase tracking-[0.22em] text-ivory transition-colors duration-200 hover:bg-oxblood focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 active:scale-[0.98]">
              
              Book an appointment
              <ArrowRightIcon
                className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-1"
                strokeWidth={1.25} />
              
            </button>
          </FadeUp>
          <span data-thread-anchor aria-hidden="true" className="absolute -bottom-16 left-[20%] h-px w-px" />
        </div>
      </div>
    </section>);

}
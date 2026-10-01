import { images } from '../../data/images';
import { ChapterMark } from '../ui/ChapterMark';
import { ArrowLink } from '../ui/ArrowLink';

export function BoutiqueSection() {
  return (
    <section id="boutique" className="relative z-20 h-[100svh] min-h-[640px] overflow-hidden bg-ink">
      <img
        src={images.boutiqueStorefront}
        alt="Swathy Reddy Designer Studio at golden hour: arched windows, teak display tables and silk sarees"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover motion-safe:animate-kenburns" />
      
      <div className="absolute inset-0 bg-ink/45" />
      <div className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-end px-5 pb-14 md:px-10 md:pb-20">
        <ChapterMark numeral="vii" label="The boutique" tone="ivory" />
        <h2 className="mt-6 font-display text-[3rem] leading-[0.95] tracking-[-0.03em] text-ivory md:text-[7rem]">
          Come into
          <br />
          <em>our world.</em>
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-8 border-t border-ivory/30 pt-8 text-ivory sm:grid-cols-3">
          <div>
            <p className="font-display text-xl">Swathy Reddy Designer Studio</p>
            <p className="mt-2 text-[14px] leading-relaxed text-ivory/80">
              Road No. 36, Jubilee Hills
              <br />
              Hyderabad, Telangana 500033
            </p>
          </div>
          <div>
            <p className="text-[12px] uppercase tracking-[0.22em] text-ivory/70">Open</p>
            <p className="mt-2 text-[14px] leading-relaxed text-ivory/90">
              Tuesday – Sunday, 11am – 8pm
              <br />
              Closed Mondays
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 sm:items-end sm:justify-end">
            <ArrowLink tone="ivory" href="https://maps.google.com/?q=Jubilee+Hills+Hyderabad" external>
              Visit the boutique
            </ArrowLink>
            <a href="tel:+914000000000" className="text-[14px] text-ivory/80 underline-offset-4 hover:underline">
              +91 40 0000 0000
            </a>
            <a href="mailto:label.swathyreddy12@gmail.com" className="text-[14px] text-ivory/80 underline-offset-4 hover:underline">
              label.swathyreddy12@gmail.com
            </a>
          </div>
        </div>
      </div>
    </section>);

}
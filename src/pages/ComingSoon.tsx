import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeftIcon, ArrowUpRightIcon } from 'lucide-react';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import { BookingDialog } from '../components/BookingDialog';
import { ChapterMark } from '../components/ui/ChapterMark';
import { images } from '../data/images';
import { phoneDigits } from '../data/contact';
import { shopHome } from '../lib/shop';
import { easeOut } from '../utils/format';

const COLLECTIONS = {
  men: {
    label: "The men's edit",
    image: images.menPortrait,
    alt: 'Man in a tailored sherwani',
    line: "We are cutting, draping and finishing the first pieces of our men's collection: sherwanis, kurtas and festive jackets made with the same care as everything in the atelier.",
    whatsapp: "Hello! Please let me know when the men's collection launches."
  },
  kids: {
    label: "The kids' edit",
    image: images.kidsPortrait,
    alt: 'Child in festive wear',
    line: "Little lehengas, kurtas and festive sets are on the cutting table now, in soft fabrics made for twirling, running and every first celebration.",
    whatsapp: "Hello! Please let me know when the kids' collection launches."
  }
} as const;

export type ComingSoonCollection = keyof typeof COLLECTIONS;

export function ComingSoon({ collection }: { collection: ComingSoonCollection }) {
  const c = COLLECTIONS[collection];
  const reduce = useReducedMotion();
  useSmoothScroll(!reduce);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    document.title = `${c.label}: coming soon · Swathy Reddy Designer Studio`;
  }, [c.label]);

  const rise = (delay: number) => (reduce ? {} : {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: easeOut, delay }
  });

  return (
    <div className="min-h-screen w-full bg-ivory font-sans text-ink">
      <SiteHeader onBook={() => setBookingOpen(true)} />
      <main className="relative overflow-x-clip">
        <section className="relative flex min-h-[100svh] items-end overflow-hidden bg-ink">
          <img src={c.image} alt={c.alt} className="absolute inset-0 h-full w-full object-cover object-top motion-safe:animate-kenburns" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/20" />
          <div className="relative mx-auto w-full max-w-[1440px] px-5 pb-16 pt-32 md:px-10 md:pb-24">
            <motion.div {...rise(0)}>
              <ChapterMark label={c.label} tone="ivory" />
            </motion.div>
            <motion.h1 {...rise(0.08)} className="mt-5 font-display text-[4rem] leading-[0.9] tracking-[-0.03em] text-ivory sm:text-[6rem] md:text-[9rem]">
              Coming
              <br />
              <em className="text-[#F9DE84]">soon.</em>
            </motion.h1>
            <motion.p {...rise(0.16)} className="mt-8 max-w-lg text-[15px] leading-relaxed text-ivory/80 md:text-[16px]">
              {c.line}
            </motion.p>
            <motion.div {...rise(0.24)} className="mt-10 flex flex-wrap items-center gap-3">
              <a
                href={`https://wa.me/${phoneDigits}?text=${encodeURIComponent(c.whatsapp)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-ivory px-7 py-3.5 text-[14px] font-medium text-ink transition-colors duration-200 hover:bg-[#F9DE84] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory">
                Notify me on WhatsApp
                <ArrowUpRightIcon className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={shopHome()}
                className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[14px] font-medium text-ivory shadow-[inset_0_0_0_1px_rgba(244,238,228,0.35)] transition-colors duration-200 hover:bg-ivory/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory">
                Shop the women's collection
                <ArrowUpRightIcon className="h-4 w-4" aria-hidden="true" />
              </a>
            </motion.div>
            <motion.a {...rise(0.3)} href="/" className="mt-10 inline-flex items-center gap-2 text-[13px] text-ivory/70 transition-colors hover:text-ivory">
              <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
              Back to the home page
            </motion.a>
          </div>
        </section>
      </main>
      <SiteFooter />
      <BookingDialog open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  );
}

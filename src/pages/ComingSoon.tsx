import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeftIcon, ArrowUpRightIcon } from 'lucide-react';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import { BookingDialog } from '../components/BookingDialog';
import { ChapterMark } from '../components/ui/ChapterMark';
import { phoneDigits } from '../data/contact';
import { shopHome } from '../lib/shop';
import { easeOut } from '../utils/format';

const COLLECTIONS = {
  men: {
    label: 'The Heritage Collection',
    image: '/men_coming_soon.jpg',
    alt: 'Swathy Reddy Heritage Collection: a man in a black kurta set in a carved heritage interior',
    position: 'object-center',
    line: 'Ethnic wear for every story. Our first menswear, handcrafted kurta sets cut and finished in the atelier, arrives soon.',
    whatsapp: "Hello! Please let me know when the men's collection launches."
  },
  kids: {
    label: 'The Heritage Collection · Kids',
    image: '/kids_coming_soon.jpg',
    alt: 'Swathy Reddy Heritage Collection: a boy in a green kurta with a printed jacket and a girl in a floral lehenga',
    position: 'object-center',
    line: 'Little kurta sets and floral lehengas for every first celebration, handcrafted in the atelier, arrive soon.',
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
    document.title = `The Heritage Collection for ${collection === 'men' ? 'Men' : 'Kids'}, Coming Soon | Swathy Reddy`; // same as scripts/seo-pages.mjs
  }, [collection]);

  const rise = (delay: number) => (reduce ? {} : {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: easeOut, delay }
  });

  return (
    <div className="min-h-screen w-full bg-ivory font-sans text-ink">
      <SiteHeader onBook={() => setBookingOpen(true)} />
      <main className="relative overflow-x-clip">
        <section className="relative overflow-hidden bg-ink">
          {/* Warm lamplight behind the framed photo. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_60%_at_75%_55%,rgba(201,164,92,0.20),transparent_70%)]" />
          <div className="relative mx-auto grid min-h-[100svh] w-full max-w-[1440px] items-center gap-12 px-5 pb-16 pt-28 md:grid-cols-12 md:gap-10 md:px-10 md:pb-20 md:pt-32">
            <div className="md:col-span-6">
            <motion.div {...rise(0)}>
              <ChapterMark label={c.label} tone="ivory" />
            </motion.div>
            <motion.h1 {...rise(0.08)} className="mt-5 font-display text-[4rem] leading-[0.9] tracking-[-0.03em] text-ivory sm:text-[6rem] md:text-[7rem] xl:text-[8.5rem]">
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
            {/* The photo framed whole, never cropped: the men's poster carries its own lettering. */}
            <motion.figure
              initial={reduce ? false : { opacity: 0, scale: 0.96, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, ease: easeOut, delay: 0.15 }}
              className="md:col-span-6 md:col-start-7">
              <div className="mx-auto aspect-[4/5] w-full max-w-[34rem] overflow-hidden rounded-sm shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] md:max-h-[78svh] md:w-auto">
                <img src={c.image} alt={c.alt} className={`h-full w-full object-cover ${c.position}`} />
              </div>
            </motion.figure>
          </div>
        </section>
      </main>
      <SiteFooter />
      <BookingDialog open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  );
}

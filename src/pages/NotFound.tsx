import { useEffect, useState } from 'react';
import { ArrowUpRightIcon } from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import { BookingDialog } from '../components/BookingDialog';
import { ChapterMark } from '../components/ui/ChapterMark';

/** Any address that isn't a page. Marked noindex so search engines don't list it as a copy of home. */
export function NotFound() {
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    document.title = 'Page not found | Swathy Reddy Designer Studio';
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex';
    document.head.appendChild(robots);
    return () => robots.remove();
  }, []);

  return (
    <div className="min-h-screen w-full bg-ivory font-sans text-ink">
      <SiteHeader onBook={() => setBookingOpen(true)} />
      <main className="relative flex min-h-[80svh] items-center overflow-x-clip bg-ink px-5 pb-20 pt-32 text-ivory md:px-10">
        <div className="mx-auto w-full max-w-[1440px]">
          <ChapterMark label="Page not found" tone="ivory" />
          <h1 className="mt-5 font-display text-[3.4rem] leading-[0.95] tracking-[-0.03em] md:text-[6.5rem]">
            This page has
            <br />
            <em className="text-[#F9DE84]">slipped away.</em>
          </h1>
          <p className="mt-8 max-w-md text-[15px] leading-relaxed text-ivory/75">
            The address may have a typo, or the page may have moved. Everything else is right where you left it.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href="/" className="inline-flex items-center gap-2 rounded-full bg-ivory px-7 py-3.5 text-[14px] font-medium text-ink transition-colors hover:bg-[#F9DE84]">
              Go to the home page
              <ArrowUpRightIcon className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href="/contact" className="inline-flex items-center rounded-full px-7 py-3.5 text-[14px] font-medium text-ivory shadow-[inset_0_0_0_1px_rgba(244,238,228,0.35)] transition-colors hover:bg-ivory/10">
              Contact us
            </a>
            <button type="button" onClick={() => setBookingOpen(true)} className="inline-flex items-center rounded-full px-7 py-3.5 text-[14px] font-medium text-ivory shadow-[inset_0_0_0_1px_rgba(244,238,228,0.35)] transition-colors hover:bg-ivory/10">
              Book a consultation
            </button>
          </div>
        </div>
      </main>
      <SiteFooter />
      <BookingDialog open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  );
}

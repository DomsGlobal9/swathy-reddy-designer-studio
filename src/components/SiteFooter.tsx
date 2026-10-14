import { navigation } from '../data/story';
import { scrollToId } from '../hooks/useSmoothScroll';
import { contact } from '../data/contact';
import { Instagram, Facebook, ArrowUpRightIcon } from 'lucide-react';
import { images } from '../data/images';
import { shopHome } from '../lib/shop';
import { FadeUp } from './ui/FadeUp';
import { DriftingMotif } from './ui/DriftingMotif';

function WhatsAppIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

/** `finale` opens the footer with the closing "Dress like yourself." band; off where a page ends with its own. */
export function SiteFooter({ finale = true }: { finale?: boolean }) {
  const links = navigation;

  return (
    <footer className="relative z-20 overflow-hidden bg-ink px-5 pb-10 pt-20 text-ivory md:px-10 md:pt-28">
      {finale && (
        <DriftingMotif motif="peacock" tone="zari" className="right-[-8%] top-[2%] w-[220px] md:right-[3%] md:w-[340px]" opacity={0.22} drift={90} spin={10} />
      )}
      <div className="relative mx-auto max-w-[1440px]">
        {finale && (
          <FadeUp className="mb-20 grid items-end gap-10 md:mb-28 md:grid-cols-12">
            <div className="flex items-end gap-5 md:col-span-8 md:gap-8">
              {/* Arched like the atelier's windows. */}
              <div className="w-24 shrink-0 overflow-hidden rounded-t-full bg-ivory p-2 pb-0 sm:w-28 md:w-40">
                <img
                  src={images.sketchHer}
                  alt="Ink sketch of a woman walking in a saree"
                  loading="lazy"
                  className="aspect-[3/4] w-full rounded-t-full object-cover mix-blend-multiply" />
              </div>
              <h2 className="font-display text-[2.7rem] leading-[0.92] tracking-[-0.03em] sm:text-[3.6rem] md:text-[6.2rem]">
                Dress like
                <br />
                <em className="text-[#F9DE84]">yourself.</em>
              </h2>
            </div>
            <div className="md:col-span-4 md:pb-3">
              <p className="max-w-xs text-[15px] leading-relaxed text-ivory/70">
                Discover pieces that become part of your story.
              </p>
              <a
                href={shopHome()}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-ivory px-6 py-3 text-[14px] font-medium text-ink transition-colors duration-200 hover:bg-[#F9DE84] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory">
                Explore the collection
                <ArrowUpRightIcon className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </FadeUp>
        )}
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/logo.png"
              alt="Swathy Reddy"
              className="h-16 w-auto object-contain md:h-24"
            />
            <p className="font-display text-2xl uppercase tracking-[0.16em] text-ivory/90 sm:text-3xl">
              Swathy Reddy
            </p>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-10 border-t border-ivory/20 pt-10 md:grid-cols-4">
          <nav aria-label="Footer" className="flex flex-col gap-3">
            <span className="text-[12px] uppercase tracking-[0.2em] text-ivory/60">Story</span>
            {links.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => scrollToId(link.target)}
                className="self-start text-[14px] text-ivory/80 transition-colors duration-200 hover:text-ivory"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex flex-col gap-3">
            <span className="text-[12px] uppercase tracking-[0.2em] text-ivory/60">Follow & Connect</span>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/25 text-ivory/80 transition-colors duration-200 hover:border-ivory hover:bg-ivory/10 hover:text-ivory"
              >
                <Instagram className="h-4 w-4" strokeWidth={1.5} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/25 text-ivory/80 transition-colors duration-200 hover:border-ivory hover:bg-ivory/10 hover:text-ivory"
              >
                <Facebook className="h-4 w-4" strokeWidth={1.5} />
              </a>
              <a
                href="https://wa.me/?text=Hello%20Swathy%20Reddy%20Designer%20Studio"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/25 text-ivory/80 transition-colors duration-200 hover:border-ivory hover:bg-ivory/10 hover:text-ivory"
              >
                <WhatsAppIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[12px] uppercase tracking-[0.2em] text-ivory/60">Atelier</span>
            <p className="text-[14px] leading-relaxed text-ivory/80">
              {contact.street}
              <br />
              Hyderabad, India
            </p>
            <a
              href={`mailto:${contact.email}`}
              className="mt-1 text-[13px] text-ivory/70 transition-colors hover:text-ivory hover:underline"
            >
              {contact.email}
            </a>
          </div>

          <div className="flex flex-col justify-end md:text-right">
            <p className="text-[14px] text-ivory/60">© 2026 Swathy Reddy Designer Studio</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
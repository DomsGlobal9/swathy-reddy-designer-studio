import { navigation } from '../data/story';
import { scrollToId } from '../hooks/useSmoothScroll';
import { Instagram, Facebook } from 'lucide-react';

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

export function SiteFooter() {
  const links = [...navigation, { label: 'Contact', target: 'boutique' }];

  return (
    <footer className="relative z-20 bg-ink px-5 pb-10 pt-20 text-ivory md:px-10 md:pt-28">
      <div className="mx-auto max-w-[1440px]">
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
              Road No. 36, Jubilee Hills
              <br />
              Hyderabad, India
            </p>
            <a
              href="mailto:label.swathyreddy12@gmail.com"
              className="mt-1 text-[13px] text-ivory/70 transition-colors hover:text-ivory hover:underline"
            >
              label.swathyreddy12@gmail.com
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
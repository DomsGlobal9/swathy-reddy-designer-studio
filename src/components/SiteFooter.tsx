import type { ReactNode } from 'react';
import { Instagram, Facebook, ArrowUpRightIcon } from 'lucide-react';
import { navigation } from '../data/story';
import { scrollToId } from '../hooks/useSmoothScroll';
import { contact, mapsUrl, phoneDigits } from '../data/contact';
import { shopHome } from '../lib/shop';
import { OpenNow } from './ui/OpenNow';

/**
 * The footer sits under the page (sticky, z-0) while <main> (z-10) scrolls off it like a curtain,
 * on desktop where the footer fits the screen.
 */
export function SiteFooter() {
  return (
    <footer className="relative z-0 overflow-hidden bg-ink text-ivory md:sticky md:bottom-0">
      {/* Warm glow from below, like lamplight on silk. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-[radial-gradient(60%_80%_at_50%_100%,rgba(201,164,92,0.22),transparent_70%)]" />

      <div className="relative mx-auto max-w-[1440px] px-5 pb-10 pt-16 md:px-10 md:pt-24">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1.3fr_1fr_0.8fr] lg:gap-10">
          <Column title="Visit">
            <p className="text-[15px] leading-relaxed text-ivory/85">
              {contact.street}
              <br />
              {contact.area}, Hyderabad
            </p>
            <div className="mt-5">
              <OpenNow />
            </div>
            <a href={mapsUrl} target="_blank" rel="noreferrer" className="group mt-4 inline-flex items-center gap-1.5 text-[14px] text-[#E8C980] transition-colors hover:text-ivory">
              Get directions
              <ArrowUpRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
          </Column>

          <Column title="Talk to us">
            <a href={`tel:+${phoneDigits}`} className="block text-[15px] text-ivory/85 transition-colors hover:text-ivory">{contact.phone}</a>
            <a href={`mailto:${contact.email}`} className="mt-1 block break-all text-[15px] text-ivory/85 transition-colors hover:text-ivory">{contact.email}</a>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <a
                href={`https://wa.me/${phoneDigits}?text=${encodeURIComponent('Hello Swathy Reddy Designer Studio')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-ivory px-5 py-2.5 text-[13px] font-medium text-ink transition-colors duration-200 hover:bg-[#F9DE84]">
                WhatsApp
                <ArrowUpRightIcon className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={`tel:+${phoneDigits}`}
                className="inline-flex items-center rounded-full px-5 py-2.5 text-[13px] font-medium text-ivory shadow-[inset_0_0_0_1px_rgba(244,238,228,0.3)] transition-colors duration-200 hover:bg-ivory/10">
                Call
              </a>
            </div>
          </Column>

          <Column title="Explore">
            <nav aria-label="Footer" className="flex flex-col items-start gap-2.5">
              {navigation.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => scrollToId(link.target)}
                  className="text-[15px] text-ivory/80 transition-colors duration-200 hover:text-ivory">
                  {link.label}
                </button>
              ))}
              <a href={shopHome()} className="text-[15px] text-ivory/80 transition-colors duration-200 hover:text-ivory">Shop online</a>
            </nav>
          </Column>

          <Column title="Follow">
            <div className="flex items-center gap-3">
              <Social href="https://instagram.com" label="Instagram"><Instagram className="h-[18px] w-[18px]" strokeWidth={1.5} /></Social>
              <Social href="https://facebook.com" label="Facebook"><Facebook className="h-[18px] w-[18px]" strokeWidth={1.5} /></Social>
            </div>
          </Column>
        </div>

        <div className="mt-14 flex flex-col gap-2 text-[13px] text-ivory/50 sm:flex-row sm:justify-between md:mt-16">
          <p>© {new Date().getFullYear()} {contact.name}</p>
          <p className="text-[11px] uppercase tracking-[0.22em]">
            Design &amp; Development <span aria-hidden="true" className="mx-1.5 text-[#C9A45C]">·</span> <span className="text-[#E8C980]">Doms Global LLP</span>
          </p>
        </div>
      </div>

    </footer>
  );
}

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.24em] text-[#C9A45C]">{title}</p>
      {children}
    </div>
  );
}

function Social({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full text-ivory/80 shadow-[inset_0_0_0_1px_rgba(244,238,228,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-ivory hover:text-ink">
      {children}
    </a>
  );
}

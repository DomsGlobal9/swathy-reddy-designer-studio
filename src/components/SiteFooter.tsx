import type { ReactNode } from 'react';
import { Instagram, Facebook, ArrowUpRightIcon, MessageCircleIcon, PhoneIcon } from 'lucide-react';
import { navigation } from '../data/story';
import { scrollToId } from '../hooks/useSmoothScroll';
import { contact, mapsUrl, phoneDigits } from '../data/contact';
import { shopHome } from '../lib/shop';
import { OpenNow } from './ui/OpenNow';
import { MotifArt } from './ui/MotifArt';

const SILK = "url('/footer-burgundy-silk.jpg')";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#25120E] text-ivory">
      {/* Decoration only: the burgundy silk picture. Wide screens show it whole. Phones and tablets stack the
          columns, and a tall footer would crop the picture to its plain dark middle, so there the paisley
          corner sits at the top and the silk drape at the bottom, each cut from the same picture. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 hidden bg-cover bg-bottom bg-no-repeat xl:block" style={{ backgroundImage: SILK }} />
        <div
          className="absolute inset-x-0 top-0 h-[360px] bg-[length:300%_auto] bg-left-top bg-no-repeat md:h-[420px] md:bg-[length:160%_auto] xl:hidden"
          style={{ backgroundImage: SILK, WebkitMaskImage: 'linear-gradient(to bottom, black 35%, transparent 75%)', maskImage: 'linear-gradient(to bottom, black 35%, transparent 75%)' }} />
        <div className="absolute inset-x-0 bottom-0 h-[380px] bg-[length:300%_auto] bg-right-bottom bg-no-repeat md:h-[480px] md:bg-[length:160%_auto] xl:hidden"
          style={{ backgroundImage: SILK, WebkitMaskImage: 'linear-gradient(to top, black 55%, transparent)', maskImage: 'linear-gradient(to top, black 55%, transparent)' }} />
        {/* A little shade under the bottom row so the small print stays readable on the silk. */}
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/70 to-transparent xl:h-32 xl:from-black/55" />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-5 pb-10 pt-16 md:px-10 md:pt-24">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 xl:grid-cols-[1.3fr_1.3fr_1fr_0.8fr] xl:gap-16">
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

          <Column title="Talk to us" divider>
            <a href={`tel:+${phoneDigits}`} className="block text-[15px] text-ivory/85 transition-colors hover:text-ivory">{contact.phone}</a>
            <a href={`mailto:${contact.email}`} className="mt-1 block break-all text-[15px] text-ivory/85 transition-colors hover:text-ivory">{contact.email}</a>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <a
                href={`https://wa.me/${phoneDigits}?text=${encodeURIComponent('Hello Swathy Reddy Designer Studio')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-ivory px-5 py-2.5 text-[13px] font-medium text-ink transition-colors duration-200 hover:bg-[#F9DE84]">
                <MessageCircleIcon className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
                WhatsApp
                <ArrowUpRightIcon className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={`tel:+${phoneDigits}`}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium text-ivory shadow-[inset_0_0_0_1px_rgba(244,238,228,0.3)] transition-colors duration-200 hover:bg-ivory/10">
                <PhoneIcon className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
                Call
              </a>
            </div>
          </Column>

          <Column title="Explore" divider>
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

          <Column title="Follow" divider>
            <div className="flex items-center gap-3">
              {contact.instagram && <Social href={contact.instagram} label="Instagram @label_swathyreddy"><Instagram className="h-[18px] w-[18px]" strokeWidth={1.5} /></Social>}
              {contact.facebook && <Social href={contact.facebook} label="Facebook"><Facebook className="h-[18px] w-[18px]" strokeWidth={1.5} /></Social>}
            </div>
            {contact.instagram && (
              <a href={contact.instagram} target="_blank" rel="noreferrer" className="mt-3 inline-block text-[14px] text-ivory/80 transition-colors hover:text-ivory">
                @label_swathyreddy
              </a>
            )}
          </Column>
        </div>

        {/* Gold lotus between two fine lines. */}
        <div aria-hidden="true" className="mt-14 flex items-center justify-center gap-4 md:mt-16">
          <span className="h-px w-20 bg-gradient-to-r from-transparent to-[#C9A45C]/70 sm:w-48 md:w-72" />
          <span className="block h-14 w-14"><MotifArt motif="lotus" color="#E8C980" strokeWidth={2} /></span>
          <span className="h-px w-20 bg-gradient-to-l from-transparent to-[#C9A45C]/70 sm:w-48 md:w-72" />
        </div>

        <div className="mt-8 flex flex-col gap-2 text-[13px] text-ivory/60 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {contact.name}</p>
          <p className="whitespace-nowrap text-[11px] uppercase tracking-[0.14em] sm:tracking-[0.22em]">
            Design &amp; Development <span aria-hidden="true" className="mx-1.5 text-[#C9A45C]">·</span> <span className="text-[#E8C980]">Doms Global LLP</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

/** A footer column; `divider` draws the gold line with a diamond on its left, when the four columns sit in one row. */
function Column({ title, children, divider = false }: { title: string; children: ReactNode; divider?: boolean }) {
  return (
    <div className="relative">
      {divider && (
        <span aria-hidden="true" className="absolute -left-8 top-9 hidden h-[150px] flex-col items-center xl:flex">
          <span className="w-px flex-1 bg-gradient-to-b from-transparent to-[#C9A45C]/60" />
          <span className="my-1 h-2 w-2 rotate-45 border border-[#C9A45C] bg-[#C9A45C]/30" />
          <span className="w-px flex-1 bg-gradient-to-t from-transparent to-[#C9A45C]/60" />
        </span>
      )}
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

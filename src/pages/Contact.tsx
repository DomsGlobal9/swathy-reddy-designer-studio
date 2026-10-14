import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRightIcon, CalendarIcon, CheckIcon, CopyIcon, MailIcon, MapPinIcon, PhoneIcon } from 'lucide-react';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import { BookingDialog } from '../components/BookingDialog';
import { ChapterMark } from '../components/ui/ChapterMark';
import { FadeUp } from '../components/ui/FadeUp';
import { DriftingMotif } from '../components/ui/DriftingMotif';
import { images } from '../data/images';
import { contact, dayNames, formatHour, hours, hyderabadNow, mapEmbedUrl, mapsUrl, phoneDigits } from '../data/contact';
import { OpenNow } from '../components/ui/OpenNow';
import { easeOut } from '../utils/format';

const WEEK = [1, 2, 3, 4, 5, 6, 0]; // Monday first, as Indian calendars print it
const COUNT_WORDS = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven'];

export function Contact() {
  const reduce = useReducedMotion();
  useSmoothScroll(!reduce);
  const [bookingOpen, setBookingOpen] = useState(false);
  const openBooking = useCallback(() => setBookingOpen(true), []);
  const closeBooking = useCallback(() => setBookingOpen(false), []);

  useEffect(() => {
    document.title = 'Contact · Swathy Reddy Designer Studio';
  }, []);

  const openDays = hours.filter(Boolean).length;

  return (
    <div className="min-h-screen w-full bg-ivory font-sans text-ink">
      <SiteHeader onBook={openBooking} />
      <main className="relative overflow-x-clip">
        {/* Hero */}
        <section className="relative flex min-h-[80svh] items-end overflow-hidden bg-ink">
          <img
            src={images.boutiqueInterior}
            alt="Inside Swathy Reddy Designer Studio"
            className="absolute inset-0 h-full w-full object-cover motion-safe:animate-kenburns"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/45 to-ink/35" />
          <div className="relative mx-auto w-full max-w-[1440px] px-5 pb-14 pt-32 md:px-10 md:pb-20">
            <ChapterMark label="Contact" tone="ivory" />
            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: easeOut }}
              className="mt-5 font-display text-[3.4rem] leading-[0.92] tracking-[-0.03em] text-ivory sm:text-[5rem] md:text-[7.5rem]">
              We'd love to
              <br />
              <em>see you.</em>
            </motion.h1>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <OpenNow />
              <p className="text-[14px] text-ivory/80">{contact.area}, Hyderabad</p>
            </div>
          </div>
        </section>

        {/* Ways to reach */}
        <section className="relative px-5 py-20 md:px-10 md:py-28">
          <DriftingMotif motif="paisley" tone="zari" className="-right-12 top-12 hidden w-[260px] md:block" opacity={0.18} drift={90} spin={12} />
          <div className="relative mx-auto max-w-[1320px]">
            <FadeUp className="grid gap-6 md:grid-cols-12 md:items-end">
              <h2 className="font-display text-[2.6rem] leading-[1] tracking-[-0.02em] md:col-span-7 md:text-6xl">
                Come by, write,
                <br />
                <em>or book a fitting.</em>
              </h2>
              <p className="max-w-sm text-[15px] leading-relaxed text-stone md:col-span-4 md:col-start-9">
                Every bridal look, festive piece and alteration starts with a conversation. Reach us whichever way suits you.
              </p>
            </FadeUp>

            <div className={`mt-14 grid gap-5 sm:grid-cols-2 ${contact.phone ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
              <Channel icon={<MapPinIcon />} label="Visit the atelier" note="Walk in during opening hours, or book a private fitting.">
                <div>
                  <Value>
                    {contact.street.split(', ').map((line, i) => <span key={i} className="block">{line}</span>)}
                  </Value>
                  <p className="mt-2 text-[14px] text-stone">{contact.city}</p>
                </div>
                <Pill href={mapsUrl} external>Get directions</Pill>
              </Channel>

              <Channel icon={<MailIcon />} label="Write to us" note="For orders, alterations, and everything in between.">
                {/* A zero-width space lets a long address break before the @, never mid-word. */}
                <Value>{contact.email.replace('@', '​@')}</Value>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <Pill href={`mailto:${contact.email}`}>Send an email</Pill>
                  <CopyButton text={contact.email} />
                </div>
              </Channel>

              {contact.phone && (
                <Channel icon={<PhoneIcon />} label="Call or WhatsApp" note="We answer during opening hours.">
                  <Value>{contact.phone}</Value>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    <Pill href={`tel:+${phoneDigits}`}>Call</Pill>
                    <Pill href={`https://wa.me/${phoneDigits}`} external quiet>WhatsApp</Pill>
                  </div>
                </Channel>
              )}

              <Channel icon={<CalendarIcon />} label="Private consultation" note="Bridal, festive and made-to-measure, with time set aside only for you.">
                <Value>
                  In the atelier
                  <br />
                  or on video
                </Value>
                <Pill onClick={openBooking}>Book a consultation</Pill>
              </Channel>
            </div>
          </div>
        </section>

        {/* Hours and map */}
        <section className="bg-paper/60 px-5 py-20 md:px-10 md:py-28">
          <div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-12 lg:gap-16">
            <FadeUp className="lg:col-span-5">
              <ChapterMark label="Opening hours" />
              <h2 className="mt-4 font-display text-[2.4rem] leading-[1.02] tracking-[-0.02em] md:text-5xl">
                Our doors are open
                <br />
                <em>{COUNT_WORDS[openDays]} days a week.</em>
              </h2>
              <WeekHours />
              <p className="mt-5 text-[13px] text-stone">All times are Hyderabad time (IST).</p>
            </FadeUp>

            <div className="relative min-h-[480px] overflow-hidden rounded-3xl bg-paper sm:min-h-[420px] lg:col-span-7 lg:min-h-0">
              <iframe
                src={mapEmbedUrl}
                title={`Map showing ${contact.name}, ${contact.street}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                // Taller than its frame and shifted up, so Google's own place box (top left) is out of
                // view; our card below offers the same link. The credits at the bottom stay visible.
                className="absolute inset-x-0 -top-[140px] h-[calc(100%+140px)] w-full border-0 [filter:sepia(0.35)_saturate(1.25)_hue-rotate(-28deg)_contrast(0.95)_brightness(1.04)]"
              />
              {/* Blush and gold wash in the brand colours. */}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(107,28,34,0.10),rgba(160,124,59,0.10))] mix-blend-multiply" />
              <div className="absolute bottom-4 left-4 right-4 max-w-sm rounded-2xl bg-ivory/95 p-4 shadow-[0_16px_40px_-12px_rgba(29,24,21,0.35)] backdrop-blur-sm sm:bottom-6 sm:left-6 sm:right-auto sm:p-5">
                <p className="font-display text-lg sm:text-xl">{contact.name}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-stone">
                  {contact.street}, {contact.city}
                </p>
                <Pill className="mt-3 sm:mt-4" href={mapsUrl} external>Open in Google Maps</Pill>
              </div>
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
      <BookingDialog open={bookingOpen} onClose={closeBooking} />
    </div>
  );
}

function Channel({ icon, label, note, children }: { icon: ReactNode; label: string; note: string; children: ReactNode }) {
  return (
    <FadeUp className="flex h-full flex-col gap-6 rounded-3xl bg-paper/55 p-7 transition-shadow duration-300 hover:shadow-[0_24px_48px_-28px_rgba(29,24,21,0.35)] md:p-9">
      <span className="flex items-center gap-3 text-[14px] font-medium text-ink">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-oxblood/10 text-oxblood [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:stroke-[1.6]">
          {icon}
        </span>
        {label}
      </span>
      {children}
      <p className="mt-auto text-[13px] leading-relaxed text-stone">{note}</p>
    </FadeUp>
  );
}

function Value({ children }: { children: ReactNode }) {
  return <p className="text-[1.15rem] font-medium leading-snug text-ink md:text-[1.25rem]">{children}</p>;
}

/** A rounded action button; `quiet` is the outlined, secondary look. */
function Pill({ children, href, onClick, external, quiet, className = '' }: {
  children: ReactNode; href?: string; onClick?: () => void; external?: boolean; quiet?: boolean; className?: string;
}) {
  const cls = `inline-flex items-center gap-2 self-start rounded-full px-5 py-2.5 text-[13px] font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood ${
    quiet ? 'bg-ivory text-ink shadow-[inset_0_0_0_1px_rgba(29,24,21,0.18)] hover:bg-white' : 'bg-ink text-ivory hover:bg-oxblood'} ${className}`;
  const body = <>{children}<ArrowUpRightIcon className="h-4 w-4" aria-hidden="true" /></>;
  return href
    ? <a href={href} className={cls} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>{body}</a>
    : <button type="button" onClick={onClick} className={cls}>{body}</button>;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy the email address', text);
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-[13px] font-medium text-stone transition-colors hover:bg-ivory hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4">
      {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
      <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}

function WeekHours() {
  const today = hyderabadNow().day;
  return (
    <ol className="mt-8 space-y-1">
      {WEEK.map((d) => {
        const slot = hours[d];
        const isToday = d === today;
        return (
          <li key={d} className={`flex items-center justify-between gap-4 rounded-2xl px-4 py-3 text-[15px] ${isToday ? 'bg-oxblood/[0.08] font-medium text-oxblood' : 'text-ink'}`}>
            <span className="flex items-center gap-3">
              {dayNames[d]}
              {isToday && <span className="rounded-full bg-oxblood px-2.5 py-0.5 text-[11px] font-medium text-ivory">Today</span>}
            </span>
            <span className={`tabular-nums ${slot ? '' : 'text-stone'}`}>
              {slot ? `${formatHour(slot[0])} – ${formatHour(slot[1])}` : 'Closed'}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

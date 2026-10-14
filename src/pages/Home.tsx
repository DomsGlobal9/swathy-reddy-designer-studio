import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { scrollToId, useSmoothScroll } from '../hooks/useSmoothScroll';
import { SiteHeader } from '../components/SiteHeader';
import { ThreadOverlay } from '../components/ThreadOverlay';
import { Hero } from '../components/sections/Hero';
import { WomanSection } from '../components/sections/WomanSection';
import { MenSection } from '../components/sections/MenSection';
import { KidsSection } from '../components/sections/KidsSection';
import { StorySection } from '../components/sections/StorySection';
import { CraftSection } from '../components/sections/CraftSection';
import { WeaveBand } from '../components/sections/WeaveBand';
import { CollectionShowcase } from '../components/sections/CollectionShowcase';
import { SignatureEdit } from '../components/sections/SignatureEdit';
import { ThreadJourney } from '../components/sections/ThreadJourney';
import { OccasionSection } from '../components/sections/OccasionSection';
import { Lookbook } from '../components/sections/Lookbook';
import { StylingSection } from '../components/sections/StylingSection';
import { SiteFooter } from '../components/SiteFooter';
import { BookingDialog } from '../components/BookingDialog';

export function Home() {
  const reduce = useReducedMotion();
  useSmoothScroll(!reduce);
  const mainRef = useRef<HTMLElement>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [bookingOpen, setBookingOpen] = useState(false);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }, []);
  const closeBooking = useCallback(() => setBookingOpen(false), []);

  // Arriving from another page's menu (/#men): land on that section once the page has laid out.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const t = setTimeout(() => scrollToId(id), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen w-full bg-ivory font-sans text-ink">
      <SiteHeader onBook={() => setBookingOpen(true)} />
      <main ref={mainRef} className="relative overflow-x-clip">
        <ThreadOverlay containerRef={mainRef} />
        <Hero />
        <WomanSection />
        <MenSection />
        <KidsSection />
        <StorySection />
        <WeaveBand />
        <CraftSection />
        <CollectionShowcase />
        <SignatureEdit wishlist={wishlist} onToggleSave={toggleWishlist} />
        <ThreadJourney />
        <OccasionSection />
        <Lookbook />
        <StylingSection onBook={() => setBookingOpen(true)} />
      </main>
      <SiteFooter />
      <BookingDialog open={bookingOpen} onClose={closeBooking} />
    </div>);

}
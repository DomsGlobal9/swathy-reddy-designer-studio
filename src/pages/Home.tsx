import { useCallback, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import { SiteHeader } from '../components/SiteHeader';
import { ThreadOverlay } from '../components/ThreadOverlay';
import { Hero } from '../components/sections/Hero';
import { WomanSection } from '../components/sections/WomanSection';
import { StorySection } from '../components/sections/StorySection';
import { CraftSection } from '../components/sections/CraftSection';
import { WeaveBand } from '../components/sections/WeaveBand';
import { CollectionShowcase } from '../components/sections/CollectionShowcase';
import { CollectionGrid } from '../components/sections/CollectionGrid';
import { SignatureEdit } from '../components/sections/SignatureEdit';
import { ThreadJourney } from '../components/sections/ThreadJourney';
import { OccasionSection } from '../components/sections/OccasionSection';
import { Lookbook } from '../components/sections/Lookbook';
import { BoutiqueSection } from '../components/sections/BoutiqueSection';
import { StylingSection } from '../components/sections/StylingSection';
import { FinalStatement } from '../components/sections/FinalStatement';
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

  return (
    <div className="min-h-screen w-full bg-ivory font-sans text-ink">
      <SiteHeader onBook={() => setBookingOpen(true)} />
      <main ref={mainRef} className="relative overflow-x-clip">
        <ThreadOverlay containerRef={mainRef} />
        <Hero />
        <WomanSection />
        <StorySection />
        <WeaveBand />
        <CraftSection />
        <CollectionShowcase />
        <CollectionGrid />
        <SignatureEdit wishlist={wishlist} onToggleSave={toggleWishlist} />
        <ThreadJourney />
        <OccasionSection />
        <Lookbook />
        <BoutiqueSection />
        <StylingSection onBook={() => setBookingOpen(true)} />
        <FinalStatement />
      </main>
      <SiteFooter />
      <BookingDialog open={bookingOpen} onClose={closeBooking} />
    </div>);

}
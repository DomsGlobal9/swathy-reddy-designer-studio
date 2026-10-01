import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MenuIcon, XIcon } from 'lucide-react';
import { navigation } from '../data/story';
import { scrollToId, setScrollLocked } from '../hooks/useSmoothScroll';
import { shopHome } from '../lib/shop';

type SiteHeaderProps = {
  onBook?: () => void;
};

export function SiteHeader({ onBook }: SiteHeaderProps = {}) {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = Math.max(0, window.scrollY);

    const onScroll = () => {
      const currentScrollY = Math.max(0, window.scrollY);
      const delta = currentScrollY - lastScrollY.current;

      setScrolled(currentScrollY > 40);

      // Always keep header visible when near the top of the page
      if (currentScrollY <= 80) {
        setVisible(true);
      } else if (delta > 8) {
        // Scrolling down -> hide navbar
        setVisible(false);
      } else if (delta < -8) {
        // Scrolling up -> show navbar
        setVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    setScrollLocked(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      setScrollLocked(false);
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const go = (target: string) => {
    setMenuOpen(false);
    scrollToId(target);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b transition-all duration-300 ease-out ${
        visible || menuOpen ? 'translate-y-0' : '-translate-y-full'
      } ${
        scrolled || menuOpen
          ? 'border-line bg-ivory/95 shadow-[0_4px_20px_-8px_rgba(29,24,21,0.08)] backdrop-blur-md'
          : 'border-transparent bg-transparent'
      }`}>
      
      {/* Subtle dark gradient overlay when at the top to ensure white text is ALWAYS readable regardless of hero image */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${scrolled || menuOpen ? 'opacity-0' : 'opacity-100 bg-gradient-to-b from-ink/60 to-transparent'}`} />

      <div className="relative mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 md:h-[72px] md:px-10">
        <button
          type="button"
          onClick={() => go('top')}
          className="group flex items-center gap-3 transition-opacity hover:opacity-90">
          <img
            src="/favicon.svg"
            alt="SR"
            className={`h-8 w-auto object-contain transition-all duration-200 group-hover:scale-105 md:h-10 ${!(scrolled || menuOpen) ? 'brightness-0 invert drop-shadow-md' : ''}`}
          />
          <span className={`whitespace-nowrap font-display text-xl font-medium uppercase tracking-[0.18em] transition-colors md:text-[26px] translate-y-[2px] md:translate-y-[3px] ${scrolled || menuOpen ? 'text-ink group-hover:text-oxblood' : 'text-ivory drop-shadow-md group-hover:text-[#F9DE84]'}`}>
            Swathy Reddy
          </span>
        </button>

        <nav aria-label="Primary" className="hidden items-center gap-10 md:flex">
          {navigation.map((link) =>
          <button
            key={link.target}
            type="button"
            onClick={() => go(link.target)}
            className={`group relative whitespace-nowrap text-[12px] font-medium uppercase tracking-[0.22em] transition-colors ${scrolled ? 'text-ink hover:text-oxblood' : 'text-ivory drop-shadow-md hover:text-[#F9DE84]'}`}>
            
              {link.label}
              <span className={`absolute -bottom-1 left-0 h-[1.5px] w-full origin-left scale-x-0 transition-transform duration-200 ease-out group-hover:scale-x-100 ${scrolled ? 'bg-oxblood' : 'bg-[#F9DE84]'}`} />
            </button>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <a
            href={shopHome()}
            className={`hidden rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] transition-colors duration-200 md:inline-flex ${scrolled ? 'bg-oxblood text-ivory hover:bg-ink' : 'bg-ivory text-ink hover:bg-oxblood hover:text-ivory shadow-lg'}`}>
            Shop online
          </a>
          <button
            type="button"
            onClick={onBook ?? (() => scrollToId('styling'))}
            className={`hidden rounded-full border px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] transition-colors duration-200 md:inline-flex ${scrolled ? 'border-ink/25 text-ink hover:border-oxblood hover:bg-oxblood hover:text-ivory' : 'border-ivory/50 text-ivory hover:border-ivory hover:bg-ivory hover:text-ink shadow-sm drop-shadow-md'}`}>
            Book an appointment
          </button>
          <button
            type="button"
            className={`md:hidden transition-colors ${scrolled || menuOpen ? 'text-ink' : 'text-ivory drop-shadow-md'}`}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}>
            
            {menuOpen ? <XIcon className="h-6 w-6" strokeWidth={1.5} /> : <MenuIcon className="h-6 w-6" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen &&
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute inset-x-0 top-full z-30 flex flex-col border-t border-line bg-ivory/95 shadow-xl backdrop-blur-md md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu">
          
            <nav aria-label="Mobile" className="flex flex-col">
              {navigation.map((link) =>
                <button
                  key={link.target}
                  type="button"
                  onClick={() => go(link.target)}
                  className="w-full border-b border-line/50 px-8 py-5 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-ink transition-colors hover:bg-stone/5 hover:text-oxblood">
                  
                  {link.label}
                </button>
              )}
              <a 
                href={shopHome()} 
                className="w-full border-b border-line/50 px-8 py-5 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-oxblood transition-colors hover:bg-stone/5">
                Shop online
              </a>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  if (onBook) onBook();
                  else scrollToId('styling');
                }}
                className="w-full px-8 py-5 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-ink transition-colors hover:bg-stone/5 hover:text-oxblood">
                Book an appointment
              </button>
            </nav>
          </motion.div>
        }
      </AnimatePresence>
    </header>);

}
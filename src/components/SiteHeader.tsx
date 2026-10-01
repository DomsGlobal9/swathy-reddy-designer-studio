import { useEffect, useState } from 'react';
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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
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
      className={`fixed inset-x-0 top-0 z-40 border-b backdrop-blur-md transition-all duration-300 ease-out ${
      scrolled
        ? 'border-line bg-ivory/95 shadow-[0_4px_20px_-8px_rgba(29,24,21,0.08)]'
        : 'border-line/70 bg-ivory/92 shadow-xs'}`
      }>
      
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 md:h-[72px] md:px-10">
        <button
          type="button"
          onClick={() => go('top')}
          className="group flex items-center gap-3 transition-opacity hover:opacity-90">
          <img
            src="/sr-logo.png"
            alt="SR"
            className="h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-105 md:h-11"
          />
          <span className="whitespace-nowrap font-display text-lg font-medium uppercase tracking-[0.24em] text-ink transition-colors group-hover:text-oxblood md:text-xl">
            Swathy Reddy
          </span>
        </button>

        <nav aria-label="Primary" className="hidden items-center gap-10 md:flex">
          {navigation.map((link) =>
          <button
            key={link.target}
            type="button"
            onClick={() => go(link.target)}
            className="group relative whitespace-nowrap text-[12px] font-medium uppercase tracking-[0.22em] text-ink transition-colors hover:text-oxblood">
            
              {link.label}
              <span className="absolute -bottom-1 left-0 h-[1.5px] w-full origin-left scale-x-0 bg-oxblood transition-transform duration-200 ease-out group-hover:scale-x-100" />
            </button>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {/* Into the real shop: every piece, the bag, checkout. */}
          <a
            href={shopHome()}
            className="hidden rounded-full bg-oxblood px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-ivory transition-colors duration-200 hover:bg-ink md:inline-flex">
            Shop online
          </a>
          <button
            type="button"
            onClick={onBook ?? (() => scrollToId('styling'))}
            className="hidden rounded-full border border-ink/25 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-ink transition-colors duration-200 hover:border-oxblood hover:bg-oxblood hover:text-ivory md:inline-flex">
            Book an appointment
          </button>
          <button
            type="button"
            className="text-ink md:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}>
            
            <MenuIcon className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex flex-col bg-ivory px-5 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu">
          
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src="/sr-logo.png"
                  alt="SR"
                  className="h-8 w-auto object-contain"
                />
                <span className="font-display text-lg uppercase tracking-[0.2em] text-ink">
                  Swathy Reddy
                </span>
              </div>
              <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
                <XIcon className="h-5 w-5" strokeWidth={1.25} />
              </button>
            </div>
            <nav aria-label="Mobile" className="mt-16 flex flex-col gap-6">
              {navigation.map((link) =>
            <button
              key={link.target}
              type="button"
              onClick={() => go(link.target)}
              className="text-left font-display text-5xl">
              
                  {link.label}
                </button>
            )}
              <a href={shopHome()} className="text-left font-display text-5xl text-oxblood">Shop online</a>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  if (onBook) onBook();
                  else scrollToId('styling');
                }}
                className="text-left font-display text-4xl text-ink transition-colors hover:text-oxblood"
              >
                Book an appointment
              </button>
            </nav>
            <p className="mt-auto pb-10 text-sm text-stone">Road No. 36, Jubilee Hills, Hyderabad</p>
          </motion.div>
        }
      </AnimatePresence>
    </header>);

}
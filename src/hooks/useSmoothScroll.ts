import { useEffect } from 'react';
import Lenis from 'lenis';

let instance: Lenis | null = null;

export function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });
    instance = lenis;
    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      instance = null;
    };
  }, [enabled]);
}

export function scrollToId(id: string) {
  // A path ('/contact') is another page, not a section.
  if (id.startsWith('/')) {
    window.location.href = id;
    return;
  }
  const el = document.getElementById(id);
  if (!el) {
    // On another page the home page's sections are not here: go home and land on the section.
    // The top of the page needs no #: a plain '/' keeps the address clean to share.
    if (window.location.pathname !== '/') window.location.href = id === 'top' ? '/' : `/#${id}`;
    return;
  }
  if (instance) {
    // 0 offset ensures the section aligns perfectly with the top of the screen, utilizing its own built-in padding
    instance.scrollTo(el, { offset: 0 });
  } else {
    // Fallback for browsers/states without Lenis
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export function setScrollLocked(locked: boolean) {
  if (instance) {
    if (locked) instance.stop();else
    instance.start();
  } else {
    document.documentElement.style.overflow = locked ? 'hidden' : '';
  }
}
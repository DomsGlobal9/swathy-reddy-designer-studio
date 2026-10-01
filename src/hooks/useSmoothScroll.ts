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
  const el = document.getElementById(id);
  if (!el) return;
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
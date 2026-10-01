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
    instance.scrollTo(el, { offset: id === 'top' ? 0 : -64 });
  } else {
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
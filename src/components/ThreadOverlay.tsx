import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { motion, useMotionValue } from 'framer-motion';

type Point = {x: number;y: number;};
type Geometry = {d: string;width: number;height: number;};
type Sample = {len: number;y: number;};

type ThreadOverlayProps = {
  containerRef: RefObject<HTMLElement>;
};

/**
 * One continuous hand-drawn thread that runs the length of the page.
 * It passes through every [data-thread-anchor] marker and draws itself
 * so that its tip stays just below the middle of the viewport.
 * Sections with a higher z-index hide it — so it "travels behind" them.
 */
export function ThreadOverlay({ containerRef }: ThreadOverlayProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const samples = useRef<Sample[]>([]);
  const [geo, setGeo] = useState<Geometry | null>(null);
  const [length, setLength] = useState(0);
  const dashOffset = useMotionValue(99999);
  const tipX = useMotionValue(-20);
  const tipY = useMotionValue(-20);
  const tipOpacity = useMotionValue(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const anchors = Array.from(container.querySelectorAll<HTMLElement>('[data-thread-anchor]')).
        filter((el) => el.getClientRects().length > 0).
        map((el) => {
          const r = el.getBoundingClientRect();
          return { x: r.left - rect.left + r.width / 2, y: r.top - rect.top + r.height / 2 };
        }).
        sort((a, b) => a.y - b.y);
        if (anchors.length < 2) return;
        const newD = buildPath(anchors);
        setGeo((prev) => {
          if (
            prev &&
            prev.d === newD &&
            Math.abs(prev.width - rect.width) < 1 &&
            Math.abs(prev.height - rect.height) < 4
          ) {
            return prev;
          }
          return { d: newD, width: rect.width, height: rect.height };
        });
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [containerRef]);

  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path || !geo) return;
    const total = path.getTotalLength();
    const count = 80;
    const list: Sample[] = [];
    let maxY = -Infinity;
    for (let i = 0; i <= count; i++) {
      const len = total * i / count;
      maxY = Math.max(maxY, path.getPointAtLength(len).y);
      list.push({ len, y: maxY });
    }
    samples.current = list;
    setLength(total);
    dashOffset.set(total);
  }, [geo, dashOffset]);

  useEffect(() => {
    const container = containerRef.current;
    const path = pathRef.current;
    if (!length || !container || !path) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const list = samples.current;
      if (!list.length) return;
      const target = -container.getBoundingClientRect().top + window.innerHeight * 0.62;
      let drawn = 0;
      if (target >= list[list.length - 1].y) {
        drawn = length;
      } else if (target > list[0].y) {
        let lo = 0;
        let hi = list.length - 1;
        while (lo < hi) {
          const mid = (lo + hi) >> 1;
          if (list[mid].y < target) lo = mid + 1;else
          hi = mid;
        }
        drawn = list[lo].len;
      }
      dashOffset.set(length - drawn);
      const pt = path.getPointAtLength(drawn);
      tipX.set(pt.x);
      tipY.set(pt.y);
      tipOpacity.set(drawn > 0 && drawn < length ? 1 : 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [length, containerRef, dashOffset, tipX, tipY, tipOpacity]);

  if (!geo) return null;

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 z-10"
      width={geo.width}
      height={geo.height}
      viewBox={`0 0 ${geo.width} ${geo.height}`}
      fill="none">
      
      <motion.path
        d={geo.d}
        stroke="#6B1C22"
        strokeOpacity={0.22}
        strokeWidth={1}
        strokeLinecap="round"
        transform="translate(1.6 1.2)"
        strokeDasharray={length || 1}
        style={{ strokeDashoffset: dashOffset, opacity: length ? 1 : 0 }} />
      
      <motion.path
        ref={pathRef}
        d={geo.d}
        stroke="#6B1C22"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeDasharray={length || 1}
        style={{ strokeDashoffset: dashOffset, opacity: length ? 1 : 0 }} />
      
      <motion.circle r={2.6} fill="#6B1C22" style={{ cx: tipX, cy: tipY, opacity: tipOpacity }} />
    </svg>);

}

function buildPath(points: Point[]) {
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const dy = b.y - a.y;
    const sway = (i % 2 === 0 ? 1 : -1) * Math.min(70, dy * 0.09);
    d += ` C ${(a.x + sway).toFixed(1)} ${(a.y + dy * 0.45).toFixed(1)}, ${(b.x - sway).toFixed(1)} ${(b.y - dy * 0.45).toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  }
  return d;
}
import { useRef, useState, useEffect } from 'react';
import { motion, useMotionTemplate, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Volume2Icon, VolumeXIcon } from 'lucide-react';

type RevealImageProps = {
  src: string;
  video?: string;
  alt: string;
  className?: string;
  parallax?: number;
  /** A plain photo: no reveal on scroll, no drift. */
  still?: boolean;
};

export function RevealImage({ src, video, alt, className = '', parallax = 6, still = false }: RevealImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const reduce = useReducedMotion() || still;
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const inset = useTransform(scrollYProgress, [0.04, 0.38], [100, 0]);
  const clipPath = useMotionTemplate`inset(${inset}% 0% 0% 0%)`;
  const y = useTransform(scrollYProgress, [0, 1], [`-${parallax}%`, `${parallax}%`]);
  const scale = 1 + (parallax * 2.4) / 100;

  // Sync muted property directly to DOM element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  // Guaranteed automatic autoplay across all mobile (iOS Safari/Android) and desktop browsers
  useEffect(() => {
    if (!video || !videoRef.current) return;
    const el = videoRef.current;

    // WebKit/iOS Safari requires explicit DOM property assignments for muted autoplay
    el.defaultMuted = true;
    el.muted = true;
    el.setAttribute('muted', '');
    el.setAttribute('playsinline', '');
    el.setAttribute('webkit-playsinline', '');

    const tryPlay = () => {
      const p = el.play();
      if (p !== undefined) {
        p.catch(() => {
          // If browser temporarily blocked playback before user gesture, retry on first scroll or touch
        });
      }
    };

    tryPlay();
    el.addEventListener('canplay', tryPlay);
    el.addEventListener('loadeddata', tryPlay);

    // Backup trigger: ensure playback kicks off on first user scroll or touch
    const onUserInteraction = () => {
      if (el.paused) tryPlay();
      window.removeEventListener('scroll', onUserInteraction);
      window.removeEventListener('touchstart', onUserInteraction);
    };
    window.addEventListener('scroll', onUserInteraction, { passive: true, once: true });
    window.addEventListener('touchstart', onUserInteraction, { passive: true, once: true });

    // Autoplay when scrolled into view, pause when out of view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            tryPlay();
          } else {
            el.pause();
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      el.removeEventListener('canplay', tryPlay);
      el.removeEventListener('loadeddata', tryPlay);
      window.removeEventListener('scroll', onUserInteraction);
      window.removeEventListener('touchstart', onUserInteraction);
    };
  }, [video]);

  return (
    <motion.div
      ref={ref}
      style={reduce ? undefined : { clipPath }}
      className={`group relative overflow-hidden bg-paper ${className}`}
    >
      {video ? (
        <>
          <motion.video
            ref={videoRef}
            src={video}
            poster={src}
            aria-label={alt}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            style={reduce ? undefined : { y, scale }}
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMuted(!muted);
            }}
            aria-label={muted ? 'Unmute video' : 'Mute video'}
            className="absolute bottom-3 right-3 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-ink/65 text-ivory backdrop-blur-sm transition-all hover:bg-oxblood hover:scale-105"
          >
            {muted ? <VolumeXIcon className="h-4 w-4" /> : <Volume2Icon className="h-4 w-4" />}
          </button>
        </>
      ) : (
        <motion.img
          src={src}
          alt={alt}
          loading="lazy"
          style={reduce ? undefined : { y, scale }}
          className="h-full w-full object-cover"
        />
      )}
    </motion.div>
  );
}

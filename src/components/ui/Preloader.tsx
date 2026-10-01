import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Preloader() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    // Prevent scrolling while preloader is active
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = '';
    }, 3800); // give enough time for the full 3s sequence + unmount
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, []);

  if (!visible) return null;

  // The cinematic cloth animation easing
  const easeInOutCubic = [0.65, 0, 0.35, 1];

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden pointer-events-none"
      initial={{ backgroundColor: '#F4EEE4' }} // warm ivory
      animate={{ backgroundColor: 'rgba(244, 238, 228, 0)' }}
      transition={{ delay: 2.7, duration: 0.5, ease: easeInOutCubic }}
    >
      {/* 
        The typography revealed during the hero moment. 
        It sits behind the fabric initially, but the fabric has a cutout/mask or the text fades in over it. 
        Actually, the prompt asks for it to be revealed subtly. We can fade it in during the center hold.
      */}
      <motion.div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center mix-blend-difference text-ivory"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ times: [0, 0.5, 1], duration: 2.0, delay: 1.1, ease: 'easeInOut' }}
      >
        <img src="/sr-logo.png" alt="Swathy Reddy Logo" className="w-20 h-auto mb-4 object-contain brightness-0 invert" />
        <h1 className="font-display text-[8vw] leading-none tracking-[-0.02em] md:text-[5vw]">
          SWATHI REDDY
        </h1>
        <p className="mt-4 text-[10px] uppercase tracking-[0.4em] md:text-[12px]">
          Women &middot; Men &middot; Kids
        </p>
      </motion.div>

      {/* The single luxurious textile moving across the screen */}
      <motion.div
        className="absolute inset-0 z-10 h-full w-[200vw] md:w-[150vw]"
        initial={{ x: '100%' }}
        animate={{ x: '-100%' }}
        transition={{ duration: 3.2, ease: easeInOutCubic }}
      >
        <svg
          preserveAspectRatio="none"
          viewBox="0 0 200 100"
          className="h-full w-full drop-shadow-2xl"
        >
          <defs>
            {/* Elegant silk sheen and folds */}
            <linearGradient id="silk" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4A1317" />
              <stop offset="20%" stopColor="#6B1C22" />
              <stop offset="40%" stopColor="#8A262E" />
              <stop offset="50%" stopColor="#A3363F" /> {/* Highlight */}
              <stop offset="60%" stopColor="#6B1C22" />
              <stop offset="85%" stopColor="#3C0E12" /> {/* Shadow fold */}
              <stop offset="100%" stopColor="#6B1C22" />
            </linearGradient>
            
            {/* A subtle woven texture overlay (creates the high-end jacquard feel) */}
            <pattern id="weave" patternUnits="userSpaceOnUse" width="4" height="4">
              <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* 
            The complex cloth path. 
            We use framer-motion to morph the path from a leading edge, to a full curtain, to a trailing edge.
          */}
          <motion.path
            fill="url(#silk)"
            initial={{ d: "M200,0 C200,0 200,50 200,100 L200,100 L200,0 Z" }}
            animate={{
              d: [
                "M180,0 C150,30 160,70 190,100 L200,100 L200,0 Z", // Enters: curved leading edge
                "M50,0 C100,40 -20,60 30,100 L200,100 L200,0 Z",  // Flows: deep folds stretching
                "M-50,0 C-10,30 -20,70 -40,100 L180,100 C150,70 170,30 140,0 Z", // Centers: hero moment
                "M-150,0 C-100,40 -120,60 -180,100 L50,100 C80,60 20,40 60,0 Z", // Leaves: pulling away
                "M-200,0 C-200,30 -200,70 -200,100 L-200,100 L-200,0 Z" // Gone
              ]
            }}
            transition={{ duration: 3.2, ease: easeInOutCubic, times: [0, 0.2, 0.5, 0.8, 1] }}
          />

          {/* The texture layer overlapping the morphing path exactly */}
          <motion.path
            fill="url(#weave)"
            initial={{ d: "M200,0 C200,0 200,50 200,100 L200,100 L200,0 Z" }}
            animate={{
              d: [
                "M180,0 C150,30 160,70 190,100 L200,100 L200,0 Z",
                "M50,0 C100,40 -20,60 30,100 L200,100 L200,0 Z",
                "M-50,0 C-10,30 -20,70 -40,100 L180,100 C150,70 170,30 140,0 Z",
                "M-150,0 C-100,40 -120,60 -180,100 L50,100 C80,60 20,40 60,0 Z",
                "M-200,0 C-200,30 -200,70 -200,100 L-200,100 L-200,0 Z"
              ]
            }}
            transition={{ duration: 3.2, ease: easeInOutCubic, times: [0, 0.2, 0.5, 0.8, 1] }}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}

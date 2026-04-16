"use client";

import { motion } from "framer-motion";

export default function NoiseOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.05] mix-blend-overlay overflow-hidden">
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%]">
        <filter id="noiseFilter">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.65" 
            numOctaves="3" 
            stitchTiles="stitch" 
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
      
      {/* Animated noise pattern */}
      <motion.div
        className="absolute inset-0 bg-repeat bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"
        style={{ backgroundSize: '128px 128px' }}
        animate={{
          x: [0, -10, 10, -5, 5, 0],
          y: [0, 5, -5, 10, -10, 0],
        }}
        transition={{
          duration: 0.2,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
}

"use client";

import { motion } from "framer-motion";

export default function NoiseOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.05] mix-blend-overlay overflow-hidden">
      <motion.svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%]"
        animate={{
          x: [0, -10, 10, -5, 5, 0],
          y: [0, 5, -5, 10, -10, 0],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <filter id="noiseFilter">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.65" 
            numOctaves="3" 
            stitchTiles="stitch" 
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </motion.svg>
    </div>
  );
}

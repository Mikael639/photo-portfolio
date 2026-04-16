"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function PageTransition({ children }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isGallery = pathname.startsWith("/gallery");
  const isHome = pathname === "/";

  let transitionOverlay;

  if (isGallery) {
    transitionOverlay = (
      <motion.div
        className="fixed inset-0 z-50 bg-ink pointer-events-none"
        initial={{ scaleX: 1, transformOrigin: "right" }}
        animate={{ scaleX: 0, transformOrigin: "right" }}
        exit={{ scaleX: 1, transformOrigin: "left" }}
        transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
      />
    );
  } else if (isHome) {
    transitionOverlay = (
      <motion.div
        className="fixed inset-0 z-50 bg-ink pointer-events-none"
        initial={{ scaleY: 1, transformOrigin: "top" }}
        animate={{ scaleY: 0, transformOrigin: "top" }}
        exit={{ scaleY: 1, transformOrigin: "bottom" }}
        transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
      />
    );
  } else {
    // Oblique transition for other pages
    transitionOverlay = (
      <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden flex justify-center items-center">
        <motion.div
          className="bg-ink w-[250vw] h-[250vh] origin-center -rotate-45"
          initial={{ scaleY: 1, transformOrigin: "bottom" }}
          animate={{ scaleY: 0, transformOrigin: "bottom" }}
          exit={{ scaleY: 1, transformOrigin: "top" }}
          transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
        />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={pathname} className="relative z-10 w-full h-full">
        {mounted && transitionOverlay}
        
        {/* Page Content slightly pushing */}
        <motion.div
          initial={{ opacity: 0, y: isHome ? 30 : 0, x: isGallery ? 30 : 0 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: isHome ? -30 : 0, x: isGallery ? -30 : 0 }}
          transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1], delay: 0.1 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Durée totale de la transition (en secondes)
const DURATION = 0.7;

// Easing premium
// Easing premium
const EASE = [0.76, 0, 0.24, 1];
const PANELS = 4;

/**
 * Le rideau coulisse depuis le bas vers le haut pour couvrir la page,
 * puis recule vers le haut pour révéler la nouvelle page.
 * La couleur du voile (#f5efe6) est identique au fond du body → jamais de flash.
 */
export default function PageTransition({ children }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={pathname} className="relative w-full h-full">

        {/* ─── Voile de transition (Panneaux organiques) ─── */}
        {mounted && (
          <div className="fixed inset-0 z-[150] pointer-events-none flex">
            {[...Array(PANELS)].map((_, i) => (
              <motion.div
                key={i}
                className="h-full bg-[#f0e8de]"
                style={{ width: `${100 / PANELS}%` }}
                initial={{ scaleY: 0, transformOrigin: "top" }}
                animate={{ scaleY: 0, transformOrigin: "top" }}
                exit={{ scaleY: 1, transformOrigin: "top" }}
                transition={{
                  duration: DURATION * 0.6,
                  ease: EASE,
                  delay: i * 0.05,
                }}
              />
            ))}
            {/* Overlay final pour assurer une couverture totale */}
            <motion.div
              className="fixed inset-0 bg-[#f5efe6] z-[-1]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 1 }}
              transition={{ duration: 0.1, delay: DURATION * 0.6 + (PANELS * 0.05) }}
            />
          </div>
        )}
        
        {/* Voile de révélation (entrée de la nouvelle page) */}
        {mounted && (
          <div className="fixed inset-0 z-[150] pointer-events-none flex">
             {[...Array(PANELS)].map((_, i) => (
              <motion.div
                key={`reveal-${i}`}
                className="h-full bg-[#f5efe6]"
                style={{ width: `${100 / PANELS}%` }}
                initial={{ scaleY: 1, transformOrigin: "bottom" }}
                animate={{ scaleY: 0, transformOrigin: "bottom" }}
                transition={{
                  duration: DURATION * 0.6,
                  ease: EASE,
                  delay: i * 0.05 + 0.1,
                }}
              />
            ))}
          </div>
        )}

        {/* ─── Contenu de la page ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATION * 0.4, ease: "easeInOut", delay: DURATION * 0.3 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

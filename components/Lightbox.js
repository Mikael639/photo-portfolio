"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

export default function Lightbox({ photos, activeIndex, onClose, onPrev, onNext }) {
  const activePhoto = activeIndex === null ? null : photos[activeIndex];

  useEffect(() => {
    if (activeIndex === null) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeIndex]);

  useEffect(() => {
    if (activeIndex === null) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrev();
      if (event.key === "ArrowRight") onNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, onClose, onPrev, onNext]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {activePhoto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 18, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 14, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-white/20 bg-black"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative h-[65vh] w-full sm:h-[72vh]">
              <Image src={activePhoto.src} alt={activePhoto.alt} fill className="object-contain" sizes="100vw" />
            </div>

            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-8 text-white">
              <div>
                <p className="font-serif text-lg">{activePhoto.title}</p>
                <p className="text-xs uppercase tracking-[0.12em] text-white/70">{activePhoto.category}</p>
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={onPrev} className="rounded-full border border-white/35 px-3 py-2 text-sm">
                  Prev
                </button>
                <button type="button" onClick={onNext} className="rounded-full border border-white/35 px-3 py-2 text-sm">
                  Next
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    ,
    document.body
  );
}

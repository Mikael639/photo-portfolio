"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

export default function Lightbox({ photos, activeIndex, onClose, onPrev, onNext }) {
  const activePhoto = activeIndex === null ? null : photos[activeIndex];
  const currentLabel = activeIndex === null ? "" : `${activeIndex + 1} / ${photos.length}`;

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
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/88 p-4 backdrop-blur-sm md:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 18, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 14, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="relative w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(8,8,8,0.96),rgba(12,10,8,0.92))] text-white shadow-[0_30px_120px_rgba(0,0,0,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="absolute right-4 top-4 z-20 flex items-center gap-2 md:right-5 md:top-5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/14 bg-white/8 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-white transition hover:bg-white/14"
              >
                Fermer
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="relative min-h-[60vh] bg-black/10 sm:min-h-[72vh]">
                <Image src={activePhoto.src} alt={activePhoto.alt} fill className="object-contain" sizes="100vw" />

                <button
                  type="button"
                  onClick={onPrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/16 bg-black/28 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-white transition hover:bg-black/44"
                >
                  Prec
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/16 bg-black/28 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-white transition hover:bg-black/44"
                >
                  Suiv
                </button>
              </div>

              <aside className="flex flex-col justify-between gap-8 border-t border-white/8 p-5 lg:border-l lg:border-t-0 lg:p-6">
                <div className="space-y-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-white/48">{activePhoto.category}</p>
                  <h2 className="font-serif text-3xl leading-[0.98]">{activePhoto.title}</h2>
                  <p className="text-sm leading-relaxed text-white/68">{activePhoto.alt}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onPrev}
                    className="rounded-full border border-white/16 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-white transition hover:bg-white/10"
                  >
                    Image precedente
                  </button>
                  <button
                    type="button"
                    onClick={onNext}
                    className="rounded-full border border-white/16 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-white transition hover:bg-white/10"
                  >
                    Image suivante
                  </button>
                </div>
              </aside>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    ,
    document.body
  );
}

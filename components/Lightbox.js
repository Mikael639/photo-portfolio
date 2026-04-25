"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

export default function Lightbox({ photos, activeIndex, onClose, onPrev, onNext }) {
  const [isZoomed, setIsZoomed] = useState(false);
  const constraintsRef = useRef(null);

  const activePhoto = activeIndex === null ? null : photos[activeIndex];
  const currentNum = activeIndex === null ? 0 : activeIndex + 1;
  const totalNum = photos.length;
  const progress = totalNum > 0 ? (currentNum / totalNum) * 100 : 0;

  // Reset zoom when photo changes
  useEffect(() => {
    setIsZoomed(false);
  }, [activeIndex]);


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
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-modal="true"
          aria-label="Visionneuse d'images"
          className="fixed inset-0 z-[100] bg-black h-screen w-screen overflow-hidden focus:outline-none"
          onClick={onClose}
          tabIndex={-1}
          autoFocus={true}
        >
          {/* ── Top Bar ──────────────────────────────────────────── */}
          <AnimatePresence>
            {!isZoomed && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-6 py-4 md:px-10 bg-gradient-to-b from-black/60 to-transparent"
              >

            {/* Logo / Studio name */}
            <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-white/30">
              Jerrypicsart
            </span>

            {/* Counter — editorial large number */}
            <div className="flex items-center gap-3">
              <span className="font-serif text-[clamp(1rem,2vw,1.4rem)] text-white/20 leading-none">
                {String(currentNum).padStart(2, "0")}
              </span>
              <span className="h-px w-8 bg-white/20" />
              <span className="text-[11px] uppercase tracking-[0.3em] text-white/40">
                {String(totalNum).padStart(2, "0")}
              </span>
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="group flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-white/40 transition hover:text-white"
            >
              <span className="h-px w-6 bg-white/30 transition group-hover:w-10 group-hover:bg-white duration-300" />
                Fermer
              </button>
            </motion.div>
            )}
          </AnimatePresence>

          {/* ── Progress bar ─────────────────────────────────────── */}
          <AnimatePresence>
            {!isZoomed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-[72px] inset-x-0 z-20 h-px w-full bg-white/8"
              >
                <motion.div
                  className="h-full bg-white/40"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Main image — full bleed, immersive ───────────────── */}
          <div 
            ref={constraintsRef}
            className={`absolute inset-0 z-10 flex items-center justify-center ${isZoomed ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"}`}
            onClick={(e) => {
              e.stopPropagation(); // Prevent click from reaching the root and closing the lightbox
              setIsZoomed(!isZoomed);
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activePhoto.id}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: isZoomed ? 2 : 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="relative h-full w-full"
                drag={isZoomed}
                dragConstraints={constraintsRef}
                dragElastic={0.1}
                // No onClick needed here, it bubbles up to the container
              >
                <Image
                  src={activePhoto.src}
                  alt={activePhoto.alt}
                  fill
                  className="object-contain pointer-events-none"
                  sizes="100vw"
                  quality={90}
                  unoptimized
                />
              </motion.div>
            </AnimatePresence>

            {/* Left / Right invisible click zones (only when not zoomed) */}
            {!isZoomed && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onPrev(); }}
                  className="absolute inset-y-0 left-0 w-1/4 cursor-w-resize focus:outline-none z-10"
                  aria-label="Image précédente"
                />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onNext(); }}
                  className="absolute inset-y-0 right-0 w-1/4 cursor-e-resize focus:outline-none z-10"
                  aria-label="Image suivante"
                />
              </>
            )}

            {/* Gradient bottom overlay for text legibility */}
            <AnimatePresence>
              {!isZoomed && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent z-10" 
                />
              )}
            </AnimatePresence>
          </div>

          {/* ── Film Strip Bottom Bar ─────────────────────────────── */}
          <AnimatePresence>
            {!isZoomed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-0 inset-x-0 z-20 flex items-center justify-between gap-6 px-6 py-5 md:px-10"
              >

            {/* Left — category + title (editorial) */}
            <div className="flex items-center gap-4 min-w-0">
              <div
                className="hidden md:flex items-center justify-center rounded-full border border-white/10 text-white/30 font-serif"
                style={{ width: 48, height: 48, fontSize: "1.1rem", flexShrink: 0 }}
              >
                {String(currentNum).padStart(2, "0")}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 truncate">
                  {activePhoto.category}
                </p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={activePhoto.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="mt-1 font-serif text-lg leading-tight text-white truncate max-w-[18rem] md:max-w-[28rem]"
                  >
                    {activePhoto.title}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            {/* Right — Arrow navigation */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={onPrev}
                className="group flex h-11 w-11 items-center justify-center rounded-full border border-white/14 text-white/60 transition hover:border-white/50 hover:text-white"
                aria-label="Image précédente"
              >
                {/* Arrow Left */}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition group-hover:-translate-x-0.5 duration-200">
                  <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={onNext}
                className="group flex h-11 w-11 items-center justify-center rounded-full border border-white/14 text-white/60 transition hover:border-white/50 hover:text-white"
                aria-label="Image suivante"
              >
                {/* Arrow Right */}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition group-hover:translate-x-0.5 duration-200">
                  <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </motion.div>
          )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

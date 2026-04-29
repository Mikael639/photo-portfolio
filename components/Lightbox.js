"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

const SWIPE_THRESHOLD = 50;

export default function Lightbox({ photos, activeIndex, onClose, onPrev, onNext, onSelect }) {
  const [zoomedPhotoId, setZoomedPhotoId] = useState(null);
  const constraintsRef = useRef(null);
  const touchStartRef = useRef(null);

  const activePhoto = activeIndex === null ? null : photos[activeIndex];
  const isZoomed = Boolean(activePhoto && zoomedPhotoId === activePhoto.id);
  const currentNum = activeIndex === null ? 0 : activeIndex + 1;
  const totalNum = photos.length;
  const progress = totalNum > 0 ? (currentNum / totalNum) * 100 : 0;

  const handleClose = useCallback(() => {
    setZoomedPhotoId(null);
    onClose();
  }, [onClose]);


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
      if (event.key === "Escape") handleClose();
      if (event.key === "ArrowLeft") onPrev();
      if (event.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, handleClose, onPrev, onNext]);

  // Handlers swipe tactile
  const handleTouchStart = useCallback((e) => {
    if (isZoomed || e.touches.length > 1) return;
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, [isZoomed]);

  const handleTouchEnd = useCallback((e) => {
    if (isZoomed || !touchStartRef.current || e.changedTouches.length > 1) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    // Ne naviguer que si le geste est principalement horizontal
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) onNext();
    else onPrev();
  }, [isZoomed, onNext, onPrev]);

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
          data-cursor-surface="dark"
          className="fixed inset-0 z-[100] h-screen w-screen overflow-hidden bg-[#050403] focus:outline-none"
          onClick={handleClose}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          tabIndex={-1}
          autoFocus={true}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.07),transparent_46%),linear-gradient(180deg,rgba(0,0,0,0.28),rgba(0,0,0,0)_34%,rgba(0,0,0,0.38))]" />
          <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] [background-size:120px_120px]" />
          {/* ── Top Bar ──────────────────────────────────────────── */}
          <AnimatePresence>
            {!isZoomed && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-5 py-4 md:px-10 bg-gradient-to-b from-black/70 to-transparent"
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
              onClick={handleClose}
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
              setZoomedPhotoId(isZoomed ? null : activePhoto.id);
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activePhoto.id}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: isZoomed ? 2 : 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="relative h-full w-full px-3 py-20 md:px-8 md:py-24"
                drag={isZoomed}
                dragConstraints={constraintsRef}
                dragElastic={0.1}
                // No onClick needed here, it bubbles up to the container
              >
                <Image
                  src={activePhoto.src}
                  alt={activePhoto.alt}
                  fill
                  className="object-contain pointer-events-none drop-shadow-[0_28px_90px_rgba(0,0,0,0.65)]"
                  sizes="100vw"
                  quality={90}
                />
              </motion.div>
            </AnimatePresence>

            {/* Left / Right invisible click zones (only when not zoomed) */}
            {!isZoomed && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onPrev(); }}
                  className="absolute inset-y-0 left-0 z-10 flex w-1/4 cursor-w-resize items-center justify-start pl-4 text-white/0 transition focus:outline-none hover:text-white/70 md:pl-10"
                  aria-label="Image précédente"
                >
                  <span className="hidden h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-black/20 backdrop-blur-md md:flex">
                    <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
                      <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onNext(); }}
                  className="absolute inset-y-0 right-0 z-10 flex w-1/4 cursor-e-resize items-center justify-end pr-4 text-white/0 transition focus:outline-none hover:text-white/70 md:pr-10"
                  aria-label="Image suivante"
                >
                  <span className="hidden h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-black/20 backdrop-blur-md md:flex">
                    <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
                      <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
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

            <div className="flex items-center gap-4 min-w-0">
              <div
                className="hidden md:flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/34 font-serif backdrop-blur-md"
                style={{ width: 48, height: 48, fontSize: "1.1rem", flexShrink: 0 }}
              >
                {String(currentNum).padStart(2, "0")}
              </div>
            </div>

            {/* Right — Arrow navigation */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onPrev();
                }}
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
                onClick={(event) => {
                  event.stopPropagation();
                  onNext();
                }}
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

          <AnimatePresence>
            {!isZoomed && photos.length > 1 ? (
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-24 right-6 top-24 z-30 hidden w-24 rounded-2xl border border-white/10 bg-black/[0.08] shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-[6px] md:block xl:right-10"
                onClick={(event) => event.stopPropagation()}
              >
                {/* Masques de dégradé pour le scroll horizontal */}
                <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-black/35 to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-black/35 to-transparent" />
                
                <div className="no-scrollbar flex h-full flex-col gap-3 overflow-y-auto px-2 py-8">
                {photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => onSelect?.(index)}
                    className={`relative h-14 w-full shrink-0 overflow-hidden rounded-lg border bg-black/10 transition duration-300 ${
                      index === activeIndex
                        ? "border-white/85 opacity-100 shadow-[0_0_0_1px_rgba(255,255,255,0.2)]"
                        : "border-white/14 opacity-70 hover:border-white/55 hover:opacity-100"
                    }`}
                    aria-label={`Afficher ${photo.title}`}
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt || photo.title}
                      fill
                      sizes="96px"
                      quality={75}
                      className="object-cover"
                      style={{ objectPosition: photo.objectPosition || "center center" }}
                    />
                  </button>
                ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

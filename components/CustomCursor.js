"use client";

import { useEffect, useEffectEvent, useRef, useState, useSyncExternalStore } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

const interactiveSelector = [
  "a[href]",
  "button",
  "[role='button']",
  "summary",
  "label[for]",
  "input[type='submit']",
  "input[type='button']",
  "input[type='checkbox']",
  "input[type='radio']",
].join(", ");

const textInputSelector = [
  "input:not([type='submit']):not([type='button']):not([type='checkbox']):not([type='radio'])",
  "textarea",
  "[contenteditable='true']",
].join(", ");

const galleryItemSelector = "[data-cursor='gallery-item']";

function getCursorMode(target) {
  if (!(target instanceof Element)) {
    return "default";
  }

  if (target.closest(textInputSelector)) {
    return "hidden";
  }

  if (target.closest(galleryItemSelector)) {
    return "gallery-item";
  }

  if (target.closest(interactiveSelector)) {
    return "interactive";
  }

  return "default";
}

function subscribeToFinePointerQuery(onStoreChange) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  mediaQuery.addEventListener("change", onStoreChange);

  return () => {
    mediaQuery.removeEventListener("change", onStoreChange);
  };
}

function getFinePointerSnapshot() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export default function CustomCursor() {
  const reduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [cursorMode, setCursorMode] = useState("default");
  const stateRef = useRef(cursorMode);
  const supportsFinePointer = useSyncExternalStore(subscribeToFinePointerQuery, getFinePointerSnapshot, () => false);
  const isEnabled = supportsFinePointer && !reduceMotion;
  const x = useMotionValue(-120);
  const y = useMotionValue(-120);
  const springX = useSpring(x, { stiffness: 540, damping: 34, mass: 0.22 });
  const springY = useSpring(y, { stiffness: 540, damping: 34, mass: 0.22 });

  const syncCursorState = useEffectEvent((target) => {
    const nextState = getCursorMode(target);
    const currentState = stateRef.current;

    if (currentState === nextState) {
      return;
    }

    stateRef.current = nextState;
    setCursorMode(nextState);
  });

  const handlePointerMove = useEffectEvent((event) => {
    if (event.pointerType && event.pointerType !== "mouse") return;

    x.set(event.clientX);
    y.set(event.clientY);

    if (!isVisible) {
      setIsVisible(true);
    }

    syncCursorState(event.target);
  });

  const handlePointerDown = useEffectEvent((event) => {
    if (event.pointerType && event.pointerType !== "mouse") return;
    setIsPressed(true);
    syncCursorState(event.target);
  });

  const handlePointerUp = useEffectEvent((event) => {
    if (event.pointerType && event.pointerType !== "mouse") return;
    setIsPressed(false);
    syncCursorState(event.target);
  });

  const handlePointerLeave = useEffectEvent(() => {
    setIsVisible(false);
    setIsPressed(false);
    stateRef.current = "default";
    setCursorMode("default");
  });

  useEffect(() => {
    document.documentElement.classList.toggle("has-custom-cursor", isEnabled);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [isEnabled]);

  useEffect(() => {
    if (!isEnabled) return;

    const handleWindowMouseOut = (event) => {
      if (!event.relatedTarget && !event.toElement) {
        handlePointerLeave();
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("blur", handlePointerLeave);
    window.addEventListener("mouseout", handleWindowMouseOut);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("blur", handlePointerLeave);
      window.removeEventListener("mouseout", handleWindowMouseOut);
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  const isInteractive = cursorMode === "interactive";
  const isGalleryItem = cursorMode === "gallery-item";
  const shouldHide = !isVisible || cursorMode === "hidden";
  
  // Adjusted sizes for the gallery item to fit the text "VOIR"
  const ringSize = isGalleryItem ? 80 : isInteractive ? 46 : 28;
  const glowSize = isGalleryItem ? 100 : isInteractive ? 72 : 40;
  const dotSize = isGalleryItem ? 0 : isInteractive ? 6 : 4;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[120] hidden md:block"
      style={{
        x: springX,
        y: springY,
        translateX: "-50%",
        translateY: "-50%",
      }}
      animate={{
        opacity: shouldHide ? 0 : 1,
        scale: shouldHide ? 0.72 : 1,
      }}
      transition={{
        duration: reduceMotion ? 0 : 0.18,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <motion.div
        className="relative flex items-center justify-center"
        animate={{
          scale: isInteractive ? (isPressed ? 0.94 : 1.06) : isPressed ? 0.88 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 380,
          damping: 26,
          mass: 0.18,
        }}
      >
        <motion.div
          className="absolute rounded-full blur-[16px]"
          animate={{
            width: glowSize,
            height: glowSize,
            background: isInteractive || isGalleryItem
              ? "radial-gradient(circle, rgba(231,211,190,0.42) 0%, rgba(185,143,111,0.18) 44%, rgba(185,143,111,0) 74%)"
              : "radial-gradient(circle, rgba(35,29,25,0.12) 0%, rgba(35,29,25,0.05) 52%, rgba(35,29,25,0) 76%)",
            opacity: isPressed ? 0.22 : (isInteractive || isGalleryItem) ? 0.72 : 0.42,
            scale: (isInteractive || isGalleryItem) ? (isPressed ? 0.94 : 1.03) : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 320,
            damping: 28,
            mass: 0.22,
          }}
        />

        <motion.div
          className="absolute rounded-full border"
          animate={{
            width: ringSize,
            height: ringSize,
            borderColor: (isInteractive || isGalleryItem) ? "rgba(167, 126, 97, 0.96)" : "rgba(35, 29, 25, 0.72)",
            backgroundColor: isGalleryItem ? "rgba(167, 126, 97, 0.96)" : isInteractive ? "rgba(245, 239, 230, 0.08)" : "rgba(245, 239, 230, 0.18)",
            boxShadow: (isInteractive || isGalleryItem)
              ? "0 0 0 1px rgba(245,239,230,0.58), 0 10px 28px rgba(12,10,8,0.16)"
              : "0 0 0 1px rgba(245,239,230,0.6), 0 6px 20px rgba(12,10,8,0.08)",
            scale: (isInteractive || isGalleryItem) ? (isPressed ? 0.96 : 1.02) : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 360,
            damping: 24,
            mass: 0.18,
          }}
        />

        <motion.div
          className="absolute rounded-full"
          animate={{
            width: dotSize,
            height: dotSize,
            backgroundColor: isInteractive ? "rgba(170, 129, 99, 0.98)" : "rgba(35, 29, 25, 0.94)",
            scale: isPressed ? 0.78 : 1,
            opacity: isGalleryItem ? 0 : isInteractive ? 0.96 : 0.9,
            boxShadow: isInteractive ? "0 0 10px rgba(226,198,173,0.34)" : "none",
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 24,
            mass: 0.14,
          }}
        />

        {isGalleryItem && (
          <motion.div
            className="absolute flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <span className="text-[10px] font-bold text-paper tracking-[0.2em] leading-none uppercase">Voir</span>
          </motion.div>
        )}

        {(isInteractive || isGalleryItem) ? (
          <motion.div
            className="absolute rounded-full border border-[rgba(245,239,230,0.45)]"
            animate={{
              width: isPressed ? 56 : 62,
              height: isPressed ? 56 : 62,
              opacity: isPressed ? 0.12 : 0.2,
              scale: isPressed ? 0.96 : 1.02,
            }}
            transition={{
              type: "spring",
              stiffness: 240,
              damping: 22,
              mass: 0.22,
            }}
          />
        ) : null}
      </motion.div>
    </motion.div>
  );
}

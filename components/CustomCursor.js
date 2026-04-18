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
  
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  
  // Ressort ultra-réactif et léger
  const springX = useSpring(x, { stiffness: 800, damping: 40, mass: 0.1 });
  const springY = useSpring(y, { stiffness: 800, damping: 40, mass: 0.1 });

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
  
  // Tailles du curseur
  const cursorSize = 
    isGalleryItem ? 84 : 
    isInteractive ? 48 : 
    24;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden md:flex items-center justify-center"
      style={{
        x: springX,
        y: springY,
        translateX: "-50%",
        translateY: "-50%",
      }}
      animate={{
        opacity: shouldHide ? 0 : 1,
      }}
      transition={{
        duration: reduceMotion ? 0 : 0.2,
        ease: "easeOut",
      }}
    >
      <motion.div
        className="rounded-full border border-ink/20 bg-ink/5 backdrop-blur-[6px] shadow-sm flex items-center justify-center"
        animate={{
          width: cursorSize,
          height: cursorSize,
          scale: isPressed ? 0.8 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 24,
          mass: 0.15,
        }}
      >
        {isGalleryItem && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="text-ink font-bold text-[10px] tracking-[0.2em] leading-none uppercase"
          >
            VOIR
          </motion.span>
        )}
      </motion.div>
    </motion.div>
  );
}

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

function getCursorMode(target) {
  if (!(target instanceof Element)) {
    return "default";
  }

  if (target.closest(textInputSelector)) {
    return "hidden";
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
  const shouldHide = !isVisible || cursorMode === "hidden";

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
            width: isInteractive ? 64 : 42,
            height: isInteractive ? 64 : 42,
            backgroundColor: isInteractive ? "rgba(217, 180, 155, 0.28)" : "rgba(255, 255, 255, 0.18)",
            opacity: isPressed ? 0.3 : isInteractive ? 0.75 : 0.58,
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
            width: isInteractive ? 42 : 28,
            height: isInteractive ? 42 : 28,
            borderColor: isInteractive ? "rgba(143, 90, 58, 0.32)" : "rgba(255, 255, 255, 0.52)",
            backgroundColor: isInteractive ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.02)",
            boxShadow: isInteractive
              ? "0 0 0 1px rgba(255,255,255,0.08), 0 8px 30px rgba(12,10,8,0.08)"
              : "0 0 0 1px rgba(255,255,255,0.04), 0 6px 24px rgba(12,10,8,0.05)",
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
            width: isInteractive ? 4 : 3,
            height: isInteractive ? 4 : 3,
            backgroundColor: isInteractive ? "rgba(143, 90, 58, 0.72)" : "rgba(255, 255, 255, 0.92)",
            scale: isPressed ? 0.7 : 1,
            opacity: isInteractive ? 0.9 : 0.72,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 24,
            mass: 0.14,
          }}
        />
      </motion.div>
    </motion.div>
  );
}

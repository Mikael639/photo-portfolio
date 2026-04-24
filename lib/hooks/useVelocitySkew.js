"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * A hook that returns a ref to be applied to an element (like an image)
 * to add a "liquid" skew effect based on scroll velocity.
 * 
 * @param {number} strength - How much skew to apply (default 0.1)
 * @param {number} maxSkew - Maximum skew in degrees (default 10)
 */
export function useVelocitySkew(strength = 0.1, maxSkew = 10) {
  const elementRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !elementRef.current) return;

    const element = elementRef.current;
    
    // Avoid GSAP's shorthand scale setter: some mobile browsers can receive
    // the expanded "scaleX,scaleY" token as an invalid DOM attribute name.
    const setTransform = (skew, scale) => {
      element.style.transform = `skewY(${skew}deg) scale(${scale})`;
    };

    const update = () => {
      const velocity = ScrollTrigger.getAll().reduce((max, st) => {
        return Math.max(max, Math.abs(st.getVelocity()));
      }, 0) || 0;

      // Normalize velocity (ScrollTrigger velocity can be high)
      const skewedVal = Math.min(Math.max((velocity / 1000) * strength, -maxSkew), maxSkew);
      const scaleVal = 1 + Math.abs(skewedVal / 100);

      setTransform(skewedVal, scaleVal);
    };

    // Add to GSAP ticker for smooth updates
    gsap.ticker.add(update);

    return () => {
      gsap.ticker.remove(update);
      // Reset
      element.style.transform = "";
    };
  }, [strength, maxSkew]);

  return elementRef;
}

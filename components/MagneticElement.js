"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";

/**
 * Composant qui rend un élément "magnétique" (attire le curseur).
 * @param {Object} props
 * @param {React.ReactNode} props.children - L'élément à rendre magnétique.
 * @param {number} props.strength - Force de l'attraction (0.2 par défaut).
 * @param {string} props.className - Classes CSS additionnelles.
 */
export default function MagneticElement({ children, strength = 0.35, className = "" }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();

    // Calculer la position relative au centre de l'élément
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);

    setPosition({ x: x * strength, y: y * strength });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 160, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  );
}

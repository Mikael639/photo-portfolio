"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomSelect({ 
  name, 
  options, 
  defaultValue, 
  label, 
  error,
  className = "" 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(defaultValue || options[0]);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    setSelectedValue(option);
    setIsOpen(false);
  };

  const toggleOpen = () => setIsOpen(!isOpen);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (isOpen) {
      const currentIndex = options.indexOf(selectedValue);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % options.length;
        setSelectedValue(options[nextIndex]);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + options.length) % options.length;
        setSelectedValue(options[prevIndex]);
      }
    }
  };

  return (
    <div className={`relative space-y-2 ${className}`} ref={containerRef}>
      {label && (
        <span className="text-[11px] uppercase tracking-[0.2em] text-ink/58 block">
          {label}
        </span>
      )}
      
      <input type="hidden" name={name} value={selectedValue} />
      
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 outline-none transition-all duration-300 ${
          isOpen 
            ? "border-accent bg-white shadow-sm ring-1 ring-accent/20" 
            : "border-line/18 bg-paper/88 hover:border-line/40"
        } ${error ? "border-red-400" : ""}`}
      >
        <span className="text-sm font-medium text-ink">{selectedValue}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-ink/40"
        >
          <ChevronDownIcon className="h-4 w-4" />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            role="listbox"
            className="absolute z-50 w-full overflow-hidden rounded-xl border border-line/15 bg-white/95 p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl"
          >
            {options.map((option) => (
              <li
                key={option}
                role="option"
                aria-selected={selectedValue === option}
                onClick={() => handleSelect(option)}
                className={`cursor-pointer rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  selectedValue === option
                    ? "bg-ink text-paper"
                    : "text-ink/80 hover:bg-ink/5"
                }`}
              >
                {option}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {error && <span className="text-xs text-red-700 block">{error}</span>}
    </div>
  );
}

function ChevronDownIcon({ className = "" }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );
}

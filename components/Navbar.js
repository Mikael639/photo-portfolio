"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { siteConfig } from "../lib/siteConfig";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (isOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-x-0 top-0 z-50 border-b border-line/20 bg-paper/70 backdrop-blur-xl"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-8">
        <Link href="/" className="font-serif text-xl tracking-wide text-ink">
          Jerrypicsart
        </Link>

        <div className="hidden items-center gap-1 rounded-full border border-line/20 bg-white/70 p-1 md:flex">
          {siteConfig.navigation.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-full px-3 py-1.5 text-sm transition ${
                  isActive ? "text-paper" : "text-ink/75 hover:text-ink"
                }`}
              >
                {isActive && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-ink" />}
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex items-center gap-2 rounded-full border border-line/20 bg-white/70 px-4 py-2 text-sm font-medium text-ink md:hidden"
        >
          <span>{isOpen ? "Fermer" : "Menu"}</span>
          <span
            aria-hidden="true"
            className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[10px] uppercase tracking-[0.2em] text-paper"
          >
            {isOpen ? "X" : "+"}
          </span>
        </button>
      </nav>

      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Fermer le menu"
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 top-[73px] bg-ink/16 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              id="mobile-navigation"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="border-t border-line/15 bg-paper/95 px-4 py-4 shadow-[0_24px_80px_rgba(12,10,8,0.08)] backdrop-blur-xl md:hidden"
            >
              <div className="mx-auto flex max-w-7xl flex-col gap-2">
                {siteConfig.navigation.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`rounded-[1.4rem] border px-4 py-3 text-base transition ${
                        isActive
                          ? "border-ink bg-ink text-paper"
                          : "border-line/15 bg-white/60 text-ink/75 hover:border-ink/40 hover:bg-white hover:text-ink"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}

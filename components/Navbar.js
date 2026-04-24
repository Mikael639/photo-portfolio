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
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1], 
        delay: pathname === "/" ? 2.2 : 0.4 
      }}
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

        <div className="hidden items-center gap-2 md:flex">
          {siteConfig.socialLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              aria-label={`${link.name} ${link.handle}`}
              title={`${link.name} ${link.handle}`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line/20 bg-white/65 text-ink/65 shadow-sm backdrop-blur-md transition hover:border-ink/20 hover:bg-white hover:text-ink"
            >
              <InstagramIcon className="h-4.5 w-4.5" />
            </a>
          ))}
        </div>

        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex items-center gap-3 rounded-full border border-line/20 bg-white/80 px-4 py-2 text-sm font-medium text-ink transition-all active:scale-95 md:hidden shadow-sm"
        >
          <span className="tracking-wide">{isOpen ? "Fermer" : "Menu"}</span>
          <span
            aria-hidden="true"
            className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[10px] uppercase font-bold text-paper"
          >
            {isOpen ? "✕" : "+"}
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
                      className={`flex items-center justify-between rounded-[1.2rem] border px-6 py-4 text-lg transition-all duration-300 ${
                        isActive
                          ? "border-ink bg-ink text-paper"
                          : "border-line/10 bg-white/40 text-ink/80 hover:border-ink/20 hover:bg-white hover:text-ink"
                      }`}
                    >
                      <span className="font-serif tracking-tight">{link.label}</span>
                      {isActive && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="h-1.5 w-1.5 rounded-full bg-paper" 
                        />
                      )}
                    </Link>
                  );
                })}
                {siteConfig.socialLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between rounded-[1.2rem] border border-line/10 bg-white/40 px-6 py-4 text-lg text-ink/80 transition-all duration-300 hover:border-ink/20 hover:bg-white hover:text-ink"
                  >
                    <span className="font-serif tracking-tight">{link.name}</span>
                    <span className="text-sm font-semibold">{link.handle}</span>
                  </a>
                ))}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}

function InstagramIcon({ className = "" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3.75" y="3.75" width="16.5" height="16.5" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16.8" cy="7.2" r="1.1" fill="currentColor" />
    </svg>
  );
}

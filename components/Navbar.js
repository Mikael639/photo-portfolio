"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { siteConfig } from "../lib/siteConfig";

const NAV_ICONS = {
  "/": HomeIcon,
  "/gallery": GridIcon,
  "/about": UserIcon,
  "/contact": MailIcon,
};

export default function Navbar() {
  const pathname = usePathname();
  const [isIdleOnHome, setIsIdleOnHome] = useState(false);
  const [isBarHidden, setIsBarHidden] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasIntroPlayed, setHasIntroPlayed] = useState(false);
  const isHome = pathname === "/";
  const shouldDimOnHome = isHome && isIdleOnHome;
  const isHeaderHiddenOnMobile = isMobile && isBarHidden;

  const mobileTabs = [
    ...siteConfig.navigation.map((link) => ({
      href: link.href,
      label: link.label,
      Icon: NAV_ICONS[link.href] || HomeIcon,
    })),
    ...siteConfig.socialLinks.map((link) => ({
      href: link.href,
      label: link.name,
      Icon: InstagramIcon,
      external: true,
    })),
  ];

  useEffect(() => {
    if (!isHome) {
      return undefined;
    }

    let timeoutId;

    function showNavigation() {
      setIsIdleOnHome(false);
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        if (window.innerWidth >= 768 && window.scrollY < window.innerHeight * 0.82) {
          setIsIdleOnHome(true);
        }
      }, 3200);
    }

    showNavigation();
    const events = ["mousemove", "mousedown", "touchstart", "keydown", "scroll"];
    events.forEach((eventName) => window.addEventListener(eventName, showNavigation, { passive: true }));

    return () => {
      window.clearTimeout(timeoutId);
      events.forEach((eventName) => window.removeEventListener(eventName, showNavigation));
    };
  }, [isHome]);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    function handleScroll() {
      const currentY = window.scrollY;
      if (currentY < 80) {
        setIsBarHidden(false);
      } else if (currentY > lastScrollY + 6) {
        setIsBarHidden(true);
      } else if (currentY < lastScrollY - 6) {
        setIsBarHidden(false);
      }
      lastScrollY = currentY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const updateIsMobile = () => setIsMobile(query.matches);
    updateIsMobile();
    query.addEventListener("change", updateIsMobile);
    return () => query.removeEventListener("change", updateIsMobile);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setHasIntroPlayed(true), 2600);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={
          isHeaderHiddenOnMobile
            ? { y: -90, opacity: 0 }
            : shouldDimOnHome
            ? { y: -18, opacity: 0.08 }
            : { y: 0, opacity: 1 }
        }
        transition={{
          duration: isHeaderHiddenOnMobile ? 0.4 : shouldDimOnHome ? 0.7 : 0.45,
          ease: [0.16, 1, 0.3, 1],
          delay: !hasIntroPlayed && isHome && !shouldDimOnHome ? 2.2 : 0.04,
        }}
        onMouseEnter={() => setIsIdleOnHome(false)}
        onFocusCapture={() => setIsIdleOnHome(false)}
        className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl transition-colors duration-500 ${
          shouldDimOnHome || isHeaderHiddenOnMobile
            ? "pointer-events-none border-transparent bg-paper/0"
            : "border-line/20 bg-paper/70"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link href="/" className="mx-auto font-serif text-xl tracking-wide text-ink md:mx-0">
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
        </nav>
      </motion.header>

      <motion.nav
        aria-label="Navigation mobile"
        initial={false}
        animate={{ y: isBarHidden ? 130 : 0, opacity: isBarHidden ? 0 : 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 md:hidden"
        style={{ paddingBottom: "max(0.9rem, env(safe-area-inset-bottom))" }}
      >
        <ul className="flex items-center gap-1 rounded-full border border-white/10 bg-ink/90 p-2 shadow-[0_18px_50px_rgba(12,10,8,0.45)] backdrop-blur-xl">
          {mobileTabs.map((tab) => {
            const isActive = !tab.external && pathname === tab.href;
            const tabClassName = `relative flex h-12 items-center justify-center gap-2 rounded-full transition-colors ${
              isActive ? "px-4 text-paper" : "w-12 text-paper/55 hover:text-paper/85"
            }`;
            const inner = (
              <>
                {isActive && (
                  <motion.span
                    layoutId="mobile-nav-pill"
                    className="absolute inset-0 rounded-full bg-paper/14"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <tab.Icon className="relative z-10 h-6 w-6 shrink-0" active={isActive} />
                {isActive ? (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25, delay: 0.05 }}
                    className="relative z-10 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.14em]"
                  >
                    {tab.label}
                  </motion.span>
                ) : null}
              </>
            );

            return (
              <motion.li key={tab.href} layout transition={{ type: "spring", stiffness: 420, damping: 34 }}>
                {tab.external ? (
                  <a href={tab.href} target="_blank" rel="noreferrer" aria-label={tab.label} className={tabClassName}>
                    {inner}
                  </a>
                ) : (
                  <Link href={tab.href} aria-label={tab.label} aria-current={isActive ? "page" : undefined} className={tabClassName}>
                    {inner}
                  </Link>
                )}
              </motion.li>
            );
          })}
        </ul>
      </motion.nav>
    </>
  );
}

function HomeIcon({ className = "", active = false }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4 11.4 12 4l8 7.4V19.5a1 1 0 0 1-1 1h-4.2v-5.4H9.2v5.4H5a1 1 0 0 1-1-1z" />
    </svg>
  );
}

function GridIcon({ className = "", active = false }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
    </svg>
  );
}

function UserIcon({ className = "", active = false }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="8" r="3.9" />
      <path d="M4.5 20c0-3.9 3.4-6 7.5-6s7.5 2.1 7.5 6" />
    </svg>
  );
}

function MailIcon({ className = "", active = false }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
      strokeLinecap="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="5" width="18" height="14" rx="2.4" />
      <path
        d="M4 7.5 12 13l8-5.5"
        stroke={active ? "var(--paper)" : "currentColor"}
        fill="none"
      />
    </svg>
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

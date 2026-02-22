"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const links = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-x-0 top-0 z-50 border-b border-line/20 bg-paper/70 backdrop-blur-xl"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <Link href="/" className="font-serif text-xl tracking-wide text-ink">
          Jerrypicsart
        </Link>

        <div className="flex items-center gap-1 rounded-full border border-line/20 bg-white/70 p-1">
          {links.map((link) => {
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
      </nav>
    </motion.header>
  );
}

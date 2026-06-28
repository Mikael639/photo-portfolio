"use client";

import Link from "next/link";
import { siteConfig } from "../lib/siteConfig";
import MagneticElement from "./MagneticElement";

function scrollToTop() {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export default function Footer() {
  const year = new Date().getFullYear();
  const instagram = siteConfig.socialLinks.find((link) => link.name === "Instagram");

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-ink text-paper">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(176,127,90,0.16),transparent_55%)]" />

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 md:px-8 md:pb-14 md:pt-24">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr] md:gap-10">
          <div className="space-y-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-paper/40">Portfolio</p>
            <p className="font-serif text-5xl leading-[0.95] tracking-[-0.03em] md:text-6xl">{siteConfig.name}</p>
            <p className="max-w-sm text-base leading-relaxed text-paper/60">
              Photographie éditoriale — mode, mariage haut de gamme, events et célébrités. Une image tenue,
              précise, mais jamais froide.
            </p>
            <MagneticElement strength={0.2}>
              <Link
                href="/contact"
                className="inline-block rounded-full bg-paper px-7 py-3.5 text-[12px] font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-accent hover:text-paper"
              >
                Parler d&apos;un projet
              </Link>
            </MagneticElement>
          </div>

          <nav aria-label="Navigation du pied de page" className="space-y-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-paper/40">Navigation</p>
            <ul className="space-y-3">
              {siteConfig.navigation.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-lg text-paper/70 transition-colors hover:text-accent-soft"
                  >
                    <span className="h-px w-0 bg-accent-soft transition-all duration-300 group-hover:w-5" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-paper/40">Suivre</p>
            {instagram ? (
              <a
                href={instagram.href}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-3 text-lg text-paper/70 transition-colors hover:text-accent-soft"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-paper/70 transition group-hover:border-accent-soft group-hover:text-accent-soft">
                  <InstagramIcon className="h-4.5 w-4.5" />
                </span>
                {instagram.handle}
              </a>
            ) : null}
            <p className="max-w-xs text-sm leading-relaxed text-paper/45">
              Disponible pour des projets en France et à l&apos;international. Réponse sous 24h à 48h.
            </p>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-[12px] uppercase tracking-[0.18em] text-paper/40 md:flex-row md:items-center md:justify-between">
          <p>© {year} {siteConfig.name}. Tous droits réservés.</p>
          <button
            type="button"
            onClick={scrollToTop}
            className="group inline-flex items-center gap-2 self-start text-paper/55 transition-colors hover:text-paper md:self-auto"
          >
            Retour en haut
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-y-0.5">↑</span>
          </button>
        </div>
      </div>
    </footer>
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

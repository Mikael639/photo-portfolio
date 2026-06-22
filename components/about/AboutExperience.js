"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import MagneticElement from "../MagneticElement";
import { defaultAboutCopy } from "../../lib/siteSettings";

function getRevealProps(reduceMotion, delay = 0, amount = 0.22) {
  if (reduceMotion) {
    return {
      viewport: { once: true, amount },
    };
  }

  return {
    initial: { opacity: 0, y: 32 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount },
    transition: {
      duration: 0.8,
      delay,
      ease: [0.16, 1, 0.3, 1],
    },
  };
}

function PortraitPanel({ photo, className = "", imageClassName = "", sizes, priority = false }) {
  return (
    <div className={`relative overflow-hidden bg-ink shadow-[0_32px_96px_rgba(12,10,8,0.14)] ${className}`}>
      <Image
        src={photo.src || photo}
        alt={photo.alt || "Portrait Jerrypicsart"}
        fill
        priority={priority}
        sizes={sizes}
        className={`object-cover ${imageClassName}`}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,8,0),rgba(12,10,8,0.28))]" />
    </div>
  );
}

export default function AboutExperience({ aboutCopy = defaultAboutCopy }) {
  const reduceMotion = useReducedMotion();
  const {
    headline,
    subheadline,
    storyTitle,
    storyParagraphs,
    values,
    manifestoTitle,
    manifestoText,
    portraitPhoto,
    profilePhoto,
    convictionTitle,
    convictionText,
  } = aboutCopy;

  const portrait = typeof portraitPhoto === "string" ? { src: portraitPhoto, alt: "Portrait Jerrypicsart" } : portraitPhoto;
  const profile = typeof profilePhoto === "string" ? { src: profilePhoto, alt: "Profile Jerrypicsart" } : profilePhoto;

  return (
    <div data-page="about" className="page-shell mx-auto space-y-20 bg-paper pb-20 text-ink md:space-y-32">
      <div className="bg-paper pt-12">
        <section className="mx-auto max-w-7xl px-4 md:px-8 grid min-h-[calc(100vh-8rem)] gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-end pb-20">
          <motion.div className="space-y-8 pb-2" {...getRevealProps(reduceMotion)}>
            <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-ink/50">Derrière l&apos;objectif</p>
            <h1 className="max-w-4xl font-serif text-5xl leading-[0.92] tracking-[-0.05em] md:text-7xl xl:text-8xl text-ink">
              {headline}
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-ink/72 md:text-xl">
              {subheadline}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <MagneticElement strength={0.25}>
                <Link
                  href="/gallery"
                  className="inline-block rounded-full bg-ink px-8 py-4 text-[13px] font-bold uppercase tracking-[0.2em] text-paper transition-colors hover:bg-accent"
                >
                  Voir la galerie
                </Link>
              </MagneticElement>
              <MagneticElement strength={0.15}>
                <Link
                  href="/contact"
                  className="inline-block rounded-full border border-line/20 px-8 py-4 text-[13px] font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:border-ink hover:bg-white"
                >
                  Parler d&apos;un projet
                </Link>
              </MagneticElement>
            </div>
          </motion.div>

          <motion.div className="relative" {...getRevealProps(reduceMotion, 0.1)}>
            <PortraitPanel
              photo={portrait}
              priority
              className="min-h-[34rem] rounded-panel border border-line/10 md:min-h-[46rem]"
              imageClassName="object-[58%_38%]"
              sizes="(max-width: 1024px) 100vw, 56vw"
            />
            <div className="absolute bottom-5 left-5 max-w-xs rounded-inset border border-white/12 bg-black/35 p-5 text-paper shadow-2xl backdrop-blur-md md:bottom-8 md:left-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/42">{convictionTitle}</p>
              <p className="mt-3 font-serif text-2xl leading-tight">
                {convictionText}
              </p>
            </div>
          </motion.div>
        </section>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-20 md:space-y-32">

      <section className="grid gap-10 border-y border-line/12 py-12 md:py-16 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <motion.div className="lg:sticky lg:top-28" {...getRevealProps(reduceMotion)}>
          <PortraitPanel
            photo={profile}
            priority
            className="min-h-[32rem] rounded-inset border border-line/10 bg-paper md:min-h-[42rem]"
            imageClassName="object-[55%_38%]"
            sizes="(max-width: 1024px) 100vw, 38vw"
          />
        </motion.div>

        <motion.div
          className="self-center lg:pl-8"
          {...getRevealProps(reduceMotion, 0.08)}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-ink/40">Parcours</p>
          <h2 className="mt-6 max-w-2xl font-serif text-4xl leading-[0.98] tracking-[-0.04em] text-ink md:text-6xl">
            {storyTitle}
          </h2>
          <div className="mt-8 max-w-2xl space-y-6 text-base leading-relaxed text-ink/68 md:text-lg">
            {storyParagraphs.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {values.map((item, index) => (
          <motion.div
            key={index}
            className="border-t border-line/16 pt-6"
            {...getRevealProps(reduceMotion, index * 0.08)}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-ink/38">
              {String(index + 1).padStart(2, "0")} / {item.label}
            </p>
            <p className="mt-5 text-base leading-relaxed text-ink/68 md:text-lg">{item.text}</p>
          </motion.div>
        ))}
      </section>

      <section className="overflow-hidden rounded-feature border border-line/12 bg-[linear-gradient(135deg,rgba(18,15,12,0.98),rgba(29,33,41,0.96))] p-8 text-paper shadow-[0_32px_96px_rgba(12,10,8,0.18)] md:p-12 lg:p-16">
        <motion.div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center" {...getRevealProps(reduceMotion)}>
          <div className="space-y-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-paper/40">Manifeste</p>
            <h2 className="max-w-4xl font-serif text-4xl leading-[0.94] tracking-[-0.05em] md:text-7xl">
              {manifestoTitle}
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-paper/70 md:text-xl">
              {manifestoText}
            </p>
          </div>

          <div className="flex flex-wrap gap-5">
            <MagneticElement strength={0.25}>
              <Link
                href="/contact"
                className="inline-block rounded-full bg-paper px-8 py-4 text-[13px] font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-accent hover:text-paper"
              >
                Demander une date
              </Link>
            </MagneticElement>
            <MagneticElement strength={0.15}>
              <Link
                href="/gallery"
                className="inline-block rounded-full border border-paper/20 px-8 py-4 text-[13px] font-bold uppercase tracking-[0.2em] text-paper transition-all hover:border-paper hover:bg-white/10"
              >
                Revoir le portfolio
              </Link>
            </MagneticElement>
          </div>
        </motion.div>
        </section>
      </div>
    </div>
  );
}

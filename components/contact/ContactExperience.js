"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import ContactForm from "../ContactForm";

const notes = [
  {
    title: "Ce qui aide",
    description: "La date, le lieu, le type de prestation et l'intention generale suffisent pour cadrer vite.",
  },
  {
    title: "Reponse",
    description: "Le formulaire reste le meilleur point d'entree pour recevoir une reponse claire et exploitable.",
  },
  {
    title: "Univers",
    description: "Mode, mariages, eglises, concerts ou commande plus ouverte: tout commence par un brief simple.",
  },
];

function getRevealProps(reduceMotion, delay = 0, amount = 0.22) {
  if (reduceMotion) {
    return {
      viewport: { once: true, amount },
    };
  }

  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount },
    transition: {
      duration: 0.68,
      delay,
      ease: [0.22, 1, 0.36, 1],
    },
  };
}

function PhotoPanel({ photo, className = "", sizes }) {
  if (!photo) {
    return <div className={`rounded-[2rem] border border-line/15 bg-white/50 ${className}`} />;
  }

  return (
    <div className={`relative overflow-hidden rounded-[2rem] border border-line/15 bg-ink ${className}`}>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        className="object-cover"
        style={{ objectPosition: photo.objectPosition || "center center" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,8,0.08),rgba(12,10,8,0.72))]" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-paper md:p-6">
        <p className="text-[10px] uppercase tracking-[0.24em] text-paper/56">{photo.category}</p>
        <p className="mt-1 font-serif text-2xl leading-tight">{photo.title}</p>
      </div>
    </div>
  );
}

export default function ContactExperience({ leadPhoto, secondaryPhoto }) {
  const reduceMotion = useReducedMotion();

  return (
    <div data-page="contact" className="page-shell mx-auto max-w-7xl space-y-14 px-4 pb-14 pt-10 md:space-y-20 md:px-8">
      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <motion.div className="space-y-5" {...getRevealProps(reduceMotion)}>
          <p className="text-[11px] uppercase tracking-[0.28em] text-ink/52">Contact</p>
          <h1 className="max-w-4xl font-serif text-5xl leading-[0.94] tracking-[-0.04em] md:text-7xl">
            Parlons d&apos;une date, d&apos;une serie ou d&apos;une commande.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-ink/74 md:text-lg">
            Quelques lignes claires suffisent pour poser la bonne direction. Le formulaire ci-dessous reste la facon la
            plus simple d&apos;ouvrir la conversation.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href="/gallery"
              className="rounded-full border border-line/20 px-6 py-3 text-sm uppercase tracking-[0.18em] text-ink transition hover:border-ink"
            >
              Revoir la galerie
            </Link>
          </div>
        </motion.div>

        <motion.div {...getRevealProps(reduceMotion, 0.08)}>
          <PhotoPanel photo={leadPhoto} className="min-h-[24rem] md:min-h-[40rem]" sizes="(max-width: 1024px) 100vw, 56vw" />
        </motion.div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <div className="space-y-5">
          {notes.map((item, index) => (
            <motion.div
              key={item.title}
              className="rounded-[1.8rem] border border-line/15 bg-white/58 p-6 shadow-[0_20px_60px_rgba(12,10,8,0.05)]"
              {...getRevealProps(reduceMotion, index * 0.05)}
            >
              <p className="text-[11px] uppercase tracking-[0.24em] text-ink/50">{item.title}</p>
              <p className="mt-4 font-serif text-3xl leading-tight">{item.title}</p>
              <p className="mt-4 text-sm leading-relaxed text-ink/72">{item.description}</p>
            </motion.div>
          ))}

          <motion.div {...getRevealProps(reduceMotion, 0.12)}>
            <PhotoPanel
              photo={secondaryPhoto}
              className="min-h-[22rem] md:min-h-[26rem]"
              sizes="(max-width: 1024px) 100vw, 38vw"
            />
          </motion.div>
        </div>

        <motion.div
          className="rounded-[2rem] border border-line/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,255,255,0.68))] p-4 shadow-[0_24px_80px_rgba(12,10,8,0.06)] md:p-5"
          {...getRevealProps(reduceMotion, 0.08)}
        >
          <ContactForm />
        </motion.div>
      </section>
    </div>
  );
}

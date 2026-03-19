"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const principles = [
  {
    title: "Presence",
    description: "Rester proche du moment sans l'alourdir, pour garder ce qui fait la justesse d'une image.",
  },
  {
    title: "Tenue",
    description: "Donner de la structure au cadre, a la lumiere et aux corps pour que la serie tienne dans le temps.",
  },
  {
    title: "Utilite",
    description: "Livrer des images desirables, mais aussi directement exploitables pour la communication.",
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
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,8,0.08),rgba(12,10,8,0.68))]" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-paper md:p-6">
        <p className="text-[10px] uppercase tracking-[0.24em] text-paper/56">{photo.category}</p>
        <p className="mt-1 font-serif text-2xl leading-tight">{photo.title}</p>
      </div>
    </div>
  );
}

export default function AboutExperience({ leadPhoto, secondaryPhoto, atmospherePhoto }) {
  const reduceMotion = useReducedMotion();

  return (
    <div data-page="about" className="page-shell mx-auto max-w-7xl space-y-16 px-4 pb-12 pt-10 md:space-y-24 md:px-8">
      <section className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
        <motion.div className="space-y-5" {...getRevealProps(reduceMotion)}>
          <p className="text-[11px] uppercase tracking-[0.28em] text-ink/52">A propos</p>
          <h1 className="max-w-4xl font-serif text-5xl leading-[0.94] tracking-[-0.04em] md:text-7xl">
            Une ecriture visuelle sobre, precise et pleinement humaine.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-ink/74 md:text-lg">
            Jerrypicsart photographie la mode, le mariage et l&apos;evenementiel avec une meme intention: donner de la
            tenue a l&apos;instant, sans enlever ce qui le rend vivant.
          </p>
          <p className="max-w-xl text-base leading-relaxed text-ink/66">
            Le regard reste editorial, mais l&apos;enjeu n&apos;est jamais de faire pose pour faire pose. Chaque image
            doit rester lisible, elegante et juste.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/gallery"
              className="rounded-full bg-ink px-6 py-3 text-sm uppercase tracking-[0.18em] text-paper transition hover:bg-accent"
            >
              Voir la galerie
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-line/20 px-6 py-3 text-sm uppercase tracking-[0.18em] text-ink transition hover:border-ink"
            >
              Parler d&apos;un projet
            </Link>
          </div>
        </motion.div>

        <motion.div {...getRevealProps(reduceMotion, 0.08)}>
          <PhotoPanel photo={leadPhoto} className="min-h-[24rem] md:min-h-[42rem]" sizes="(max-width: 1024px) 100vw, 56vw" />
        </motion.div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {principles.map((item, index) => (
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
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.92fr] lg:items-center">
        <motion.div
          className="rounded-[2rem] border border-line/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,255,255,0.62))] p-6 shadow-[0_24px_80px_rgba(12,10,8,0.06)] md:p-8"
          {...getRevealProps(reduceMotion)}
        >
          <p className="text-[11px] uppercase tracking-[0.26em] text-ink/50">Approche</p>
          <h2 className="mt-4 max-w-xl font-serif text-4xl leading-[0.98] tracking-[-0.03em] md:text-5xl">
            Travailler l&apos;allure sans perdre la verite du moment.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink/72 md:text-lg">
            En Fashion Week, cela veut dire garder la tension, la coupe, le rythme. En mariage, cela veut dire rester
            attentif aux regards, aux gestes, a la circulation de la lumiere et a la place des personnes dans le cadre.
          </p>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/66">
            Dans les deux cas, l&apos;objectif reste le meme: des images suffisamment fortes pour marquer, et
            suffisamment propres pour durer.
          </p>
        </motion.div>

        <motion.div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1" {...getRevealProps(reduceMotion, 0.06)}>
          <PhotoPanel
            photo={secondaryPhoto}
            className="min-h-[21rem] md:min-h-[27rem]"
            sizes="(max-width: 1024px) 100vw, 32vw"
          />
          <PhotoPanel
            photo={atmospherePhoto}
            className="min-h-[21rem] md:min-h-[27rem]"
            sizes="(max-width: 1024px) 100vw, 32vw"
          />
        </motion.div>
      </section>

      <section className="overflow-hidden rounded-[2.2rem] border border-line/15 bg-[linear-gradient(135deg,rgba(18,15,12,0.98),rgba(52,38,28,0.95))] p-6 text-paper shadow-[0_24px_80px_rgba(12,10,8,0.14)] md:p-8 lg:p-10">
        <motion.div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end" {...getRevealProps(reduceMotion)}>
          <div className="space-y-4">
            <p className="text-[11px] uppercase tracking-[0.28em] text-paper/56">Direction</p>
            <h2 className="max-w-3xl font-serif text-4xl leading-[0.96] tracking-[-0.04em] md:text-6xl">
              Une signature qui peut passer de l&apos;editorial a la celebration sans perdre sa ligne.
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-paper/74 md:text-lg">
              Si tu cherches des images nettes, elegantes et pensees comme une vraie serie, on peut construire quelque
              chose de tres simple, mais tres tenu.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="rounded-full bg-paper px-6 py-3 text-sm uppercase tracking-[0.18em] text-ink transition hover:bg-accent hover:text-paper"
            >
              Demander une date
            </Link>
            <Link
              href="/gallery"
              className="rounded-full border border-paper/24 px-6 py-3 text-sm uppercase tracking-[0.18em] text-paper transition hover:border-paper hover:bg-white/10"
            >
              Revoir le portfolio
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

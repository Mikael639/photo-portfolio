"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import MagneticElement from "../MagneticElement";

const profilePhoto = {
  src: "/images/about/jerrypicsart-profile-bw.jpeg",
  alt: "Portrait noir et blanc de Jerrypicsart",
};

const portraitPhoto = {
  src: "/images/about/jerrypicsart-portrait-blue.jpeg",
  alt: "Portrait studio de Jerrypicsart",
};

const storyParagraphs = [
  "Rien ne me prédestinait à ça. J'ai fait du marketing, du growth hacking. J'ai appris à comprendre les gens, à lire ce qui les fait vibrer, ce qui les fait choisir. Sans le savoir, je me préparais déjà.",
  "Et puis il y a eu ce feu. Pas une révélation soudaine. Plutôt quelque chose qui s'est imposé de l'intérieur, comme une évidence que j'avais longtemps ignorée. La photographie n'était pas un plan B. C'était ce vers quoi je revenais.",
  "Comme sur un terrain de basket, j'ai tout donné. Je me suis formé avec exigence, j'ai cultivé mon regard, j'ai construit un univers à la frontière de la mode et du mariage haut de gamme, là où l'esthétique ne doit jamais sacrifier l'émotion.",
  "Aujourd'hui, mon objectif se pose sur des couples, des célébrités, des instants intimes et des scènes plus visibles. Mais derrière chaque séance, ma conviction reste la même : chaque personne mérite d'être vue avec la même attention, la même exigence, la même humanité.",
];

const values = [
  {
    label: "Présence",
    text: "Voir la personne avant le statut, l'attitude avant la pose, la présence avant le décor.",
  },
  {
    label: "Tenue",
    text: "Construire des images propres, élégantes et maîtrisées, sans retirer la vie du moment.",
  },
  {
    label: "Émotion",
    text: "Garder une trace sincère, même lorsque l'image prend une dimension éditoriale.",
  },
];

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
        src={photo.src}
        alt={photo.alt}
        fill
        priority={priority}
        sizes={sizes}
        className={`object-cover ${imageClassName}`}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,8,0),rgba(12,10,8,0.28))]" />
    </div>
  );
}

export default function AboutExperience() {
  const reduceMotion = useReducedMotion();
  const headline = "Je photographie les personnes et les moments qui comptent.";

  return (
    <div data-page="about" className="page-shell mx-auto max-w-7xl space-y-20 px-4 pb-20 pt-12 md:space-y-32 md:px-8">
      <section className="grid min-h-[calc(100vh-8rem)] gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
        <motion.div className="space-y-8 pb-2" {...getRevealProps(reduceMotion)}>
          <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-ink/50">Derrière l&apos;objectif</p>
          <h1 className="max-w-4xl font-serif text-5xl leading-[0.92] tracking-[-0.05em] md:text-7xl xl:text-8xl">
            {headline}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-ink/72 md:text-xl">
            Un parcours inattendu et un regard bien à lui. Jerrypicsart construit une photographie à la frontière
            de la mode, du mariage haut de gamme, des events et des personnalités. Une image tenue, précise,
            mais jamais froide.
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
            photo={portraitPhoto}
            priority
            className="min-h-[34rem] rounded-[2.4rem] border border-line/10 md:min-h-[46rem]"
            imageClassName="object-[58%_38%]"
            sizes="(max-width: 1024px) 100vw, 56vw"
          />
          <div className="absolute bottom-5 left-5 max-w-xs rounded-[1.6rem] border border-white/12 bg-black/35 p-5 text-paper shadow-2xl backdrop-blur-md md:bottom-8 md:left-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/42">Conviction</p>
            <p className="mt-3 font-serif text-2xl leading-tight">
              Le statut change. L&apos;attention, jamais.
            </p>
          </div>
        </motion.div>
      </section>

      <section className="grid gap-10 border-y border-line/12 py-12 md:py-16 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <motion.div className="lg:sticky lg:top-28" {...getRevealProps(reduceMotion)}>
          <PortraitPanel
            photo={profilePhoto}
            priority
            className="min-h-[32rem] rounded-[1.6rem] border border-line/10 bg-paper md:min-h-[42rem]"
            imageClassName="object-[55%_38%]"
            sizes="(max-width: 1024px) 100vw, 38vw"
          />
        </motion.div>

        <motion.div
          className="self-center lg:pl-8"
          {...getRevealProps(reduceMotion, 0.08)}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-ink/40">Parcours</p>
          <h2 className="mt-6 max-w-2xl font-serif text-4xl leading-[0.98] tracking-[-0.04em] md:text-6xl">
            Avant l&apos;image, il y avait déjà l&apos;attention aux gens.
          </h2>
          <div className="mt-8 max-w-2xl space-y-6 text-base leading-relaxed text-ink/68 md:text-lg">
            {storyParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {values.map((item, index) => (
          <motion.div
            key={item.label}
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

      <section className="overflow-hidden rounded-[2.8rem] border border-line/12 bg-[linear-gradient(135deg,rgba(18,15,12,0.98),rgba(29,33,41,0.96))] p-8 text-paper shadow-[0_32px_96px_rgba(12,10,8,0.18)] md:p-12 lg:p-16">
        <motion.div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center" {...getRevealProps(reduceMotion)}>
          <div className="space-y-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-paper/40">Manifeste</p>
            <h2 className="max-w-4xl font-serif text-4xl leading-[0.94] tracking-[-0.05em] md:text-7xl">
              Chaque personne mérite d&apos;être vue avec attention.
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-paper/70 md:text-xl">
              Couples, célébrités, entrepreneurs, familles ou invités d&apos;un événement : le cadre change,
              mais l&apos;intention reste la même. Faire une image qui respecte la personne et élève le moment.
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
  );
}

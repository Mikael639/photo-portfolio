"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import MagneticElement from "../MagneticElement";
import { useState } from "react";

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

function PhotoPanel({ photo, className = "", sizes, reduceMotion }) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (reduceMotion) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;

    const rX = (y - 0.5) * 6;
    const rY = (x - 0.5) * -6;
    setRotate({ x: rX, y: rY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  if (!photo) {
    return <div className={`rounded-[2.2rem] border border-line/12 bg-white/40 ${className}`} />;
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-[2.2rem] border border-line/12 bg-ink shadow-[0_32px_96px_rgba(12,10,8,0.12)] transition-transform duration-500 ease-out ${className}`}
      style={{
        perspective: 1000,
        transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
      }}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-[2s] ease-out hover:scale-110"
        style={{ objectPosition: photo.objectPosition || "center center" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,8,0),rgba(12,10,8,0.78))]" />
      <div className="absolute inset-x-0 bottom-0 p-6 text-paper md:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-paper/50">{photo.category}</p>
        <p className="mt-2 font-serif text-2xl leading-tight md:text-3xl">{photo.title}</p>
      </div>
    </div>
  );
}

export default function AboutExperience({ leadPhoto, secondaryPhoto, atmospherePhoto }) {
  const reduceMotion = useReducedMotion();

  return (
    <div data-page="about" className="page-shell mx-auto max-w-7xl space-y-20 px-4 pb-20 pt-12 md:space-y-32 md:px-8">
      <section className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <motion.div className="space-y-6" {...getRevealProps(reduceMotion)}>
          <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-ink/50">A propos</p>
          <h1 className="max-w-4xl font-serif text-5xl leading-[0.92] tracking-[-0.05em] md:text-8xl">
            Une ecriture visuelle sobre et precise.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-ink/75 md:text-xl">
            Jerrypicsart photographie la mode, le mariage et l&apos;evenementiel avec une meme intention: donner de la
            tenue a l&apos;instant, sans enlever ce qui le rend vivant.
          </p>
          <p className="max-w-xl text-base leading-relaxed text-ink/60 md:text-lg">
            Le regard reste editorial, mais l&apos;enjeu n&apos;est jamais de faire pose pour faire pose. Chaque image
            doit rester lisible, elegante et juste.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
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

        <motion.div {...getRevealProps(reduceMotion, 0.1)}>
          <PhotoPanel
            photo={leadPhoto}
            className="min-h-[28rem] md:min-h-[44rem]"
            sizes="(max-width: 1024px) 100vw, 56vw"
            reduceMotion={reduceMotion}
          />
        </motion.div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {principles.map((item, index) => (
          <motion.div
            key={item.title}
            className="group rounded-[2.2rem] border border-line/12 bg-white/40 p-8 shadow-[0_24px_80px_rgba(12,10,8,0.04)] backdrop-blur-sm transition-colors hover:bg-white/60"
            {...getRevealProps(reduceMotion, index * 0.1)}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-ink/40 group-hover:text-ink/60 transition-colors">
              {String(index + 1).padStart(2, "0")}
            </p>
            <p className="mt-6 font-serif text-4xl leading-tight tracking-[-0.03em]">{item.title}</p>
            <p className="mt-4 text-base leading-relaxed text-ink/65">{item.description}</p>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <motion.div
          className="rounded-[2.5rem] border border-line/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.85),rgba(255,255,255,0.65))] p-8 shadow-[0_32px_96px_rgba(12,10,8,0.06)] backdrop-blur-md md:p-12"
          {...getRevealProps(reduceMotion)}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-ink/40">Approche</p>
          <h2 className="mt-6 max-w-xl font-serif text-4xl leading-[0.98] tracking-[-0.04em] md:text-6xl">
            Travailler l&apos;allure sans perdre la verite.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink/70 md:text-xl">
            En Fashion Week, cela veut dire garder la tension, la coupe, le rythme. En mariage, cela veut dire rester
            attentif aux regards, aux gestes, a la circulation de la lumiere.
          </p>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/55 md:text-lg">
            Des images suffisamment fortes pour marquer, et suffisamment propres pour durer.
          </p>
        </motion.div>

        <motion.div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1" {...getRevealProps(reduceMotion, 0.1)}>
          <PhotoPanel
            photo={secondaryPhoto}
            className="min-h-[22rem] md:min-h-[28rem]"
            sizes="(max-width: 1024px) 100vw, 32vw"
            reduceMotion={reduceMotion}
          />
          <PhotoPanel
            photo={atmospherePhoto}
            className="min-h-[22rem] md:min-h-[28rem]"
            sizes="(max-width: 1024px) 100vw, 32vw"
            reduceMotion={reduceMotion}
          />
        </motion.div>
      </section>

      <section className="overflow-hidden rounded-[2.8rem] border border-line/12 bg-[linear-gradient(135deg,rgba(18,15,12,0.98),rgba(52,38,28,0.95))] p-8 text-paper shadow-[0_32px_96px_rgba(12,10,8,0.18)] md:p-12 lg:p-16">
        <motion.div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center" {...getRevealProps(reduceMotion)}>
          <div className="space-y-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-paper/40">Direction</p>
            <h2 className="max-w-4xl font-serif text-4xl leading-[0.94] tracking-[-0.05em] md:text-7xl">
              Une signature qui peut passer de l&apos;editorial a la celebration.
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-paper/70 md:text-xl">
              Si tu cherches des images nettes, elegantes et pensees comme une vraie serie, on peut construire quelque
              chose de tres simple, mais tres tenu.
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

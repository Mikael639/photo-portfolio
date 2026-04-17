"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import ContactForm from "../ContactForm";
import MagneticElement from "../MagneticElement";
import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const notes = [
  {
    eyebrow: "Ce qui aide",
    title: "Date, lieu, intention",
    description: "Quelques infos claires suffisent pour cadrer vite et revenir avec une proposition concrete.",
  },
  {
    eyebrow: "Delai",
    title: "Retour en 24h a 48h",
    description: "Le formulaire reste le meilleur point d'entree pour recevoir une reponse claire et exploitable.",
  },
  {
    eyebrow: "Reference",
    title: "Un lien peut faire gagner du temps",
    description: "Pinterest, Instagram ou dossier press: une reference visuelle suffit souvent a poser le ton.",
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

    const rX = (y - 0.5) * 8;
    const rY = (x - 0.5) * -8;
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
        perspective: 1200,
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

export default function ContactExperience({ leadPhoto, secondaryPhoto }) {
  const reduceMotion = useReducedMotion();
  const headline = "Parlons d'une date ou d'une serie.";
  const headlineRef = useRef(null);

  useGSAP(() => {
    if (reduceMotion) return;
    
    gsap.fromTo(
      ".word-stagger",
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        stagger: 0.05,
        delay: 0.5,
      }
    );
  }, { scope: headlineRef });

  return (
    <div ref={headlineRef} data-page="contact" className="page-shell mx-auto max-w-7xl space-y-16 px-4 pb-20 pt-12 md:space-y-24 md:px-8">
      <section className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <motion.div className="space-y-6" {...getRevealProps(reduceMotion)}>
          <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-ink/50">Contact</p>
          <h1 className="max-w-4xl font-serif text-5xl leading-[0.92] tracking-[-0.05em] md:text-8xl flex flex-wrap gap-x-[0.2em] gap-y-2">
            {headline.split(" ").map((word, i) => (
              <span key={i} className="overflow-hidden inline-flex">
                <span className="word-stagger inline-block">{word}</span>
              </span>
            ))}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-ink/75 md:text-xl">
            Quelques lignes claires suffisent pour poser la bonne direction. Le formulaire ci-dessous reste la facon la
            plus simple d&apos;ouvrir la conversation.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <MagneticElement strength={0.2}>
              <a
                href="#contact-form"
                className="inline-block rounded-full bg-ink px-8 py-4 text-[13px] font-bold uppercase tracking-[0.2em] text-paper transition-colors hover:bg-accent"
              >
                Aller au formulaire
              </a>
            </MagneticElement>
            <MagneticElement strength={0.15}>
              <Link
                href="/gallery"
                className="inline-block rounded-full border border-line/20 px-8 py-4 text-[13px] font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:border-ink hover:bg-white"
              >
                Revoir la galerie
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

      <section className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <div className="space-y-6">
          {notes.map((item, index) => (
            <motion.div
              key={item.title}
              className="group rounded-[2.2rem] border border-line/12 bg-white/40 p-8 shadow-[0_24px_80px_rgba(12,10,8,0.04)] backdrop-blur-sm transition-colors hover:bg-white/60"
              {...getRevealProps(reduceMotion, index * 0.1)}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-ink/40 group-hover:text-ink/60 transition-colors">
                {item.eyebrow}
              </p>
              <p className="mt-4 font-serif text-3xl leading-tight tracking-[-0.03em]">{item.title}</p>
              <p className="mt-4 text-base leading-relaxed text-ink/65">{item.description}</p>
            </motion.div>
          ))}

          <motion.div {...getRevealProps(reduceMotion, 0.15)}>
            <PhotoPanel
              photo={secondaryPhoto}
              className="min-h-[22rem] md:min-h-[28rem]"
              sizes="(max-width: 1024px) 100vw, 38vw"
              reduceMotion={reduceMotion}
            />
          </motion.div>

          <motion.div
            className="rounded-[2.2rem] border border-line/12 bg-[var(--paper)] p-8 shadow-[0_24px_80px_rgba(12,10,8,0.04)] backdrop-blur-sm"
            {...getRevealProps(reduceMotion, 0.2)}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-ink/40 mb-6">Questions frequentes</p>
            <div className="space-y-4">
              <details className="group cursor-pointer border-b border-line/10 pb-4">
                <summary className="font-serif text-xl font-medium tracking-tight text-ink flex justify-between items-center outline-none">
                  Quels sont vos delais ?
                  <span className="text-ink/40 group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="mt-3 text-sm text-ink/70 leading-relaxed opacity-0 group-open:opacity-100 transition-opacity duration-300">Les premieres images (preview) sont envoyees sous 48h. L edit complet est livre en 2 a 3 semaines.</p>
              </details>
              <details className="group cursor-pointer border-b border-line/10 pb-4">
                <summary className="font-serif text-xl font-medium tracking-tight text-ink flex justify-between items-center outline-none">
                  Shootez-vous a l etranger ?
                  <span className="text-ink/40 group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="mt-3 text-sm text-ink/70 leading-relaxed opacity-0 group-open:opacity-100 transition-opacity duration-300">Oui. Paris est ma base, mais je me deplace regulierement en France et a l international. Les deplacements font l objet d une ligne separee sur le devis.</p>
              </details>
              <details className="group cursor-pointer">
                <summary className="font-serif text-xl font-medium tracking-tight text-ink flex justify-between items-center outline-none">
                  Comment est geree la retouche ?
                  <span className="text-ink/40 group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="mt-3 text-sm text-ink/70 leading-relaxed opacity-0 group-open:opacity-100 transition-opacity duration-300">Ma retouche se concentre sur la lumiere, la colorimetrie et la force de l image. Je ne denature jamais les personnes.</p>
              </details>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="rounded-[2.5rem] border border-line/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,255,255,0.68))] p-6 shadow-[0_32px_96px_rgba(12,10,8,0.08)] backdrop-blur-md md:p-10"
          {...getRevealProps(reduceMotion, 0.1)}
        >
          <div className="mb-6 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-ink/45">Demande</p>
            <p className="max-w-2xl text-sm leading-relaxed text-ink/62 md:text-base">
              Plus le brief est precis, plus le retour peut etre utile des le premier message.
            </p>
          </div>
          <ContactForm />
        </motion.div>
      </section>
    </div>
  );
}

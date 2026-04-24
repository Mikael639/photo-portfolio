"use client";

import { motion, useReducedMotion } from "framer-motion";
import ContactForm from "../ContactForm";
import MagneticElement from "../MagneticElement";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { siteConfig } from "../../lib/siteConfig";

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

export default function ContactExperience() {
  const reduceMotion = useReducedMotion();
  const headline = "Parlons d'une date ou d'une série.";
  const headlineRef = useRef(null);
  const instagram = siteConfig.socialLinks.find((link) => link.name === "Instagram");

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
      <section>
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
             Quelques lignes claires suffisent pour poser la bonne direction. Le formulaire ci-dessous reste la façon la
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
            {instagram ? (
              <MagneticElement strength={0.15}>
                <a
                  href={instagram.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block rounded-full border border-line/20 px-8 py-4 text-[13px] font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:border-ink hover:bg-white"
                >
                  {instagram.handle}
                </a>
              </MagneticElement>
            ) : null}
          </div>
        </motion.div>
      </section>

      <section className="space-y-8">
        <motion.div
          className="rounded-[2.5rem] border border-line/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,255,255,0.68))] p-6 shadow-[0_32px_96px_rgba(12,10,8,0.08)] backdrop-blur-md md:p-10"
          {...getRevealProps(reduceMotion, 0.1)}
        >
          <div className="mb-6 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-ink/45">Demande</p>
            <p className="max-w-2xl text-sm leading-relaxed text-ink/62 md:text-base">
               Plus le brief est précis, plus le retour peut être utile dès le premier message.
            </p>
          </div>
          <ContactForm />
        </motion.div>

        <motion.div
          className="rounded-[2.2rem] border border-line/12 bg-[var(--paper)] p-8 shadow-[0_24px_80px_rgba(12,10,8,0.04)] backdrop-blur-sm"
          {...getRevealProps(reduceMotion, 0.16)}
        >
           <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-ink/40 mb-6">Questions fréquentes</p>
          <div className="space-y-4">
            <details className="group cursor-pointer border-b border-line/10 pb-4">
              <summary className="font-serif text-xl font-medium tracking-tight text-ink flex justify-between items-center outline-none">
                 Quels sont vos délais ?
                 <span className="text-ink/40 group-open:rotate-180 transition-transform">↓</span>
              </summary>
               <p className="mt-3 text-sm text-ink/70 leading-relaxed opacity-0 group-open:opacity-100 transition-opacity duration-300">
                 Les premières images (preview) sont envoyées sous 48h. L&apos;édit complet est livré en 2 à 3 semaines.
               </p>
            </details>
            <details className="group cursor-pointer border-b border-line/10 pb-4">
              <summary className="font-serif text-xl font-medium tracking-tight text-ink flex justify-between items-center outline-none">
                 Shootez-vous à l&apos;étranger ?
                 <span className="text-ink/40 group-open:rotate-180 transition-transform">↓</span>
              </summary>
               <p className="mt-3 text-sm text-ink/70 leading-relaxed opacity-0 group-open:opacity-100 transition-opacity duration-300">
                 Oui. Paris est ma base, mais je me déplace régulièrement en France et à l&apos;international. Les déplacements
                 font l&apos;objet d&apos;une ligne séparée sur le devis.
               </p>
            </details>
            <details className="group cursor-pointer">
              <summary className="font-serif text-xl font-medium tracking-tight text-ink flex justify-between items-center outline-none">
                 Comment est gérée la retouche ?
                 <span className="text-ink/40 group-open:rotate-180 transition-transform">↓</span>
              </summary>
               <p className="mt-3 text-sm text-ink/70 leading-relaxed opacity-0 group-open:opacity-100 transition-opacity duration-300">
                 Ma retouche se concentre sur la lumière, la colorémétrie et la force de l&apos;image. Je ne dénature jamais
                 les personnes.
               </p>
            </details>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

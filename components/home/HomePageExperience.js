"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MagneticElement from "../MagneticElement";
import { MotionBlock, PhotoTile, specialties, getRevealProps, wordRevealVariant } from "./homeShared";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function HomePageExperience({
  heroPhoto,
  supportingPhotos,
  featuredPhotos,
  identityPhoto,
  servicesBackground,
  closingPhoto,
  categories,
  cinematicPool = [],
}) {
  const reduceMotion = useReducedMotion();
  const galleryCategories = categories.filter(Boolean).slice(0, 4);
  const marriageFeature =
    featuredPhotos.find((photo) => photo?.category === "Mariage") ||
    supportingPhotos.find((photo) => photo?.category === "Mariage") ||
    featuredPhotos[0];
  const cinematicPhotos = useMemo(() => {
    const seen = new Set();
    const orderedPhotos = [
      heroPhoto,
      ...cinematicPool,
      ...supportingPhotos,
      ...featuredPhotos,
    ];

    return orderedPhotos
      .filter((photo) => {
        if (!photo?.id || seen.has(photo.id)) return false;
        seen.add(photo.id);
        return true;
      })
      .slice(0, 18);
  }, [cinematicPool, featuredPhotos, heroPhoto, supportingPhotos]);
  const [shuffledPhotos, setShuffledPhotos] = useState(cinematicPhotos);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const activeHeroPhoto = shuffledPhotos[activeHeroIndex] || heroPhoto;
  const containerRef = useRef(null);

  useEffect(() => {
    const shuffle = (array) => {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    };

    const timeout = window.setTimeout(() => {
      const randomized = shuffle(cinematicPhotos);
      setShuffledPhotos(randomized);
      setActiveHeroIndex(Math.floor(Math.random() * randomized.length));
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [cinematicPhotos]);

  useGSAP(() => {
    if (reduceMotion) return;

    gsap.fromTo(".hero-image-container",
      { scale: 1.2, filter: "blur(10px)" },
      { scale: 1, filter: "blur(0px)", duration: 2.4, ease: "expo.out", delay: 0.5 }
    );

    gsap.fromTo(".hero-content-reveal",
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1.8, ease: "power4.out", delay: 1.5, stagger: 0.15 }
    );

    gsap.fromTo("header",
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "expo.out", delay: 2 },
      { forceWait: true }
    );

    const sections = gsap.utils.toArray("section.color-transition-section");
    sections.forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top center",
        end: "bottom center",
        onEnter: () => gsap.to(document.body, { backgroundColor: "#0c0a08", duration: 1 }),
        onLeaveBack: () => gsap.to(document.body, { backgroundColor: "#fefdfa", duration: 1 }),
      });
    });

    const parralaxImages = gsap.utils.toArray(".parallax-img");
    parralaxImages.forEach((img) => {
      gsap.to(img, {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
          trigger: img.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });
  }, { scope: containerRef });

  useEffect(() => {
    if (reduceMotion || shuffledPhotos.length < 2) return;

    const interval = window.setInterval(() => {
      setActiveHeroIndex((currentIndex) => (currentIndex + 1) % shuffledPhotos.length);
    }, 8400);

    return () => window.clearInterval(interval);
  }, [shuffledPhotos.length, reduceMotion]);

  return (
    <div ref={containerRef} data-page="home" className="page-shell -mt-20 space-y-20 pb-16 md:space-y-48">
      <section className="relative isolate min-h-screen overflow-hidden">
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeHeroPhoto.id}
              className="absolute inset-0 hero-image-container"
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 1.1, filter: "blur(8px)" }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98, filter: "blur(4px)" }}
              transition={reduceMotion ? undefined : { duration: 2, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src={activeHeroPhoto.src}
                alt={activeHeroPhoto.alt}
                fill
                priority
                sizes="100vw"
                className="object-cover sharpen-img"
                style={{ objectPosition: activeHeroPhoto.objectPosition || "center 16%" }}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,8,0.6)_0%,rgba(12,10,8,0.3)_30%,rgba(12,10,8,0.5)_65%,rgba(12,10,8,0.95)_100%)]" />
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.06),transparent_60%)]"
          animate={reduceMotion ? undefined : { opacity: [0.05, 0.12, 0.05] }}
          transition={reduceMotion ? undefined : { duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent via-paper/20 to-paper" />

        <div className="relative mx-auto grid min-h-screen max-w-7xl gap-12 px-4 pb-12 pt-28 md:px-8 md:pb-20 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
          <motion.div
            initial={reduceMotion ? false : "hidden"}
            whileInView={reduceMotion ? undefined : "show"}
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.08, delayChildren: 0.3 },
              },
            }}
            className="max-w-4xl text-paper"
          >
            <motion.p
              variants={wordRevealVariant}
              className="text-[11px] font-semibold uppercase tracking-[0.4em] text-paper/60"
            >
              Jerrypicsart portfolio éditorial
            </motion.p>

            <motion.div variants={wordRevealVariant} className="mt-8 flex flex-wrap gap-3 hero-content-reveal">
              <MagneticElement strength={0.25}>
                <Link
                  href="/gallery"
                  className="inline-block rounded-full bg-paper px-8 py-4 text-[13px] font-bold uppercase tracking-[0.22em] text-ink transition-colors hover:bg-accent hover:text-paper shadow-2xl"
                >
                  Explorer l&apos;édit
                </Link>
              </MagneticElement>
              <MagneticElement strength={0.15}>
                <Link
                  href="/contact"
                  className="inline-block rounded-full border border-paper/30 px-8 py-4 text-[13px] font-bold uppercase tracking-[0.22em] text-paper backdrop-blur-md transition-all hover:border-paper hover:bg-paper/10"
                >
                  Parler d&apos;une date
                </Link>
              </MagneticElement>
            </motion.div>

            {galleryCategories.length ? (
              <motion.div variants={wordRevealVariant} className="mt-6 flex flex-wrap gap-3">
                {galleryCategories.map((category) => (
                  <Link
                    key={category}
                    href={`/gallery?category=${encodeURIComponent(category)}`}
                    className="rounded-full border border-paper/20 bg-black/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-paper/78 backdrop-blur-md transition hover:border-paper/40 hover:bg-paper/10 hover:text-paper"
                  >
                    {category}
                  </Link>
                ))}
              </motion.div>
            ) : null}

            <motion.div
              variants={wordRevealVariant}
              className="mt-8 flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-[0.24em] text-paper/40"
            >
              <span className="h-px w-16 bg-paper/20" />
              <span>
                {activeHeroPhoto.category} / {activeHeroPhoto.title}
              </span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 40 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={reduceMotion ? undefined : { duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 mb-8 hero-content-reveal opacity-0"
          >
            {supportingPhotos.map((photo) => (
              <div
                key={photo.id}
                className="relative min-h-[15rem] overflow-hidden rounded-[2.2rem] border border-white/10 bg-black/20 backdrop-blur-sm"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 1024px) 50vw, 22vw"
                  className="parallax-img object-cover sharpen-img transition-transform duration-1000 hover:scale-110 scale-[1.08]"
                  style={{ objectPosition: photo.objectPosition || "center center" }}
                  quality={90}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,8,0),rgba(12,10,8,0.78))]" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-paper">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-paper/50">{photo.category}</p>
                  <p className="mt-1 font-serif text-2xl leading-tight">{photo.title}</p>
                </div>
              </div>
            ))}

            <div className="rounded-[2.2rem] border border-white/10 bg-black/40 p-6 text-paper/90 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/40">Direction</p>
                {shuffledPhotos.length > 1 ? (
                  <div className="flex items-center gap-2">
                    {shuffledPhotos.slice(0, 5).map((photo, index) => (
                      <button
                        key={photo.id}
                        type="button"
                        aria-label={`Afficher ${photo.title}`}
                        onClick={() => setActiveHeroIndex(index)}
                        className={`h-1.5 rounded-full transition-all duration-500 ${activeHeroIndex === index ? "w-6 bg-paper/90" : "w-1.5 bg-paper/20 hover:bg-paper/40"
                          }`}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
              <p className="mt-4 font-serif text-2xl leading-tight text-paper">Luxe discret, intensité juste.</p>
              <p className="mt-4 text-sm leading-relaxed text-paper/70">
                Des silhouettes fortes, des réceptions habitées et une retouche qui reste au service des personnes,
                des lieux et du rythme.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {marriageFeature ? (
        <section className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr] xl:items-start">
            <PhotoTile
              photo={marriageFeature}
              className="mx-auto min-h-[42rem] w-full max-w-3xl xl:mx-0 xl:max-w-none lg:min-h-[56rem]"
              sizes="(max-width: 1280px) 100vw, 42vw"
              reduceMotion={reduceMotion}
              imagePosition="center 22%"
            />

            <MotionBlock
              reduceMotion={reduceMotion}
              delay={0.12}
              className="self-start rounded-[2.5rem] border border-line/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,255,255,0.56))] p-8 shadow-[0_32px_96px_rgba(12,10,8,0.04)] backdrop-blur-md md:p-10 lg:p-12"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-ink/40">Mariage</p>
              <h3 className="mt-5 max-w-lg font-serif text-3xl leading-[1.02] tracking-[-0.04em] md:text-5xl">
                Une élégance tenue, des images pensées pour durer.
              </h3>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/60 md:text-lg">
                Entre allure, émotion et présence, chaque image cherche un équilibre sobre, fort et intemporel.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <MagneticElement strength={0.15}>
                  <Link
                    href="/gallery?category=Mariage"
                    className="inline-block rounded-full border border-line/20 px-6 py-3 text-[12px] font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:border-ink hover:bg-white"
                  >
                    Voir l&apos;édit complet
                  </Link>
                </MagneticElement>
                <MagneticElement strength={0.2}>
                  <Link
                    href="/contact"
                    className="inline-block rounded-full bg-ink px-6 py-3 text-[12px] font-bold uppercase tracking-[0.2em] text-paper transition-colors hover:bg-accent"
                  >
                    Réserver une date
                  </Link>
                </MagneticElement>
              </div>
            </MotionBlock>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 md:px-8 color-transition-section">
        <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <MotionBlock reduceMotion={reduceMotion} className="space-y-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-paper/55">Approche</p>
            <h2 className="max-w-2xl font-serif text-5xl leading-[0.96] tracking-[-0.04em] text-paper md:text-7xl">
              De la silhouette au moment partagé.
            </h2>
            <div className="space-y-6">
              <p className="max-w-xl text-base leading-relaxed text-paper/82 md:text-xl">
                Jerrypicsart travaille la mode et le mariage avec une même ligne&nbsp;: de la tenue, de la
                clarté et une vraie sensation de présence.
              </p>
              <p className="max-w-xl text-base leading-relaxed text-paper/68 md:text-lg">
                Chaque série cherche l&apos;équilibre entre désirabilité, respiration dans le cadre et finition
                éditoriale.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <MagneticElement strength={0.15}>
                <Link
                  href="/about"
                  className="inline-block rounded-full border border-paper/22 px-6 py-3 text-[12px] font-bold uppercase tracking-[0.2em] text-paper transition-colors hover:border-paper hover:bg-paper/10"
                >
                  Notre manifeste
                </Link>
              </MagneticElement>
              <MagneticElement strength={0.2}>
                <Link
                  href="/contact"
                  className="inline-block rounded-full bg-ink px-6 py-3 text-[12px] font-bold uppercase tracking-[0.2em] text-paper transition-colors hover:bg-accent"
                >
                  Envoyer un brief
                </Link>
              </MagneticElement>
            </div>
          </MotionBlock>

          <MotionBlock
            reduceMotion={reduceMotion}
            delay={0.15}
            className="relative min-h-[28rem] overflow-hidden rounded-[2.5rem] border border-line/10 bg-ink shadow-2xl lg:min-h-[40rem]"
          >
            <Image
              src={identityPhoto.src}
              alt={identityPhoto.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 54vw"
              className="parallax-img object-cover transition-transform duration-[2s] hover:scale-[1.05] scale-[1.15]"
              style={{ objectPosition: identityPhoto.objectPosition || "center center" }}
              quality={90}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,8,0),rgba(12,10,8,0.72))]" />
            <div className="absolute bottom-6 right-6 max-w-xs rounded-[1.8rem] border border-white/12 bg-black/40 p-6 text-paper shadow-2xl backdrop-blur-md md:bottom-10 md:right-10 md:p-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/40">Intention</p>
              <p className="mt-3 font-serif text-2xl leading-tight">L&apos;élégance vient du rythme, jamais du décoratif.</p>
            </div>
          </MotionBlock>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="relative overflow-hidden rounded-[2.8rem] border border-line/12 bg-ink text-paper shadow-2xl">
          <Image
            src={servicesBackground.src}
            alt={servicesBackground.alt}
            fill
            sizes="100vw"
            className="parallax-img object-cover opacity-60 transition-transform duration-[3s] hover:scale-[1.10] scale-[1.15]"
            style={{ objectPosition: servicesBackground.objectPosition || "center center" }}
            quality={90}
          />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(12,10,8,0.95),rgba(12,10,8,0.75)_50%,rgba(12,10,8,0.9))]" />

          <div className="relative grid gap-12 px-6 py-12 md:px-12 md:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <MotionBlock reduceMotion={reduceMotion} className="space-y-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-white/55">Expertises</p>
              <h2 className="max-w-xl font-serif text-4xl leading-[0.96] tracking-[-0.04em] md:text-6xl">
                Là où l&apos;image doit être à la fois belle, utile et mémorable.
              </h2>
              <p className="max-w-md text-base leading-relaxed text-paper/78 md:text-lg">
                De la Fashion Week aux réceptions privées, la même exigence visuelle s&apos;applique&nbsp;: clarté et
                sens du moment.
              </p>
            </MotionBlock>

            <div
              className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-black/20 backdrop-blur-md relative group-hover-within"
              onMouseMove={(e) => {
                const { left, top } = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - left;
                const y = e.clientY - top;
                e.currentTarget.style.setProperty("--x", `${x}px`);
                e.currentTarget.style.setProperty("--y", `${y}px`);
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 spotlight-bg"
                style={{
                  background: `radial-gradient(600px circle at var(--x) var(--y), rgba(255,255,255,0.06), transparent 40%)`,
                }}
              />

              <style jsx>{`
                .group-hover-within:hover .spotlight-bg {
                  opacity: 1;
                }
              `}</style>

              {specialties.map((item, index) => (
                <motion.div
                  key={item.title}
                  className="group grid gap-4 border-b border-white/5 px-6 py-8 last:border-b-0 hover:bg-white/5 transition-colors md:grid-cols-[auto_1fr_auto] md:items-start md:gap-8 md:px-10 overflow-hidden relative"
                  {...getRevealProps(reduceMotion, index * 0.12, 0.2)}
                >
                  <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/45 group-hover:text-white/75 transition-colors">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="space-y-3">
                    <p className="font-serif text-3xl text-paper">{item.title}</p>
                    <p className="max-w-xl text-sm leading-relaxed text-paper/78 md:text-base">{item.description}</p>
                  </div>
                  <span className="hidden text-[10px] font-bold uppercase tracking-[0.24em] text-white/45 md:block">
                    {item.focus}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="relative grid gap-10 overflow-hidden rounded-[3rem] border border-line/12 bg-[linear-gradient(135deg,#171310,#302720)] p-8 text-paper shadow-[0_48px_128px_rgba(12,10,8,0.2)] md:p-12 lg:grid-cols-[1fr_auto] lg:items-center lg:p-16">
          <MotionBlock reduceMotion={reduceMotion} className="space-y-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-white/40">Contact</p>
            <h2 className="max-w-3xl font-serif text-5xl leading-[0.94] tracking-[-0.05em] md:text-8xl">
              Travaillons ensemble.
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-paper/70 md:text-xl">
              Brief court ou projet complexe&nbsp;: parlons de votre vision et des besoins de votre série.
            </p>
            <div className="flex flex-wrap gap-5 pt-4">
              <MagneticElement strength={0.25}>
                <Link
                  href="/contact"
                  className="inline-block rounded-full bg-paper px-8 py-4 text-[13px] font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-accent hover:text-paper"
                >
                  Envoyer une demande
                </Link>
              </MagneticElement>
              <MagneticElement strength={0.15}>
                <Link
                  href="/gallery"
                  className="inline-block rounded-full border border-white/20 px-8 py-4 text-[13px] font-bold uppercase tracking-[0.2em] text-paper backdrop-blur-sm transition-all hover:bg-white/10"
                >
                  Parcourir l&apos;édit
                </Link>
              </MagneticElement>
            </div>
          </MotionBlock>

          <div className="grid gap-6 md:grid-cols-[1fr_260px] md:items-end">
            <MotionBlock
              reduceMotion={reduceMotion}
              delay={0.2}
              className="rounded-[2.2rem] border border-white/10 bg-white/5 p-8 text-paper/80 backdrop-blur-xl"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">Délais</p>
              <p className="mt-4 font-serif text-2xl leading-tight text-white">
                Réponse sous 24h à 48h.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-white/60">
                La clarté du brief permet d&apos;aller droit à l&apos;essentiel pour fixer une date.
              </p>
            </MotionBlock>

            <MotionBlock
              reduceMotion={reduceMotion}
              delay={0.3}
              className="relative min-h-[18rem] overflow-hidden rounded-[2.2rem] border border-white/10 bg-black/20"
            >
              <Image
                src={closingPhoto.src}
                alt={closingPhoto.alt}
                fill
                sizes="260px"
                className="object-cover transition-transform duration-[3s] hover:scale-125"
                style={{ objectPosition: closingPhoto.objectPosition || "center center" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-paper">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/40">{closingPhoto.category}</p>
                <p className="mt-1 font-serif text-xl leading-tight">{closingPhoto.title}</p>
              </div>
            </MotionBlock>
          </div>
        </div>
      </section>
    </div>
  );
}

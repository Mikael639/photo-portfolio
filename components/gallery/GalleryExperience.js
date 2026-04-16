"use client";

import { startTransition, useMemo, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lightbox from "../Lightbox";
import MagneticElement from "../MagneticElement";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const collectionStories = {
  Tout: "Une lecture continue entre mode, mariages, ceremonies et moments de scene.",
  "Fashion Week": "Des silhouettes, des details et des instants saisis avec une ecriture editoriale nette.",
  Mariage: "Des images pensees pour tenir dans le temps, entre emotion, allure et respiration.",
  Eglise: "Une presence discrete pour traduire la lumiere, la ferveur et la dimension collective.",
  Concert: "Une galerie construite autour de l'ambiance, de la presence scenique et de l'energie du lieu.",
};

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

function FilterButton({ category, isActive, onClick }) {
  return (
    <MagneticElement strength={0.15}>
      <button
        type="button"
        aria-pressed={isActive}
        onClick={onClick}
        className={`rounded-full border px-5 py-2.5 text-sm uppercase tracking-[0.16em] transition-all duration-300 md:px-6 ${
          isActive
            ? "border-ink bg-ink text-paper shadow-[0_12px_40px_rgba(12,10,8,0.18)]"
            : "border-line/20 bg-white/40 text-ink/60 hover:border-ink/40 hover:text-ink hover:bg-white"
        }`}
      >
        {category}
      </button>
    </MagneticElement>
  );
}

function GalleryCard({
  photo,
  index,
  onOpen,
  sizes,
  className = "",
  priority = false,
  reduceMotion,
  delay = 0,
}) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (reduceMotion) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;

    const rX = (y - 0.5) * 10;
    const rY = (x - 0.5) * -10;
    setRotate({ x: rX, y: rY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(index)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      data-cursor="gallery-item"
      className={`group relative block w-full overflow-hidden rounded-[2.2rem] border border-line/12 bg-ink text-left shadow-[0_32px_96px_rgba(12,10,8,0.12)] transition-transform duration-500 ease-out ${className}`}
      {...getRevealProps(reduceMotion, delay)}
      style={{
        perspective: 1200,
        transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
      }}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        priority={priority}
        sizes={sizes}
        className="parallax-gallery-img object-cover sharpen-img transition-transform duration-1000 ease-out group-hover:scale-[1.08] scale-[1.08]"
        style={{ objectPosition: photo.objectPosition || "center center" }}
        quality={85}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,8,0),rgba(12,10,8,0.1)_40%,rgba(12,10,8,0.85))] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative flex h-full flex-col justify-between p-6 md:p-8">
        <span className="w-fit rounded-full border border-white/12 bg-black/20 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-paper/75 backdrop-blur-md">
          {photo.category}
        </span>
        <div className="translate-y-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <p className="max-w-[20rem] font-serif text-[clamp(1.8rem,3vw,3rem)] leading-[0.92] tracking-[-0.04em] text-paper">
            {photo.title}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

export default function GalleryExperience({ photos, activeCategory, categories }) {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const router = useRouter();
  const activeFilter = activeCategory || "Tout";
  const [activeIndex, setActiveIndex] = useState(null);
  const containerRef = useRef(null);

  useGSAP(() => {
    if (reduceMotion) return;

    const parralaxImages = gsap.utils.toArray(".parallax-gallery-img");
    parralaxImages.forEach((img) => {
      gsap.to(img, {
        yPercent: 18,
        ease: "none",
        scrollTrigger: {
          trigger: img.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });
  }, { scope: containerRef, dependencies: [activeFilter, photos] });

  const leadPhoto = photos[0] || null;
  const secondaryPhotos = useMemo(
    () => photos.slice(1, 3).map((photo, index) => ({ photo, index: index + 1 })),
    [photos]
  );
  const galleryGridPhotos = useMemo(
    () => photos.slice(3).map((photo, index) => ({ photo, index: index + 3 })),
    [photos]
  );

  const collectionStory = collectionStories[activeFilter] || collectionStories.Tout;

  return (
    <div ref={containerRef} data-page="gallery" className="page-shell mx-auto max-w-7xl space-y-12 px-4 pb-20 pt-12 md:px-8 md:space-y-16">
      <header className="space-y-6">
        <motion.div className="max-w-4xl space-y-5" {...getRevealProps(reduceMotion)}>
          <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-ink/50">Galerie</p>
          <h1 className="max-w-4xl font-serif text-5xl leading-[0.92] tracking-[-0.05em] md:text-8xl">
            Une collection pensee comme un edit continu.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-ink/70 md:text-xl">{collectionStory}</p>
        </motion.div>
      </header>

      <motion.div className="flex flex-wrap gap-4" {...getRevealProps(reduceMotion, 0.1)}>
        {categories.map((category) => (
          <FilterButton
            key={category}
            category={category}
            isActive={category === activeFilter}
            onClick={() => {
              startTransition(() => {
                setActiveIndex(null);

                const params = new URLSearchParams();
                if (category !== "Tout") {
                  params.set("category", category);
                }

                const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
                router.replace(nextUrl, { scroll: false });
              });
            }}
          />
        ))}
      </motion.div>

      {photos.length === 0 ? (
        <div className="rounded-[2.5rem] border border-line/12 bg-white/60 p-12 text-center shadow-[0_32px_96px_rgba(12,10,8,0.06)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/40">Galerie vide</p>
          <p className="mt-6 font-serif text-4xl">Aucune image dans cette collection.</p>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink/60">
            Ajoute ou publie des photos depuis l&apos;admin pour faire vivre cette section.
          </p>
        </div>
      ) : null}

      {leadPhoto ? (
        <>
          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <GalleryCard
              photo={leadPhoto}
              index={0}
              onOpen={setActiveIndex}
              sizes="(max-width: 1280px) 100vw, 58vw"
              className="min-h-[30rem] lg:min-h-[44rem]"
              priority
              reduceMotion={reduceMotion}
            />

            <div className="grid gap-6">
              <motion.div
                className="rounded-[2.5rem] border border-line/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.85),rgba(255,255,255,0.65))] p-8 shadow-[0_32px_96px_rgba(12,10,8,0.06)] backdrop-blur-md md:p-10"
                {...getRevealProps(reduceMotion, 0.08)}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-ink/40">Edit maison</p>
                <h2 className="mt-5 max-w-lg font-serif text-3xl leading-[1] tracking-[-0.04em] md:text-5xl">
                  La galerie commence comme une prise de position.
                </h2>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/70 md:text-xl">
                  Les premieres images donnent le ton, puis la grille laisse les series et les
                  moments plus documentaires dialoguer librement.
                </p>
                <div className="mt-10 flex flex-wrap gap-4">
                  <MagneticElement strength={0.2}>
                    <Link
                      href="/contact"
                      className="inline-block rounded-full bg-ink px-7 py-3.5 text-sm font-bold uppercase tracking-[0.2em] text-paper transition-colors hover:bg-accent"
                    >
                      Demander une date
                    </Link>
                  </MagneticElement>
                  <MagneticElement strength={0.15}>
                    <button
                      type="button"
                      onClick={() => setActiveIndex(0)}
                      className="rounded-full border border-line/20 px-7 py-3.5 text-sm font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:border-ink hover:bg-white"
                    >
                      Ouvrir l&apos;image
                    </button>
                  </MagneticElement>
                </div>
              </motion.div>

              <div className="grid gap-6 sm:grid-cols-2">
                {secondaryPhotos.map(({ photo, index }, itemIndex) => (
                  <GalleryCard
                    key={photo.id}
                    photo={photo}
                    index={index}
                    onOpen={setActiveIndex}
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 24vw"
                    className="min-h-[22rem] md:min-h-[26rem]"
                    reduceMotion={reduceMotion}
                    delay={0.15 + itemIndex * 0.08}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-10">
            <motion.div
              className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
              {...getRevealProps(reduceMotion, 0.1)}
            >
              <div className="space-y-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-ink/40">Grille complete</p>
                <p className="max-w-2xl font-serif text-4xl leading-tight md:text-5xl">
                  Toutes les images publiees, sans filtre narratif.
                </p>
              </div>
              <p className="max-w-xl text-base leading-relaxed text-ink/60 md:text-lg">
                Une fois l&apos;edit pose, la grille laisse apparaitre le reste de la collection avec une lecture plus
                libre.
              </p>
            </motion.div>

            <div className="columns-1 gap-6 md:columns-2 xl:columns-3">
              {galleryGridPhotos.map(({ photo, index }, itemIndex) => (
                <GalleryCard
                  key={photo.id}
                  photo={photo}
                  index={index}
                  onOpen={setActiveIndex}
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className={`mb-6 min-h-[20rem] break-inside-avoid ${
                    itemIndex % 3 === 0
                      ? "h-[22rem] md:h-[28rem]"
                      : itemIndex % 3 === 1
                        ? "h-[28rem] md:h-[36rem]"
                        : "h-[24rem] md:h-[32rem]"
                  }`}
                  reduceMotion={reduceMotion}
                  delay={Math.min(itemIndex * 0.03, 0.28)}
                />
              ))}
            </div>
          </section>
        </>
      ) : null}

      <Lightbox
        photos={photos}
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(null)}
        onPrev={() => {
          if (activeIndex === null || photos.length === 0) return;
          setActiveIndex(activeIndex === 0 ? photos.length - 1 : activeIndex - 1);
        }}
        onNext={() => {
          if (activeIndex === null || photos.length === 0) return;
          setActiveIndex(activeIndex === photos.length - 1 ? 0 : activeIndex + 1);
        }}
      />
    </div>
  );
}

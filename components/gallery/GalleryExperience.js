"use client";

import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import Lightbox from "../Lightbox";
import { enhancePhotoPresentation } from "../../lib/photoPresentation";

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

function FilterButton({ category, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm uppercase tracking-[0.16em] transition md:px-5 ${
        isActive
          ? "border-ink bg-ink text-paper shadow-[0_10px_30px_rgba(12,10,8,0.12)]"
          : "border-line/30 bg-white/60 text-ink/72 hover:border-ink/40 hover:text-ink"
      }`}
    >
      {category}
    </button>
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
  return (
    <motion.button
      type="button"
      onClick={() => onOpen(index)}
      className={`group relative block w-full overflow-hidden rounded-[2rem] border border-line/15 bg-ink text-left shadow-[0_24px_80px_rgba(12,10,8,0.1)] ${className}`}
      {...getRevealProps(reduceMotion, delay)}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={reduceMotion ? undefined : { duration: 0.3, ease: "easeOut" }}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover transition duration-700 ease-out group-hover:scale-[1.025]"
        style={{ objectPosition: photo.objectPosition || "center center" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,8,0.08),rgba(12,10,8,0.18)_45%,rgba(12,10,8,0.82))]" />
      <div className="relative flex h-full flex-col justify-between p-5 md:p-6">
        <span className="w-fit rounded-full border border-white/14 bg-black/18 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-paper/68 backdrop-blur-sm">
          {photo.category}
        </span>
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-[0.24em] text-paper/52">Image choisie</p>
          <p className="max-w-[18rem] font-serif text-[clamp(1.5rem,2.6vw,2.5rem)] leading-[0.95] text-paper">
            {photo.title}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

function LoadingGrid() {
  return (
    <div className="columns-1 gap-5 md:columns-2 xl:columns-3">
      {Array.from({ length: 8 }, (_, index) => (
        <div
          key={`loading-${index}`}
          className={`mb-5 break-inside-avoid rounded-[2rem] border border-line/15 bg-white/60 ${
            index % 3 === 0 ? "h-[22rem]" : index % 3 === 1 ? "h-[28rem]" : "h-[24rem]"
          } animate-pulse`}
        />
      ))}
    </div>
  );
}

export default function GalleryExperience({ initialPhotos, categories }) {
  const reduceMotion = useReducedMotion();
  const [activeFilter, setActiveFilter] = useState("Tout");
  const [activeIndex, setActiveIndex] = useState(null);
  const [photos, setPhotos] = useState(initialPhotos);
  const [status, setStatus] = useState("success");
  const [errorMessage, setErrorMessage] = useState("");
  const cacheRef = useRef(new Map([["Tout", initialPhotos]]));

  useEffect(() => {
    let isMounted = true;

    if (cacheRef.current.has(activeFilter)) {
      const cachedPhotos = cacheRef.current.get(activeFilter) || [];
      setPhotos(cachedPhotos);
      setStatus("success");
      setErrorMessage("");
      return () => {
        isMounted = false;
      };
    }

    async function loadPhotos() {
      setStatus("loading");
      setErrorMessage("");

      try {
        const params = new URLSearchParams();
        if (activeFilter !== "Tout") {
          params.set("category", activeFilter);
        }

        const response = await fetch(`/api/photos?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
        });
        const result = await response.json();

        if (!response.ok || !result.ok) {
          throw new Error(result.message || "Impossible de charger la galerie.");
        }

        const nextPhotos = (result.data || []).map(enhancePhotoPresentation);
        cacheRef.current.set(activeFilter, nextPhotos);

        if (isMounted) {
          setPhotos(nextPhotos);
          setStatus("success");
        }
      } catch (error) {
        if (isMounted) {
          setStatus("error");
          setErrorMessage(error.message || "Erreur reseau.");
        }
      }
    }

    loadPhotos();

    return () => {
      isMounted = false;
    };
  }, [activeFilter]);

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
    <div data-page="gallery" className="page-shell mx-auto max-w-7xl space-y-10 px-4 pb-16 pt-10 md:px-8 md:space-y-14">
      <header className="space-y-4">
        <motion.div className="max-w-4xl space-y-4" {...getRevealProps(reduceMotion)}>
          <p className="text-[11px] uppercase tracking-[0.28em] text-ink/52">Galerie</p>
          <h1 className="max-w-4xl font-serif text-5xl leading-[0.94] tracking-[-0.04em] md:text-7xl">
            Une collection pensee comme un edit continu.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-ink/72 md:text-lg">{collectionStory}</p>
        </motion.div>
      </header>

      <motion.div className="flex flex-wrap gap-2.5" {...getRevealProps(reduceMotion, 0.08)}>
        {categories.map((category) => (
          <FilterButton
            key={category}
            category={category}
            isActive={category === activeFilter}
            onClick={() => {
              startTransition(() => {
                setActiveFilter(category);
                setActiveIndex(null);
              });
            }}
          />
        ))}
      </motion.div>

      {status === "error" ? (
        <div className="rounded-[2rem] border border-red-200 bg-red-50/80 p-6 text-red-800">
          <p className="text-[11px] uppercase tracking-[0.24em]">Erreur</p>
          <p className="mt-3 font-serif text-2xl">La galerie n&apos;a pas pu se charger.</p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed">{errorMessage}</p>
        </div>
      ) : null}

      {status === "loading" ? <LoadingGrid /> : null}

      {status === "success" && photos.length === 0 ? (
        <div className="rounded-[2rem] border border-line/15 bg-white/60 p-8 text-center shadow-[0_24px_80px_rgba(12,10,8,0.04)]">
          <p className="text-[11px] uppercase tracking-[0.24em] text-ink/50">Galerie vide</p>
          <p className="mt-4 font-serif text-3xl">Aucune image dans cette collection pour l&apos;instant.</p>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink/68">
            Ajoute ou publie des photos depuis l&apos;admin pour faire vivre cette section.
          </p>
        </div>
      ) : null}

      {status === "success" && leadPhoto ? (
        <>
          <section className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
            <GalleryCard
              photo={leadPhoto}
              index={0}
              onOpen={setActiveIndex}
              sizes="(max-width: 1280px) 100vw, 58vw"
              className="min-h-[28rem] lg:min-h-[42rem]"
              priority
              reduceMotion={reduceMotion}
            />

            <div className="grid gap-5">
              <motion.div
                className="rounded-[2rem] border border-line/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,255,255,0.62))] p-6 shadow-[0_24px_80px_rgba(12,10,8,0.06)] md:p-8"
                {...getRevealProps(reduceMotion, 0.06)}
              >
                <p className="text-[11px] uppercase tracking-[0.26em] text-ink/50">Edit maison</p>
                <h2 className="mt-4 max-w-lg font-serif text-3xl leading-[1.02] tracking-[-0.03em] md:text-4xl">
                  La galerie commence comme une prise de position, puis s&apos;ouvre sur l&apos;ensemble du travail.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-ink/72">
                  Les premieres images donnent le ton, puis la grille laisse les series, les silhouettes et les
                  moments plus documentaires dialoguer librement.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/contact"
                    className="rounded-full bg-ink px-5 py-2.5 text-sm uppercase tracking-[0.18em] text-paper transition hover:bg-accent"
                  >
                    Demander une date
                  </Link>
                  <button
                    type="button"
                    onClick={() => setActiveIndex(0)}
                    className="rounded-full border border-line/20 px-5 py-2.5 text-sm uppercase tracking-[0.18em] text-ink transition hover:border-ink"
                  >
                    Ouvrir l&apos;image
                  </button>
                </div>
              </motion.div>

              <div className="grid gap-5 sm:grid-cols-2">
                {secondaryPhotos.map(({ photo, index }, itemIndex) => (
                  <GalleryCard
                    key={photo.id}
                    photo={photo}
                    index={index}
                    onOpen={setActiveIndex}
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 24vw"
                    className="min-h-[20rem] md:min-h-[24rem]"
                    reduceMotion={reduceMotion}
                    delay={0.1 + itemIndex * 0.05}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <motion.div
              className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
              {...getRevealProps(reduceMotion, 0.08)}
            >
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.24em] text-ink/50">Grille complete</p>
                <p className="font-serif text-3xl leading-tight md:text-4xl">
                  Toutes les images publiees, sans filtre narratif.
                </p>
              </div>
              <p className="max-w-xl text-sm leading-relaxed text-ink/68">
                Une fois l&apos;edit pose, la grille laisse apparaitre le reste de la collection avec une lecture plus
                libre.
              </p>
            </motion.div>

            <div className="columns-1 gap-5 md:columns-2 xl:columns-3">
              {galleryGridPhotos.map(({ photo, index }, itemIndex) => (
                <GalleryCard
                  key={photo.id}
                  photo={photo}
                  index={index}
                  onOpen={setActiveIndex}
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className={`mb-5 min-h-[18rem] break-inside-avoid ${
                    itemIndex % 3 === 0
                      ? "h-[22rem] md:h-[26rem]"
                      : itemIndex % 3 === 1
                        ? "h-[28rem] md:h-[34rem]"
                        : "h-[24rem] md:h-[30rem]"
                  }`}
                  reduceMotion={reduceMotion}
                  delay={Math.min(itemIndex * 0.025, 0.24)}
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

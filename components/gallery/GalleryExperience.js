"use client";

import { startTransition, useEffect, useMemo, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Lightbox from "../Lightbox";
import MagneticElement from "../MagneticElement";

const GALLERY_VISIBLE_PHOTOS = 24;
const GALLERY_LOAD_MORE_PHOTOS = 24;

const SORT_OPTIONS = [
  { value: "default", label: "Par défaut" },
  { value: "recent", label: "Plus récentes" },
  { value: "oldest", label: "Plus anciennes" },
  { value: "random", label: "Aléatoire" },
];

function getPhotoTimestamp(photo) {
  const candidate = photo?.createdAt || photo?.created_at || photo?.updatedAt || photo?.updated_at;
  if (!candidate) return 0;
  const time = new Date(candidate).getTime();
  return Number.isFinite(time) ? time : 0;
}

function sortPhotos(photos, sortValue) {
  const list = [...photos];
  if (sortValue === "recent") {
    return list.sort((a, b) => getPhotoTimestamp(b) - getPhotoTimestamp(a));
  }
  if (sortValue === "oldest") {
    return list.sort((a, b) => getPhotoTimestamp(a) - getPhotoTimestamp(b));
  }
  if (sortValue === "random") {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }
  return list;
}

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

function FilterButton({ category, count, isActive, onClick }) {
  return (
    <MagneticElement strength={0.15}>
      <button
        type="button"
        aria-pressed={isActive}
        onClick={onClick}
        className={`relative overflow-hidden rounded-full border px-5 py-2.5 text-sm uppercase tracking-[0.16em] transition-all duration-300 md:px-6 ${
          isActive
            ? "border-ink text-paper shadow-[0_12px_40px_rgba(12,10,8,0.18)]"
            : "border-line/20 bg-white/40 text-ink/60 hover:border-ink/40 hover:text-ink hover:bg-white"
        }`}
      >
        {isActive ? (
          <motion.span
            layoutId="gallery-active-filter"
            className="absolute inset-0 -z-10 rounded-full bg-ink"
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          />
        ) : null}
        <span className="relative z-10">
          {category}{" "}
          {count !== undefined && (
            <motion.span key={`${category}-${count}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 0.6, y: 0 }} className="ml-1 text-xs">
              ({count})
            </motion.span>
          )}
        </span>
      </button>
    </MagneticElement>
  );
}

function FramedGalleryCard({ photo, index, onOpen, reduceMotion, priority = false }) {
  return (
    <motion.button
      type="button"
      onClick={() => onOpen(index)}
      data-cursor="gallery-item"
      className="group relative block w-full overflow-hidden rounded-[0.8rem] border border-line/18 bg-white/75 p-[2px] text-left shadow-[0_18px_54px_rgba(12,10,8,0.07)] backdrop-blur-sm transition duration-500 hover:-translate-y-1 hover:border-ink/18 hover:bg-white hover:shadow-[0_30px_88px_rgba(12,10,8,0.13)]"
      initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.985 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={reduceMotion ? undefined : { duration: 0.58, delay: Math.min(index * 0.025, 0.22), ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[0.62rem] bg-ink">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover sharpen-img transition duration-700 ease-out group-hover:scale-[1.055]"
          style={{ objectPosition: photo.objectPosition || "center center" }}
          quality={85}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,8,0)_30%,rgba(12,10,8,0.26))] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.06)_35%,rgba(255,255,255,0.22)_48%,rgba(255,255,255,0.08)_58%,transparent_76%)] opacity-0 mix-blend-screen blur-[0.5px] transition duration-700 ease-out group-hover:translate-x-full group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.16),transparent_38%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-0 opacity-0 ring-1 ring-inset ring-white/0 transition duration-500 group-hover:opacity-100 group-hover:ring-white/22" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/28 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
    </motion.button>
  );
}

export default function GalleryExperience({ photos, allPhotos = photos, activeCategory, categories }) {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeFilter = activeCategory || "Tout";
  const [sortValue, setSortValue] = useState("default");
  const [activeIndex, setActiveIndex] = useState(null);
  const [visiblePhotoState, setVisiblePhotoState] = useState({
    filter: activeFilter,
    count: GALLERY_VISIBLE_PHOTOS,
  });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const containerRef = useRef(null);
  const initialVisibleCount = GALLERY_VISIBLE_PHOTOS;
  const loadMoreCount = GALLERY_LOAD_MORE_PHOTOS;
  const visibleCount =
    visiblePhotoState.filter === activeFilter ? visiblePhotoState.count : initialVisibleCount;
  const sortedPhotos = useMemo(() => sortPhotos(photos, sortValue), [photos, sortValue]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const categoryCounts = useMemo(() => {
    const counts = { Tout: allPhotos.length };
    for (const photo of allPhotos) {
      if (photo.category) {
        counts[photo.category] = (counts[photo.category] || 0) + 1;
      }
    }
    return counts;
  }, [allPhotos]);

  const visiblePhotos = useMemo(() => sortedPhotos.slice(0, visibleCount), [sortedPhotos, visibleCount]);
  const hasMorePhotos = visiblePhotos.length < sortedPhotos.length;
  const leadPhoto = visiblePhotos[0] || null;

  // Synchronisation URL <-> photo ouverte (deep link / partage)
  const requestedPhotoId = searchParams?.get("photo") || "";

  useEffect(() => {
    if (!requestedPhotoId) return;
    const index = sortedPhotos.findIndex((photo) => photo.id === requestedPhotoId);
    if (index === -1) return;
    // S'assure que la photo demandee est rendue dans la grille visible
    if (index >= visibleCount) {
      setVisiblePhotoState({
        filter: activeFilter,
        count: Math.max(visibleCount, Math.ceil((index + 1) / loadMoreCount) * loadMoreCount),
      });
    }
    setActiveIndex(index);
    // On ne met cette logique qu'au premier rendu / changement d'URL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedPhotoId, sortedPhotos]);

  const updatePhotoQueryParam = useCallback(
    (photoId) => {
      const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
      if (photoId) {
        params.set("photo", photoId);
      } else {
        params.delete("photo");
      }
      const queryString = params.toString();
      const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(nextUrl, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const openPhotoAt = useCallback(
    (index) => {
      setActiveIndex(index);
      const photo = visiblePhotos[index];
      if (photo?.id) updatePhotoQueryParam(photo.id);
    },
    [visiblePhotos, updatePhotoQueryParam]
  );

  const closeLightbox = useCallback(() => {
    setActiveIndex(null);
    updatePhotoQueryParam(null);
  }, [updatePhotoQueryParam]);

  const goToPrev = useCallback(() => {
    if (activeIndex === null || visiblePhotos.length === 0) return;
    const next = activeIndex === 0 ? visiblePhotos.length - 1 : activeIndex - 1;
    setActiveIndex(next);
    const photo = visiblePhotos[next];
    if (photo?.id) updatePhotoQueryParam(photo.id);
  }, [activeIndex, visiblePhotos, updatePhotoQueryParam]);

  const goToNext = useCallback(() => {
    if (activeIndex === null || visiblePhotos.length === 0) return;
    const next = activeIndex === visiblePhotos.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(next);
    const photo = visiblePhotos[next];
    if (photo?.id) updatePhotoQueryParam(photo.id);
  }, [activeIndex, visiblePhotos, updatePhotoQueryParam]);

  const selectIndex = useCallback(
    (index) => {
      setActiveIndex(index);
      const photo = visiblePhotos[index];
      if (photo?.id) updatePhotoQueryParam(photo.id);
    },
    [visiblePhotos, updatePhotoQueryParam]
  );

  return (
    <div ref={containerRef} data-page="gallery" className="page-shell mx-auto max-w-7xl space-y-12 px-4 pb-20 pt-12 md:px-8 md:space-y-16">
      <motion.div className="flex flex-wrap items-center justify-between gap-4" {...getRevealProps(reduceMotion, 0.1)}>
        <div className="flex flex-wrap gap-4">
          {categories.map((category) => (
            <FilterButton
              key={category}
              category={category}
              count={categoryCounts[category] || 0}
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
        </div>

        <label className="flex items-center gap-3 rounded-full border border-line/20 bg-white/60 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-ink/60">
          <span className="hidden sm:inline">Trier</span>
          <select
            value={sortValue}
            onChange={(event) => setSortValue(event.target.value)}
            className="bg-transparent text-[11px] font-bold uppercase tracking-[0.18em] text-ink outline-none"
            aria-label="Trier les photos"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </motion.div>

      {photos.length === 0 ? (
        <div className="rounded-panel border border-line/12 bg-white/60 p-12 text-center shadow-[0_32px_96px_rgba(12,10,8,0.06)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/40">Galerie vide</p>
          <p className="mt-6 font-serif text-4xl">Aucune image dans cette collection.</p>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink/60">
            Ajoute ou publie des photos depuis l&apos;admin pour faire vivre cette section.
          </p>
        </div>
      ) : null}

      <AnimatePresence mode="wait">
      {leadPhoto ? (
        <motion.div
          key={activeFilter}
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -18 }}
          transition={reduceMotion ? undefined : { duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-12 md:space-y-16"
        >
          <section className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:gap-5">
              {visiblePhotos.map((photo, index) => (
                <FramedGalleryCard
                  key={photo.id}
                  photo={photo}
                  index={index}
                  onOpen={openPhotoAt}
                  reduceMotion={reduceMotion}
                  priority={index < 8}
                />
              ))}
            </div>

            {hasMorePhotos ? (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    setVisiblePhotoState({
                      filter: activeFilter,
                      count: Math.min(visibleCount + loadMoreCount, sortedPhotos.length),
                    })
                  }
                  className="rounded-full border border-line/20 bg-white/70 px-7 py-3 text-[12px] font-bold uppercase tracking-[0.2em] text-ink transition hover:border-ink hover:bg-white"
                >
                  Voir plus ({sortedPhotos.length - visiblePhotos.length})
                </button>
              </div>
            ) : null}
          </section>
        </motion.div>
      ) : null}
      </AnimatePresence>

      <Lightbox
        photos={visiblePhotos}
        activeIndex={activeIndex}
        onClose={closeLightbox}
        onPrev={goToPrev}
        onNext={goToNext}
        onSelect={selectIndex}
      />

      {/* Bouton retour en haut */}
      <motion.button
        type="button"
        aria-label="Remonter en haut de la page"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        initial={false}
        animate={showScrollTop ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 16, scale: 0.85 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-ink/12 bg-paper/90 text-ink shadow-[0_16px_48px_rgba(12,10,8,0.18)] backdrop-blur-xl transition-colors hover:bg-ink hover:text-paper"
        style={{ pointerEvents: showScrollTop ? "auto" : "none" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 19V5" />
          <path d="m5 12 7-7 7 7" />
        </svg>
      </motion.button>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Lightbox from "../../components/Lightbox";

const categories = ["Tout", "Fashion Week", "Mariage", "Eglise", "Concert"];

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState("Tout");
  const [activeIndex, setActiveIndex] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

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

        if (isMounted) {
          setPhotos(result.data || []);
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

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 pt-10 md:px-8">
      <header className="space-y-4">
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm uppercase tracking-[0.2em] text-ink/70"
        >
          Gallery
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="font-serif text-4xl md:text-6xl"
        >
          Collections photographiques
        </motion.h1>
      </header>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isActive = category === activeFilter;
          return (
            <button
              key={category}
              type="button"
              onClick={() => {
                setActiveFilter(category);
                setActiveIndex(null);
              }}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                isActive
                  ? "border-ink bg-ink text-paper"
                  : "border-line/40 text-ink/75 hover:border-ink hover:text-ink"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {status === "loading" ? (
          <p className="text-sm text-ink/60">Chargement des photos...</p>
        ) : null}
        {status === "error" ? <p className="text-sm text-red-700">{errorMessage}</p> : null}

        {photos.map((photo, index) => (
          <motion.button
            key={photo.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-line/20"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              width={1200}
              height={1600}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 to-transparent px-4 pb-4 pt-10 text-left text-paper opacity-0 transition group-hover:opacity-100">
              <p className="font-serif text-lg">{photo.title}</p>
              <p className="text-xs uppercase tracking-[0.15em] text-paper/70">{photo.category}</p>
            </div>
          </motion.button>
        ))}
      </div>

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

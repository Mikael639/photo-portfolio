"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const services = [
  {
    title: "Fashion Week",
    description: "Coverage runway, backstage et street style avec rendu editorial premium.",
  },
  {
    title: "Mariage",
    description: "Reportage emotionnel de la preparation a la soiree, avec une narration naturelle.",
  },
  {
    title: "Eglise",
    description: "Photographie benevole pour offices, chorales et evenements communautaires.",
  },
  {
    title: "Concert",
    description: "Captation live d artistes, ambiance scene et images fortes pour communication.",
  },
];

const fallbackPhoto = {
  src: "/images/shot-01.svg",
  alt: "Photo portfolio Jerrypicsart",
};

function getFirstPhotoByRole(list, role) {
  for (let index = 0; index < list.length; index += 1) {
    const photo = list[index];
    if (photo.roles?.includes(role)) return photo;
  }
  return null;
}

export default function HomePage() {
  const [photos, setPhotos] = useState([]);
  const [featuredStartIndex, setFeaturedStartIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadPhotos() {
      try {
        const response = await fetch("/api/photos?limit=40", {
          method: "GET",
          cache: "no-store",
        });
        const result = await response.json();
        if (!response.ok || !result.ok) return;
        if (isMounted) setPhotos(Array.isArray(result.data) ? result.data : []);
      } catch {
        // Keep fallback visuals when API is unavailable.
      }
    }

    loadPhotos();
    return () => {
      isMounted = false;
    };
  }, []);

  const heroPhoto = getFirstPhotoByRole(photos, "hero") || photos[0] || fallbackPhoto;
  const featuredByRole = photos.filter((photo) => photo.roles?.includes("featured"));
  const featuredPool = (() => {
    if (featuredByRole.length >= 3) return featuredByRole.slice(0, 3);

    const featuredIds = new Set(featuredByRole.map((photo) => photo.id));
    const recentPhotos = photos.filter((photo) => !featuredIds.has(photo.id));
    return [...featuredByRole, ...recentPhotos];
  })();
  const featuredPhotos = (() => {
    if (featuredPool.length <= 3) return featuredPool.slice(0, 3);

    return [0, 1, 2].map((offset) => {
      const index = (featuredStartIndex + offset) % featuredPool.length;
      return featuredPool[index];
    });
  })();
  const servicesBackground = getFirstPhotoByRole(photos, "servicesBackground") || featuredPhotos[0] || heroPhoto;

  useEffect(() => {
    if (featuredPool.length <= 3) return;

    const intervalId = setInterval(() => {
      setFeaturedStartIndex((current) => (current + 1) % featuredPool.length);
    }, 15000);

    return () => clearInterval(intervalId);
  }, [featuredPool.length]);

  return (
    <div className="space-y-20">
      <section className="relative min-h-[82vh] overflow-hidden border-b border-line/30">
        <Image src={heroPhoto.src} alt={heroPhoto.alt} fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/35 to-transparent" />

        <div className="relative mx-auto flex min-h-[82vh] max-w-7xl items-end px-4 pb-14 pt-28 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-3xl text-paper"
          >
            <p className="mb-4 text-sm uppercase tracking-[0.25em] text-paper/80">Jerrypicsart</p>
            <h1 className="font-serif text-4xl leading-tight md:text-6xl">
              Photographe pour fashion week, mariages, eglises et concerts.
            </h1>
            <p className="mt-5 max-w-2xl text-base text-paper/85 md:text-lg">
              Une image elegante, vivante et utile pour raconter votre evenement avec coherence visuelle.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/gallery"
                className="rounded-full bg-paper px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-ink transition hover:bg-accent hover:text-paper"
              >
                Voir les realisations
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-paper/60 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-paper transition hover:border-paper hover:bg-paper/10"
              >
                Demander un devis
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-line/20 px-4 py-10 md:px-8 md:py-12">
        <Image src={servicesBackground.src} alt={servicesBackground.alt} fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-ink/65" />

        <div className="relative z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45 }}
            className="space-y-4"
          >
            <p className="text-sm uppercase tracking-[0.2em] text-paper/75">Prestations</p>
            <h2 className="font-serif text-3xl leading-tight text-paper md:text-5xl">
              Une offre claire pour chaque type d&apos;evenement
            </h2>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2">
            {services.map((service, index) => (
              <motion.article
                key={service.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                className="rounded-2xl border border-white/30 bg-white/10 p-5 text-paper backdrop-blur-sm"
              >
                <p className="font-serif text-2xl">{service.title}</p>
                <p className="mt-2 text-sm text-paper/85">{service.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-[1.1fr_1fr] md:px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="space-y-5"
        >
          <p className="text-sm uppercase tracking-[0.2em] text-ink/70">Signature visuelle</p>
          <h2 className="font-serif text-3xl leading-tight md:text-5xl">Un style organique, precis et lumineux.</h2>
          <p className="max-w-xl text-ink/80">
            Chaque serie est construite autour d&apos;une lumiere maitrisee, d&apos;un rythme juste et d&apos;une retouche
            subtile.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {featuredPhotos.map((photo) => (
            <div key={photo.id} className="overflow-hidden rounded-xl border border-line/20">
              <Image
                src={photo.src}
                alt={photo.alt}
                width={900}
                height={1200}
                className="h-full w-full object-cover transition duration-500 hover:scale-105"
                sizes="(max-width: 768px) 33vw, 22vw"
              />
            </div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}

"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const specialties = [
  {
    title: "Fashion Week",
    focus: "Runway, backstage, street style",
    description: "Un regard net et editorial pour garder l'allure, le rythme et la tension d'un defile.",
  },
  {
    title: "Mariage",
    focus: "Preparation, ceremonie, reception",
    description: "Un reportage sobre et sensible, construit pour tenir dans le temps sans surjouer l'emotion.",
  },
  {
    title: "Eglise",
    focus: "Office, chorale, rassemblement",
    description: "Une presence discrete pour traduire la lumiere, la ferveur et la dimension collective.",
  },
  {
    title: "Concert",
    focus: "Scene, public, communication",
    description: "Des images fortes et lisibles, pensees autant pour l'ambiance que pour la diffusion.",
  },
];

function getRevealProps(reduceMotion, delay = 0, amount = 0.24) {
  if (reduceMotion) {
    return {
      viewport: { once: true, amount },
    };
  }

  return {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount },
    transition: {
      duration: 0.72,
      delay,
      ease: [0.22, 1, 0.36, 1],
    },
  };
}

function MotionBlock({ children, className = "", delay = 0, amount = 0.24, reduceMotion }) {
  return (
    <motion.div className={className} {...getRevealProps(reduceMotion, delay, amount)}>
      {children}
    </motion.div>
  );
}

function SectionHeading({ eyebrow, title, description, action, reduceMotion }) {
  return (
    <MotionBlock
      reduceMotion={reduceMotion}
      amount={0.3}
      className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
    >
      <div className="max-w-3xl space-y-3">
        <p className="text-[11px] uppercase tracking-[0.28em] text-ink/55">{eyebrow}</p>
        <h2 className="font-serif text-4xl leading-[0.96] tracking-[-0.03em] md:text-6xl">{title}</h2>
        <p className="max-w-2xl text-base leading-relaxed text-ink/72 md:text-lg">{description}</p>
      </div>
      {action}
    </MotionBlock>
  );
}

function PhotoTile({ photo, href = "/gallery", className = "", sizes, delay = 0, reduceMotion }) {
  return (
    <motion.div
      className={className}
      {...getRevealProps(reduceMotion, delay, 0.18)}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={reduceMotion ? undefined : { duration: 0.32, ease: "easeOut" }}
    >
      <Link
        href={href}
        className="group relative block h-full min-h-[18rem] overflow-hidden rounded-[1.8rem] border border-line/15 bg-ink shadow-[0_24px_80px_rgba(12,10,8,0.12)]"
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={sizes}
          className="object-cover transition duration-700 ease-out group-hover:scale-[1.025]"
          style={{ objectPosition: photo.objectPosition || "center center" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,8,0.08),rgba(12,10,8,0.72))]" />
        <div className="relative flex h-full flex-col justify-between p-5 md:p-6">
          <span className="w-fit rounded-full border border-white/15 bg-black/15 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-paper/68 backdrop-blur-sm">
            {photo.category}
          </span>
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-[0.24em] text-paper/55">Image choisie</p>
            <p className="max-w-[16rem] font-serif text-2xl leading-tight text-paper">{photo.title}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function HomePageExperience({
  heroPhoto,
  supportingPhotos,
  featuredPhotos,
  identityPhoto,
  servicesBackground,
  closingPhoto,
  categories,
}) {
  const reduceMotion = useReducedMotion();
  const secondaryFeatured = featuredPhotos.slice(1, 4);
  const cinematicPhotos = useMemo(() => {
    const seen = new Set();
    const orderedPhotos = [
      heroPhoto,
      ...supportingPhotos,
      ...featuredPhotos,
      identityPhoto,
      servicesBackground,
      closingPhoto,
    ];

    return orderedPhotos.filter((photo) => {
      if (!photo?.id || seen.has(photo.id)) return false;
      seen.add(photo.id);
      return true;
    });
  }, [closingPhoto, featuredPhotos, heroPhoto, identityPhoto, servicesBackground, supportingPhotos]);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const activeHeroPhoto = cinematicPhotos[activeHeroIndex] || heroPhoto;

  useEffect(() => {
    if (reduceMotion || cinematicPhotos.length < 2) return;

    const interval = window.setInterval(() => {
      setActiveHeroIndex((currentIndex) => (currentIndex + 1) % cinematicPhotos.length);
    }, 7600);

    return () => window.clearInterval(interval);
  }, [cinematicPhotos.length, reduceMotion]);

  return (
    <div data-page="home" className="page-shell -mt-20 space-y-24 pb-8 md:space-y-32">
      <section className="relative isolate min-h-screen overflow-hidden border-b border-line/10">
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeHeroPhoto.id}
              className="absolute inset-0"
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 1.12, x: "0.35%", filter: "blur(2px)" }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1.03, x: "0%", filter: "blur(0px)" }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 1.05, x: "-0.2%", filter: "blur(1px)" }}
              transition={reduceMotion ? undefined : { duration: 2.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={activeHeroPhoto.src}
                alt={activeHeroPhoto.alt}
                fill
                priority
                sizes="100vw"
                className="object-cover"
                style={{ objectPosition: activeHeroPhoto.objectPosition || "center 16%" }}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,8,0.45),rgba(12,10,8,0.25)_28%,rgba(12,10,8,0.72)_72%,rgba(12,10,8,0.92)_100%)]" />
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_65%_32%,rgba(255,255,255,0.12),transparent_34%)]"
          animate={reduceMotion ? undefined : { opacity: [0.1, 0.18, 0.12] }}
          transition={reduceMotion ? undefined : { duration: 7.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-paper" />

        <div className="relative mx-auto grid min-h-screen max-w-7xl gap-10 px-4 pb-10 pt-32 md:px-8 md:pb-14 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 30 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reduceMotion ? undefined : { duration: 0.82, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl text-paper"
          >
            <p className="text-[11px] uppercase tracking-[0.32em] text-paper/66">Jerrypicsart portfolio editorial</p>
            <h1 className="mt-5 max-w-5xl font-serif text-[clamp(3.5rem,9vw,7.6rem)] leading-[0.9] tracking-[-0.05em]">
              Des images qui donnent de la tenue a l&apos;instant.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-paper/78 md:text-lg">
              Mode, mariages et evenements saisis avec la meme exigence de cadre, de lumiere et de presence.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/gallery"
                className="rounded-full bg-paper px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-ink transition hover:bg-accent hover:text-paper"
              >
                Explorer l&apos;edit
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-paper/35 px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-paper transition hover:border-paper hover:bg-paper/10"
              >
                Parler d&apos;une date
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-4 gap-y-3 text-[11px] uppercase tracking-[0.24em] text-paper/62">
              {categories.map((category) => (
                <span key={category}>{category}</span>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4 text-[11px] uppercase tracking-[0.24em] text-paper/55">
              <span className="h-px w-16 bg-paper/24" />
              <span>
                {activeHeroPhoto.category} / {activeHeroPhoto.title}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 34 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reduceMotion ? undefined : { duration: 0.9, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1"
          >
            {supportingPhotos.map((photo) => (
              <div key={photo.id} className="relative min-h-[14rem] overflow-hidden rounded-[1.8rem] border border-white/12 bg-black/20 backdrop-blur-sm">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 1024px) 50vw, 22vw"
                  className="object-cover"
                  style={{ objectPosition: photo.objectPosition || "center center" }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,8,0.1),rgba(12,10,8,0.74))]" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-paper">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-paper/58">{photo.category}</p>
                  <p className="mt-1 font-serif text-2xl leading-tight">{photo.title}</p>
                </div>
              </div>
            ))}

            <div className="rounded-[1.8rem] border border-white/12 bg-black/28 p-5 text-paper/82 backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] uppercase tracking-[0.24em] text-paper/58">Direction</p>
                {cinematicPhotos.length > 1 ? (
                  <div className="flex items-center gap-1.5">
                    {cinematicPhotos.slice(0, 5).map((photo, index) => (
                      <button
                        key={photo.id}
                        type="button"
                        aria-label={`Afficher ${photo.title}`}
                        onClick={() => setActiveHeroIndex(index)}
                        className={`h-1.5 rounded-full transition ${
                          activeHeroIndex === index ? "w-5 bg-paper/90" : "w-2 bg-paper/20 hover:bg-paper/38"
                        }`}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
              <p className="mt-3 font-serif text-2xl leading-tight text-paper">Luxe discret, intensite juste.</p>
              <p className="mt-4 text-sm leading-relaxed">
                Des silhouettes fortes, des receptions vivantes et une retouche qui reste au service des personnes, des
                lieux et du rythme.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-4 md:px-8">
        <SectionHeading
          eyebrow="Selection"
          title="Mode et receptions, pensees comme un meme edit."
          description="Les images fortes alternent allure, presence et celebration pour donner une lecture plus complete du regard."
          action={
            <Link
              href="/gallery"
              className="w-fit rounded-full border border-line/20 px-5 py-2.5 text-sm uppercase tracking-[0.18em] text-ink transition hover:border-ink"
            >
              Ouvrir la galerie
            </Link>
          }
          reduceMotion={reduceMotion}
        />

        <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
          <PhotoTile
            photo={featuredPhotos[0]}
            className="min-h-[28rem] lg:min-h-[42rem]"
            sizes="(max-width: 1024px) 100vw, 56vw"
            reduceMotion={reduceMotion}
          />

          <div className="grid gap-4">
            <MotionBlock
              reduceMotion={reduceMotion}
              delay={0.05}
              className="rounded-[2rem] border border-line/15 bg-white/55 p-6 shadow-[0_24px_80px_rgba(12,10,8,0.06)] md:p-8"
            >
              <p className="text-[11px] uppercase tracking-[0.26em] text-ink/52">Edit maison</p>
              <h3 className="mt-4 max-w-lg font-serif text-3xl leading-[1.02] tracking-[-0.03em] md:text-4xl">
                Une homepage qui melange allure editoriale et moments a forte valeur humaine.
              </h3>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-ink/72">
                L&apos;enjeu n&apos;est pas de tout montrer, mais de faire sentir a la fois la signature mode et la
                qualite des prestations evenementielles.
              </p>
            </MotionBlock>

            <div className="grid gap-4 sm:grid-cols-2">
              {secondaryFeatured.slice(0, 2).map((photo, index) => (
                <PhotoTile
                  key={photo.id}
                  photo={photo}
                  className="min-h-[20rem]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 24vw"
                  delay={0.08 + index * 0.06}
                  reduceMotion={reduceMotion}
                />
              ))}
            </div>
          </div>
        </div>

        {secondaryFeatured[2] ? (
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <PhotoTile
              photo={secondaryFeatured[2]}
              className="min-h-[26rem] md:min-h-[34rem]"
              sizes="(max-width: 1024px) 100vw, 42vw"
              delay={0.12}
              reduceMotion={reduceMotion}
            />

            <MotionBlock
              reduceMotion={reduceMotion}
              delay={0.16}
              className="rounded-[2rem] border border-line/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,255,255,0.62))] p-6 shadow-[0_24px_80px_rgba(12,10,8,0.06)] md:p-8"
            >
              <p className="text-[11px] uppercase tracking-[0.26em] text-ink/52">Cadence</p>
              <h3 className="mt-4 max-w-lg font-serif text-3xl leading-[1.02] tracking-[-0.03em] md:text-4xl">
                Une mise en page qui laisse aux portraits la place de respirer.
              </h3>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-ink/72">
                Quand une image repose sur un visage, une posture ou une silhouette, elle gagne a rester dans un cadre
                plus vertical et plus calme. L&apos;edit s&apos;organise autour de cette logique.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/gallery"
                  className="rounded-full border border-line/20 px-5 py-2.5 text-sm uppercase tracking-[0.18em] text-ink transition hover:border-ink"
                >
                  Voir toutes les images
                </Link>
                <Link
                  href="/contact"
                  className="rounded-full bg-ink px-5 py-2.5 text-sm uppercase tracking-[0.18em] text-paper transition hover:bg-accent"
                >
                  Demander une date
                </Link>
              </div>
            </MotionBlock>
          </div>
        ) : null}
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <MotionBlock reduceMotion={reduceMotion} className="space-y-6">
            <p className="text-[11px] uppercase tracking-[0.28em] text-ink/55">Signature</p>
            <h2 className="max-w-2xl font-serif text-4xl leading-[0.98] tracking-[-0.03em] md:text-6xl">
              Un regard capable de passer de la silhouette au moment partage.
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-ink/74 md:text-lg">
              Jerrypicsart travaille la mode, le mariage et l&apos;evenement avec une meme ligne: de la tenue, de la
              clarte et une vraie sensation de presence.
            </p>
            <p className="max-w-xl text-base leading-relaxed text-ink/66">
              Chaque serie cherche l&apos;equilibre entre desirabilite, respiration dans le cadre et finition
              editoriale.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/about"
                className="rounded-full border border-line/20 px-5 py-2.5 text-sm uppercase tracking-[0.18em] text-ink transition hover:border-ink"
              >
                Lire l&apos;approche
              </Link>
              <Link
                href="/contact"
                className="rounded-full bg-ink px-5 py-2.5 text-sm uppercase tracking-[0.18em] text-paper transition hover:bg-accent"
              >
                Parler du projet
              </Link>
            </div>
          </MotionBlock>

          <MotionBlock reduceMotion={reduceMotion} delay={0.08} className="relative min-h-[26rem] overflow-hidden rounded-[2.1rem] border border-line/15 bg-ink lg:min-h-[38rem]">
            <Image
              src={identityPhoto.src}
              alt={identityPhoto.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 54vw"
              className="object-cover"
              style={{ objectPosition: identityPhoto.objectPosition || "center center" }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,8,0.08),rgba(12,10,8,0.72))]" />
            <div className="absolute bottom-4 right-4 max-w-xs rounded-[1.5rem] border border-white/15 bg-black/38 p-4 text-paper backdrop-blur-sm md:bottom-6 md:right-6 md:p-5">
              <p className="text-[10px] uppercase tracking-[0.24em] text-paper/58">Intention</p>
              <p className="mt-2 font-serif text-2xl leading-tight">L&apos;elegance vient du rythme, jamais du decoratif.</p>
            </div>
          </MotionBlock>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="relative overflow-hidden rounded-[2.3rem] border border-line/15 bg-ink text-paper">
          <Image
            src={servicesBackground.src}
            alt={servicesBackground.alt}
            fill
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: servicesBackground.objectPosition || "center center" }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(12,10,8,0.92),rgba(12,10,8,0.72)_45%,rgba(12,10,8,0.8))]" />

          <div className="relative grid gap-8 px-6 py-8 md:px-8 md:py-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-12">
            <MotionBlock reduceMotion={reduceMotion} className="space-y-4">
              <p className="text-[11px] uppercase tracking-[0.28em] text-paper/58">Specialites</p>
              <h2 className="max-w-xl font-serif text-4xl leading-[0.98] tracking-[-0.03em] md:text-5xl">
                Une offre resserree, pour les moments ou l&apos;image doit etre a la fois belle, utile et memorable.
              </h2>
              <p className="max-w-md text-base leading-relaxed text-paper/74">
                De la Fashion Week aux receptions, la meme exigence visuelle s&apos;applique: clarte, desirabilite et
                sens du moment.
              </p>
            </MotionBlock>

            <div className="overflow-hidden rounded-[1.9rem] border border-white/12 bg-black/18 backdrop-blur-sm">
              {specialties.map((item, index) => (
                <motion.div
                  key={item.title}
                  className="grid gap-3 border-b border-white/10 px-5 py-5 last:border-b-0 md:grid-cols-[auto_1fr_auto] md:items-start md:gap-6 md:px-6"
                  {...getRevealProps(reduceMotion, index * 0.05, 0.2)}
                >
                  <span className="text-[11px] uppercase tracking-[0.24em] text-paper/48">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="space-y-2">
                    <p className="font-serif text-2xl text-paper">{item.title}</p>
                    <p className="max-w-xl text-sm leading-relaxed text-paper/72">{item.description}</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.24em] text-paper/52">{item.focus}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-6 overflow-hidden rounded-[2.25rem] border border-line/15 bg-[linear-gradient(135deg,rgba(18,15,12,0.98),rgba(52,38,28,0.95))] p-6 text-paper shadow-[0_24px_80px_rgba(12,10,8,0.14)] md:p-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-end lg:p-10">
          <MotionBlock reduceMotion={reduceMotion} className="space-y-4">
            <p className="text-[11px] uppercase tracking-[0.28em] text-paper/58">Projet</p>
            <h2 className="max-w-2xl font-serif text-4xl leading-[0.98] tracking-[-0.03em] md:text-6xl">
              Construisons une serie elegante, lisible et utile.
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-paper/76 md:text-lg">
              Date, lieu, type d&apos;evenement ou intention editoriale: quelques lignes suffisent pour poser la bonne
              direction.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/contact"
                className="rounded-full bg-paper px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-ink transition hover:bg-accent hover:text-paper"
              >
                Demander un devis
              </Link>
              <Link
                href="/gallery"
                className="rounded-full border border-paper/24 px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-paper transition hover:border-paper hover:bg-white/10"
              >
                Voir le portfolio
              </Link>
            </div>
          </MotionBlock>

          <div className="grid gap-4 md:grid-cols-[1fr_220px] md:items-end">
            <MotionBlock
              reduceMotion={reduceMotion}
              delay={0.08}
              className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5 text-paper/82 backdrop-blur-sm"
            >
              <p className="text-[10px] uppercase tracking-[0.24em] text-paper/56">Disponibilites</p>
              <p className="mt-3 font-serif text-2xl leading-tight text-paper">
                Reponse sous 24 a 48h quand le brief est clair.
              </p>
              <p className="mt-4 text-sm leading-relaxed">
                Une demande concise avec la date, le lieu et l&apos;intention visuelle permet d&apos;aller droit a
                l&apos;essentiel.
              </p>
            </MotionBlock>

            <MotionBlock reduceMotion={reduceMotion} delay={0.14} className="relative min-h-[16rem] overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/20">
              <Image
                src={closingPhoto.src}
                alt={closingPhoto.alt}
                fill
                sizes="220px"
                className="object-cover"
                style={{ objectPosition: closingPhoto.objectPosition || "center center" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-paper">
                <p className="text-[10px] uppercase tracking-[0.24em] text-paper/56">{closingPhoto.category}</p>
                <p className="mt-1 font-serif text-xl leading-tight">{closingPhoto.title}</p>
              </div>
            </MotionBlock>
          </div>
        </div>
      </section>
    </div>
  );
}

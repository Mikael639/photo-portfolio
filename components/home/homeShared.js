import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export const stats = [
  { value: 320, suffix: "+", label: "Series livrees", focus: "depuis 2020" },
  { value: 80, suffix: "+", label: "Evenements couverts", focus: "France et international" },
  { value: 45, suffix: "+", label: "Marques accompagnees", focus: "mode, mariage, lifestyle" },
  { value: 48, suffix: "h", label: "Delai preview", focus: "selection envoyee" },
];

export const testimonials = [
  {
    quote:
      "Une presence discrete et une vraie lecture du moment. Les images respirent et racontent vraiment ce que nous avons vecu.",
    name: "Camille R.",
    role: "Mariage couture, Paris",
  },
  {
    quote:
      "Direction artistique tres claire, retouche maitrisee. Le rendu est tenu, intemporel, exactement la ligne que la maison cherchait.",
    name: "Studio Atelier 8",
    role: "Direction creative, Fashion Week",
  },
  {
    quote:
      "Brief court, livraison rapide, edit cohérent. Jerrypicsart a parfaitement capte l'energie de la soiree.",
    name: "Hugo M.",
    role: "Lancement de marque, Paris",
  },
];

function CountUp({ value, suffix = "", duration = 1.6 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (current) => Math.round(current));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionValue, value, { duration, ease: [0.16, 1, 0.3, 1] });
    const unsubscribe = rounded.on("change", (latest) => setDisplay(latest));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [inView, value, duration, motionValue, rounded]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

export function StatsSection({ reduceMotion, items = stats }) {
  return (
    <section className="mx-auto max-w-7xl px-4 md:px-8">
      <MotionBlock
        reduceMotion={reduceMotion}
        className="rounded-panel border border-line/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0.62))] p-8 shadow-[0_24px_80px_rgba(12,10,8,0.06)] backdrop-blur-md md:p-12"
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-ink/40">Reperes</p>
            <h2 className="mt-3 max-w-2xl font-serif text-3xl leading-tight tracking-[-0.03em] md:text-5xl">
              Un studio de confiance, des chiffres qui parlent.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-ink/55 md:text-base">
            Quelques reperes pour situer la maniere de travailler et le rythme habituel.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <motion.div
              key={item.label}
              {...getRevealProps(reduceMotion, index * 0.08, 0.3)}
              className="border-t border-line/16 pt-5"
            >
              <p className="font-serif text-5xl leading-none tracking-[-0.04em] text-ink md:text-6xl">
                {reduceMotion ? (
                  <>
                    {item.value}
                    {item.suffix}
                  </>
                ) : (
                  <CountUp value={item.value} suffix={item.suffix} />
                )}
              </p>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.24em] text-ink/55">{item.label}</p>
              <p className="mt-1 text-sm text-ink/45">{item.focus}</p>
            </motion.div>
          ))}
        </div>
      </MotionBlock>
    </section>
  );
}

export function TestimonialsSection({ reduceMotion, items = testimonials }) {
  return (
    <section className="mx-auto max-w-7xl px-4 md:px-8">
      <MotionBlock reduceMotion={reduceMotion} className="space-y-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-ink/40">Retours</p>
            <h2 className="font-serif text-4xl leading-[0.96] tracking-[-0.04em] md:text-6xl">
              Ce que disent celles et ceux qui ont collabore.
            </h2>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {items.map((item, index) => (
            <motion.figure
              key={item.name}
              {...getRevealProps(reduceMotion, index * 0.1, 0.2)}
              className="flex h-full flex-col justify-between gap-8 rounded-card border border-line/12 bg-white/70 p-7 shadow-[0_18px_60px_rgba(12,10,8,0.05)] backdrop-blur-sm"
            >
              <div className="space-y-4">
                <span aria-hidden="true" className="block font-serif text-5xl leading-none text-ink/15">&ldquo;</span>
                <blockquote className="font-serif text-xl leading-snug text-ink md:text-2xl">{item.quote}</blockquote>
              </div>
              <figcaption className="border-t border-line/12 pt-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink/70">{item.name}</p>
                <p className="mt-1 text-xs text-ink/45">{item.role}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </MotionBlock>
    </section>
  );
}

export const specialties = [
  {
    title: "Events",
    focus: "Soirees, lancements, scenes",
    description: "Un regard net pour capter l'energie, les invites et les moments qui signent un evenement.",
  },
  {
    title: "Fashion Week & Celebrities",
    focus: "Runway, backstage, red carpet",
    description: "Une lecture editoriale pour garder l'allure, le rythme et la presence des personnalites.",
  },
  {
    title: "Studio",
    focus: "Portrait, direction, serie",
    description: "Des images construites avec precision pour garder une allure forte et une lecture immediate.",
  },
  {
    title: "Fashion Wedding",
    focus: "Preparation, ceremonie, reception",
    description: "Un reportage sobre et sensible, pense comme un editorial intime et intemporel.",
  },
];

export function getRevealProps(reduceMotion, delay = 0, amount = 0.24) {
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

export function MotionBlock({ children, className = "", delay = 0, amount = 0.24, reduceMotion }) {
  return (
    <motion.div className={className} {...getRevealProps(reduceMotion, delay, amount)}>
      {children}
    </motion.div>
  );
}

export function SectionHeading({ eyebrow, title, description, action, reduceMotion }) {
  return (
    <MotionBlock
      reduceMotion={reduceMotion}
      amount={0.3}
      className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
    >
      <div className="max-w-3xl space-y-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-ink/50">{eyebrow}</p>
        <h2 className="font-serif text-5xl leading-[0.94] tracking-[-0.04em] md:text-7xl">{title}</h2>
        <p className="max-w-2xl text-base leading-relaxed text-ink/70 md:text-xl">{description}</p>
      </div>
      {action}
    </MotionBlock>
  );
}

export function PhotoTile({
  photo,
  href = "/gallery",
  className = "",
  sizes,
  delay = 0,
  reduceMotion,
  imageFit = "cover",
  imagePosition,
}) {
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

  return (
    <motion.div
      className={className}
      {...getRevealProps(reduceMotion, delay, 0.18)}
      style={{ perspective: 1200 }}
    >
      <Link
        href={href}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        data-cursor="gallery-item"
        className="group relative block h-full min-h-[18rem] overflow-hidden rounded-card border border-line/12 bg-ink shadow-[0_32px_120px_rgba(12,10,8,0.12)] transition-transform duration-500 ease-out"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        }}
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={sizes}
          className={`parallax-img sharpen-img transition-transform duration-1000 ease-out group-hover:scale-[1.08] ${
            imageFit === "contain" ? "object-contain scale-100" : "object-cover scale-[1.08]"
          }`}
          style={{ objectPosition: imagePosition || photo.objectPosition || "center center" }}
          quality={90}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,8,0),rgba(12,10,8,0.08),rgba(12,10,8,0.35))] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </Link>
    </motion.div>
  );
}

export const wordRevealVariant = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } },
};

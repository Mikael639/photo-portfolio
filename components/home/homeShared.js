import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export const specialties = [
  {
    title: "Fashion Week",
    focus: "Runway, backstage, street style",
    description: "Un regard net et éditorial pour garder l'allure, le rythme et la tension d'un défilé.",
  },
  {
    title: "Mariage",
    focus: "Préparation, cérémonie, réception",
    description: "Un reportage sobre et sensible, construit pour tenir dans le temps sans surjouer l'émotion.",
  },
  {
    title: "Shooting photo",
    focus: "Portrait, direction, série",
    description: "Des images construites avec précision pour garder une allure forte et une lecture immédiate.",
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
        className="group relative block h-full min-h-[18rem] overflow-hidden rounded-[2.2rem] border border-line/12 bg-ink shadow-[0_32px_120px_rgba(12,10,8,0.12)] transition-transform duration-500 ease-out"
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
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,8,0),rgba(12,10,8,0),rgba(12,10,8,0.85))] transition-opacity duration-500 group-hover:opacity-100" />
        <div className="relative flex h-full flex-col justify-between p-6 md:p-8">
          <span className="w-fit rounded-full border border-white/12 bg-black/20 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-paper/75 backdrop-blur-md">
            {photo.category}
          </span>
          <div className="translate-y-0 opacity-100 transition-all duration-500 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
            <p className="max-w-[18rem] font-serif text-2xl leading-tight text-paper md:text-3xl">{photo.title}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export const wordRevealVariant = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } },
};

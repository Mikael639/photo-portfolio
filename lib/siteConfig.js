const DEFAULT_SITE_URL = "http://localhost:3000";

function normalizeUrl(value) {
  if (!value || typeof value !== "string") return null;

  const trimmedValue = value.trim();
  if (!trimmedValue) return null;

  try {
    return new URL(trimmedValue).toString().replace(/\/$/, "");
  } catch {
    try {
      return new URL(`https://${trimmedValue}`).toString().replace(/\/$/, "");
    } catch {
      return null;
    }
  }
}

export function getSiteUrl() {
  return (
    normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    normalizeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    DEFAULT_SITE_URL
  );
}

export function toAbsoluteUrl(pathname = "/") {
  return new URL(pathname, `${getSiteUrl()}/`).toString();
}

export const siteConfig = {
  name: "Jerrypicsart",
  shortName: "Jerrypicsart",
  defaultTitle: "Jerrypicsart Portfolio",
  description:
    "Portfolio photo editorial de Jerrypicsart pour la mode, les mariages, les eglises et les concerts.",
  locale: "fr_FR",
  keywords: [
    "photographe",
    "portfolio photo",
    "photographe mode",
    "fashion week",
    "photographe mariage",
    "photographe concert",
    "photo editoriale",
    "Jerrypicsart",
  ],
  navigation: [
    { href: "/", label: "Accueil" },
    { href: "/gallery", label: "Galerie" },
    { href: "/about", label: "A propos" },
    { href: "/contact", label: "Contact" },
  ],
  categoryLabels: ["Fashion Week", "Mariage", "Eglise", "Concert"],
};

export const sitePages = [
  { href: "/", changeFrequency: "weekly", priority: 1 },
  { href: "/gallery", changeFrequency: "weekly", priority: 0.9 },
  { href: "/about", changeFrequency: "monthly", priority: 0.7 },
  { href: "/contact", changeFrequency: "monthly", priority: 0.8 },
];

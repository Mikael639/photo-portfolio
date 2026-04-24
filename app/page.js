import { existsSync } from "node:fs";
import path from "node:path";
import HomePageExperience from "../components/home/HomePageExperience";
import { getPhotoObjectPosition } from "../lib/photoPresentation";
import { getPublicPhotos } from "../lib/photoRepository";
import { getSiteUrl, siteConfig, toAbsoluteUrl } from "../lib/siteConfig";

export const metadata = {
  title: "Accueil",
  description:
    "Portfolio photo editorial de Jerrypicsart pour fashion week, mariages et shootings photo.",
  alternates: {
    canonical: "/",
  },
};

const fallbackByCategory = {
  "Fashion Week": "/images/mariage/5.jpg",
  Mariage: "/images/mariage/4.jpg",
  "Shooting photo": "/images/mariage/5.jpg",
  Portfolio: "/images/mariage/5.jpg",
};

const defaultFallbackPhoto = {
  id: "fallback-photo",
  src: "/images/mariage/5.jpg",
  alt: "Photographie Jerrypicsart",
  title: "Selection Jerrypicsart",
  category: "Portfolio",
  roles: [],
  objectPosition: "center center",
};

function getFirstPhotoByRole(list, role) {
  for (const photo of list) {
    if (photo.roles?.includes(role)) return photo;
  }

  return null;
}

function hasRenderableSource(src) {
  if (!src || typeof src !== "string") return false;
  if (/^https?:\/\//.test(src)) return true;
  if (!src.startsWith("/")) return false;

  const relativePath = src.replace(/^\/+/, "").split("/").join(path.sep);
  return existsSync(path.join(process.cwd(), "public", relativePath));
}

function getFallbackSrc(category) {
  return fallbackByCategory[category] || defaultFallbackPhoto.src;
}

function normalizePhoto(photo) {
  const category = photo?.category || "Portfolio";
  const title = photo?.title || "Selection Jerrypicsart";
  const src = hasRenderableSource(photo?.src) ? photo.src : getFallbackSrc(category);

  return {
    id: photo?.id || `${category}-${title}-${src}`,
    src,
    alt: photo?.alt || title || defaultFallbackPhoto.alt,
    title,
    category,
    roles: Array.isArray(photo?.roles) ? photo.roles : [],
    objectPosition: getPhotoObjectPosition({ ...photo, title }),
  };
}

function collectPhotos(pool, count, excludeIds = [], fallbackPhoto = defaultFallbackPhoto) {
  const taken = [];
  const seen = new Set(excludeIds);

  for (const photo of pool) {
    if (!photo || seen.has(photo.id)) continue;
    seen.add(photo.id);
    taken.push(photo);
    if (taken.length === count) return taken;
  }

  while (taken.length < count) {
    const index = taken.length + 1;
    taken.push({
      ...fallbackPhoto,
      id: `${fallbackPhoto.id}-fallback-${index}`,
      src: getFallbackSrc(fallbackPhoto.category),
    });
  }

  return taken;
}

function buildCategoryPriority(pool, preferredCategories = []) {
  const availableCategories = [];

  for (const photo of pool) {
    const category = photo?.category || "Shooting photo";
    if (!availableCategories.includes(category)) {
      availableCategories.push(category);
    }
  }

  const ordered = [];

  for (const category of preferredCategories) {
    if (availableCategories.includes(category) && !ordered.includes(category)) {
      ordered.push(category);
    }
  }

  for (const category of availableCategories) {
    if (!ordered.includes(category)) {
      ordered.push(category);
    }
  }

  return ordered;
}

function collectMixedPhotos(
  pool,
  count,
  { excludeIds = [], preferredCategories = [], fallbackPhoto = defaultFallbackPhoto } = {}
) {
  const taken = [];
  const seen = new Set(excludeIds);
  const grouped = new Map();

  for (const photo of pool) {
    if (!photo || seen.has(photo.id)) continue;

    const category = photo.category || "Shooting photo";
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }

    grouped.get(category).push(photo);
  }

  const categoryPriority = buildCategoryPriority(pool, preferredCategories);
  let progressed = true;

  while (taken.length < count && progressed) {
    progressed = false;

    for (const category of categoryPriority) {
      const bucket = grouped.get(category) || [];
      const nextPhoto = bucket.shift();
      if (!nextPhoto || seen.has(nextPhoto.id)) continue;

      seen.add(nextPhoto.id);
      taken.push(nextPhoto);
      progressed = true;

      if (taken.length === count) break;
    }
  }

  if (taken.length < count) {
    for (const photo of pool) {
      if (!photo || seen.has(photo.id)) continue;
      seen.add(photo.id);
      taken.push(photo);
      if (taken.length === count) break;
    }
  }

  while (taken.length < count) {
    const index = taken.length + 1;
    taken.push({
      ...fallbackPhoto,
      id: `${fallbackPhoto.id}-mixed-fallback-${index}`,
      src: getFallbackSrc(fallbackPhoto.category),
    });
  }

  return taken;
}

export default async function HomePage() {
  let sourcePhotos = [];

  try {
    sourcePhotos = await getPublicPhotos({ limit: 48 });
  } catch {
    sourcePhotos = [];
  }

  const curatedPhotos = sourcePhotos.filter((photo) => photo?.category !== "Concert" && photo?.category !== "Eglise");
  const photos = (curatedPhotos.length ? curatedPhotos : [defaultFallbackPhoto]).map(normalizePhoto);

  const heroPhoto = normalizePhoto(getFirstPhotoByRole(photos, "hero") || photos[0] || defaultFallbackPhoto);
  const featuredPool = photos.filter((photo) => photo.roles?.includes("featured"));
  const editorialPool = [...featuredPool, ...photos];
  const alternateCategories = Array.from(
    new Set(photos.map((photo) => photo.category).filter((category) => category && category !== heroPhoto.category))
  );
  const supportingPreferredCategories = alternateCategories.length
    ? [...alternateCategories, heroPhoto.category]
    : [heroPhoto.category];
  const featuredPreferredCategories = alternateCategories.length
    ? [...alternateCategories, heroPhoto.category]
    : [heroPhoto.category];

  const supportingPhotos = collectMixedPhotos(editorialPool, 2, {
    excludeIds: [heroPhoto.id],
    preferredCategories: supportingPreferredCategories,
    fallbackPhoto: heroPhoto,
  });
  const featuredPhotos = collectMixedPhotos(editorialPool, 4, {
    excludeIds: [heroPhoto.id],
    preferredCategories: featuredPreferredCategories,
    fallbackPhoto: supportingPhotos[0] || heroPhoto,
  });
  const servicesBackground = normalizePhoto(
    getFirstPhotoByRole(photos, "servicesBackground") || supportingPhotos[0] || heroPhoto
  );
  const identityPhoto = collectMixedPhotos(photos, 1, {
    excludeIds: [heroPhoto.id, servicesBackground.id, ...featuredPhotos.map((photo) => photo.id)],
    preferredCategories: alternateCategories.length
      ? [heroPhoto.category, ...alternateCategories]
      : [heroPhoto.category],
    fallbackPhoto: supportingPhotos[0] || heroPhoto,
  })[0];
  const closingPhoto = collectPhotos(
    photos,
    1,
    [heroPhoto.id, servicesBackground.id, identityPhoto.id, ...featuredPhotos.map((photo) => photo.id)],
    identityPhoto || heroPhoto
  )[0];
  const categories = Array.from(new Set(photos.map((photo) => photo.category).filter(Boolean))).slice(0, 4);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.name,
      url: getSiteUrl(),
      inLanguage: "fr-FR",
      description: siteConfig.description,
    },
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "@id": `${getSiteUrl()}/#studio`,
      name: siteConfig.name,
      url: getSiteUrl(),
      description: siteConfig.description,
      image: heroPhoto?.src?.startsWith("http") ? heroPhoto.src : toAbsoluteUrl(heroPhoto?.src || "/images/shot-01.svg"),
      sameAs: siteConfig.socialLinks.map((link) => link.href),
      serviceType: categories.length ? categories : siteConfig.categoryLabels,
      knowsAbout: siteConfig.categoryLabels,
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      <HomePageExperience
        heroPhoto={heroPhoto}
        supportingPhotos={supportingPhotos}
        featuredPhotos={featuredPhotos}
        identityPhoto={identityPhoto}
        servicesBackground={servicesBackground}
        closingPhoto={closingPhoto}
        categories={categories}
        cinematicPool={photos}
      />
    </>
  );
}

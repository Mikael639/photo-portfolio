import GalleryExperience from "../../components/gallery/GalleryExperience";
import { portfolioCategories } from "../../lib/categories";
import { enhancePhotoPresentation } from "../../lib/photoPresentation";
import { getPublicPhotos } from "../../lib/photoRepository";

export const metadata = {
  title: "Galerie",
  description: "Galerie editoriale de Jerrypicsart: events, fashion, studio et fashion wedding.",
  alternates: {
    canonical: "/gallery",
  },
};

function buildCategories(photos) {
  const derivedCategories = Array.from(new Set(photos.map((photo) => photo.category).filter(Boolean)));
  const orderedCategories = [];

  for (const category of [...portfolioCategories, ...derivedCategories]) {
    if (!orderedCategories.includes(category)) {
      orderedCategories.push(category);
    }
  }

  return ["Tout", ...orderedCategories];
}

function filterPhotosByCategory(photos, category) {
  if (!category || category === "Tout") return photos;
  return photos.filter((photo) => photo.category === category);
}

export default async function GalleryPage({ searchParams }) {
  const resolvedSearchParams = (await searchParams) || {};
  const requestedCategory = typeof resolvedSearchParams.category === "string" ? resolvedSearchParams.category : "Tout";
  let allPhotos = [];

  try {
    allPhotos = (await getPublicPhotos()).map(enhancePhotoPresentation);
  } catch {
    allPhotos = [];
  }

  const categories = buildCategories(allPhotos);
  const initialCategory = categories.includes(requestedCategory) ? requestedCategory : "Tout";

  return (
    <GalleryExperience
      photos={filterPhotosByCategory(allPhotos, initialCategory)}
      allPhotos={allPhotos}
      activeCategory={initialCategory}
      categories={categories}
    />
  );
}

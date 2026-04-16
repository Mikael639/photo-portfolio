import GalleryExperience from "../../components/gallery/GalleryExperience";
import { enhancePhotoPresentation } from "../../lib/photoPresentation";
import { getPublicPhotos } from "../../lib/photoRepository";

export const metadata = {
  title: "Galerie",
  description: "Galerie editoriale de Jerrypicsart entre mode, mariage, eglise et concert.",
  alternates: {
    canonical: "/gallery",
  },
};

const defaultCategories = ["Fashion Week", "Mariage", "Eglise", "Concert"];

function buildCategories(photos) {
  const derivedCategories = Array.from(new Set(photos.map((photo) => photo.category).filter(Boolean)));
  const orderedCategories = [];

  for (const category of [...defaultCategories, ...derivedCategories]) {
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
  const categoryFilter = requestedCategory === "Tout" ? undefined : requestedCategory;
  let allPhotos = [];
  let initialPhotos = [];

  try {
    const [allResults, filteredResults] = await Promise.all([
      getPublicPhotos(),
      getPublicPhotos({ category: categoryFilter }),
    ]);

    allPhotos = allResults.map(enhancePhotoPresentation);
    initialPhotos = filteredResults.map(enhancePhotoPresentation);
  } catch {
    allPhotos = [];
    initialPhotos = [];
  }

  const categories = buildCategories(allPhotos);
  const initialCategory = categories.includes(requestedCategory) ? requestedCategory : "Tout";

  return (
    <GalleryExperience
      photos={filterPhotosByCategory(initialPhotos, initialCategory)}
      activeCategory={initialCategory}
      categories={categories}
    />
  );
}

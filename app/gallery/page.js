import GalleryExperience from "../../components/gallery/GalleryExperience";
import { enhancePhotoPresentation } from "../../lib/photoPresentation";
import { getPublicPhotos } from "../../lib/photoRepository";

export const metadata = {
  title: "Galerie",
  description: "Galerie editoriale de Jerrypicsart entre mode, mariage, eglise et concert.",
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

export default async function GalleryPage() {
  let initialPhotos = [];

  try {
    initialPhotos = (await getPublicPhotos()).map(enhancePhotoPresentation);
  } catch {
    initialPhotos = [];
  }

  return <GalleryExperience initialPhotos={initialPhotos} categories={buildCategories(initialPhotos)} />;
}


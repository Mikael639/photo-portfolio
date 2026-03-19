import AboutExperience from "../../components/about/AboutExperience";
import { enhancePhotoPresentation } from "../../lib/photoPresentation";
import { getPublicPhotos } from "../../lib/photoRepository";

export const metadata = {
  title: "A propos",
  description: "L'approche photographique de Jerrypicsart entre mode, mariage et evenementiel.",
};

function findByTitle(photos, titles, excludeIds = []) {
  const excluded = new Set(excludeIds);

  for (const title of titles) {
    const match = photos.find((photo) => !excluded.has(photo.id) && photo.title === title);
    if (match) return match;
  }

  return photos.find((photo) => !excluded.has(photo.id)) || null;
}

function findByCategory(photos, categories, excludeIds = []) {
  const excluded = new Set(excludeIds);

  for (const category of categories) {
    const match = photos.find((photo) => !excluded.has(photo.id) && photo.category === category);
    if (match) return match;
  }

  return photos.find((photo) => !excluded.has(photo.id)) || null;
}

export default async function AboutPage() {
  let photos = [];

  try {
    photos = (await getPublicPhotos({ limit: 18 })).map(enhancePhotoPresentation);
  } catch {
    photos = [];
  }

  const leadPhoto =
    findByTitle(photos, ["Voile et regard", "Portrait couture", "Couple et cabriolet", "Ouverture de defile"]) ||
    null;
  const secondaryPhoto =
    findByTitle(photos, ["Portrait couture", "Ouverture de defile", "Voile et regard"], [leadPhoto?.id]) || null;
  const atmospherePhoto =
    findByCategory(photos, ["Mariage", "Fashion Week"], [leadPhoto?.id, secondaryPhoto?.id]) || null;

  return (
    <AboutExperience leadPhoto={leadPhoto} secondaryPhoto={secondaryPhoto} atmospherePhoto={atmospherePhoto} />
  );
}

import ContactExperience from "../../components/contact/ContactExperience";
import { enhancePhotoPresentation } from "../../lib/photoPresentation";
import { getPublicPhotos } from "../../lib/photoRepository";

export const metadata = {
  title: "Contact",
  description: "Contacter Jerrypicsart pour une date, une commande editoriale ou une prestation evenementielle.",
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

export default async function ContactPage() {
  let photos = [];

  try {
    photos = (await getPublicPhotos({ limit: 18 })).map(enhancePhotoPresentation);
  } catch {
    photos = [];
  }

  const leadPhoto =
    findByTitle(photos, ["Couple et cabriolet", "Voile et regard", "Ouverture de defile", "Portrait couture"]) ||
    null;
  const secondaryPhoto =
    findByCategory(photos, ["Fashion Week", "Mariage"], [leadPhoto?.id]) ||
    findByTitle(photos, ["Portrait couture", "Entree de reception"], [leadPhoto?.id]) ||
    null;

  return <ContactExperience leadPhoto={leadPhoto} secondaryPhoto={secondaryPhoto} />;
}

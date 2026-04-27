const PHOTO_FOCUS_BY_TITLE = {
  "ouverture de defile": "center 16%",
  "arrivee de defile": "center 22%",
  "reception en couleurs": "center 18%",
  "portrait couture": "center 16%",
  "duo tailleur": "center 14%",
  "presence argentee": "center 16%",
  "silhouette editoriale": "center 14%",
  "tension douce": "center 38%",
  "clair obscur": "center 24%",
  "en mouvement": "center center",
  "fashion intro": "center 18%",
  "street style": "center 18%",
  "backstage mood": "center 24%",
  "runway detail": "center center",

  "reception panoramique": "center center",
  "couple et cabriolet": "center 56%",
  "silhouette au flash": "center 20%",
  "voile et regard": "center 24%",
  "invitation au soir": "center 32%",
  "balcon de reception": "center 44%",
  "portrait au jardin": "center 22%",
  "ceremonie en hauteur": "center center",
  "entree de reception": "center 22%",
  "etreinte en mouvement": "center 34%",
  "pont en noir et blanc": "center 34%",
  "couple et voiture de nuit": "center 30%",
  "detail bijoux": "center center",
  "dos nu a la fenetre": "center 18%",
  "mariage ceremony": "center 28%",
  "wedding details": "center center",

  "dan luiten en scene": "center 22%",
  "yemi alade au zenith": "center 18%",
  "franglish en rouge": "center 18%",
  "ignite en silhouette": "center 26%",
  "black m sous les projecteurs": "center 18%",
};

export function getPhotoObjectPosition(photo) {
  const title = typeof photo?.title === "string" ? photo.title.trim().toLowerCase() : "";
  return PHOTO_FOCUS_BY_TITLE[title] || "center center";
}

export function enhancePhotoPresentation(photo) {
  if (!photo) return photo;

  return {
    ...photo,
    objectPosition: photo.objectPosition || getPhotoObjectPosition(photo),
  };
}

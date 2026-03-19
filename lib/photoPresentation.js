const PHOTO_FOCUS_BY_TITLE = {
  "ouverture de defile": "center 16%",
  "arrivee de defile": "center 14%",
  "reception en couleurs": "center 18%",
  "portrait couture": "center 16%",
  "duo tailleur": "center 14%",
  "presence argentee": "center 16%",
  "reception panoramique": "center center",
  "silhouette editoriale": "center 14%",
  "couple et cabriolet": "center 18%",
  "silhouette au flash": "center 20%",
  "voile et regard": "center 24%",
  "portrait au jardin": "center 22%",
  "ceremonie en hauteur": "center center",
  "entree de reception": "center 22%",
  "detail bijoux": "center center",
  "dos nu a la fenetre": "center 18%",
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

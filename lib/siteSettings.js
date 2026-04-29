const SETTINGS_TABLE = "site_settings";
const HOME_COPY_KEY = "home_copy";
const ABOUT_COPY_KEY = "about_copy";
const CATEGORIES_KEY = "categories";
const MAINTENANCE_MODE_KEY = "maintenance_mode";

export const defaultHomeCopy = {
  eyebrow: "Jerrypicsart portfolio editorial",
  primaryCta: "Explorer l'edit",
  secondaryCta: "Parler d'une date",
  directionTitle: "Luxe discret, intensite juste.",
  directionText:
    "Des silhouettes fortes, des receptions habitees et une retouche qui reste au service des personnes, des lieux et du rythme.",
  weddingEyebrow: "Fashion Wedding",
  weddingTitle: "Une elegance tenue, des images pensees pour durer.",
  weddingText: "Entre allure, emotion et presence, chaque image cherche un equilibre sobre, fort et intemporel.",
};

export const defaultAboutCopy = {
  headline: "Je photographie les personnes et les moments qui comptent.",
  subheadline:
    "Un parcours inattendu et un regard bien à lui. Jerrypicsart construit une photographie à la frontière de la mode, du mariage haut de gamme, des events et des personnalités. Une image tenue, précise, mais jamais froide.",
  storyTitle: "Avant l'image, il y avait déjà l'attention aux gens.",
  storyParagraphs: [
    "Rien ne me prédestinait à ça. J'ai fait du marketing, du growth hacking. J'ai appris à comprendre les gens, à lire ce qui les fait vibrer, ce qui les fait choisir. Sans le savoir, je me préparais déjà.",
    "Et puis il y a eu ce feu. Pas une révélation soudaine. Plutôt quelque chose qui s'est imposé de l'intérieur, comme une évidence que j'avais longtemps ignorée. La photographie n'était pas un plan B. C'était ce vers quoi je revenais.",
    "Comme sur un terrain de basket, j'ai tout donné. Je me suis formé avec exigence, j'ai cultivé mon regard, j'ai construit un univers à la frontière de la mode et du mariage haut de gamme, là où l'esthétique ne doit jamais sacrifier l'émotion.",
    "Aujourd'hui, mon objectif se pose sur des couples, des célébrités, des instants intimes et des scènes plus visibles. Mais derrière chaque séance, ma conviction reste la même : chaque personne mérite d'être vue avec la même attention, la même exigence, la même humanité.",
  ],
  values: [
    {
      label: "Présence",
      text: "Voir la personne avant le statut, l'attitude avant la pose, la présence avant le décor.",
    },
    {
      label: "Tenue",
      text: "Construire des images propres, élégantes et maîtrisées, sans retirer la vie du moment.",
    },
    {
      label: "Émotion",
      text: "Garder une trace sincère, même lorsque l'image prend une dimension éditoriale.",
    },
  ],
  manifestoTitle: "Chaque personne mérite d'être vue avec attention.",
  manifestoText:
    "Couples, célébrités, entrepreneurs, familles ou invités d'un événement : le cadre change, mais l'intention reste la même. Faire une image qui respecte la personne et élève le moment.",
  profilePhoto: "/images/about/jerrypicsart-profile-bw.jpeg",
  portraitPhoto: "/images/about/jerrypicsart-portrait-blue.jpeg",
  convictionTitle: "Conviction",
  convictionText: "Le statut change. L'attention, jamais.",
};

export const defaultCategories = [
  "Events",
  "Fashion Week & Celebrities",
  "Studio",
  "Fashion Wedding",
];

function getSupabaseUrl() {
  return process.env.SUPABASE_URL || "";
}

function getSupabaseServiceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

function hasSupabaseAdminConfig() {
  return Boolean(getSupabaseUrl() && getSupabaseServiceKey());
}

function buildRestUrl(path) {
  return new URL(path, getSupabaseUrl()).toString();
}

function getAdminHeaders(contentType = "application/json") {
  const serviceRoleKey = getSupabaseServiceKey();
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": contentType,
  };
}

function normalizeCopy(value) {
  return {
    ...defaultHomeCopy,
    ...(value && typeof value === "object" ? value : {}),
  };
}

function normalizeAboutCopy(value) {
  return {
    ...defaultAboutCopy,
    ...(value && typeof value === "object" ? value : {}),
  };
}

function normalizeCategories(value) {
  return Array.isArray(value) ? value : defaultCategories;
}

async function fetchJsonOrThrow(response) {
  const payload = await response.text();

  if (!response.ok) {
    throw new Error(payload || `Request failed with status ${response.status}`);
  }

  return payload ? JSON.parse(payload) : null;
}

export async function getHomeCopy() {
  if (!hasSupabaseAdminConfig()) return defaultHomeCopy;

  try {
    const url = new URL(buildRestUrl(`/rest/v1/${SETTINGS_TABLE}`));
    url.searchParams.set("select", "value");
    url.searchParams.set("key", `eq.${HOME_COPY_KEY}`);
    url.searchParams.set("limit", "1");

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: getAdminHeaders(),
      next: {
        revalidate: 300,
        tags: ["site-settings"],
      },
    });

    const rows = await fetchJsonOrThrow(response);
    const list = Array.isArray(rows) ? rows : [];
    return normalizeCopy(list[0]?.value);
  } catch {
    return defaultHomeCopy;
  }
}

export async function updateHomeCopy(input) {
  const nextCopy = normalizeCopy(input);

  if (!hasSupabaseAdminConfig()) {
    return nextCopy;
  }

  const response = await fetch(buildRestUrl(`/rest/v1/${SETTINGS_TABLE}`), {
    method: "POST",
    headers: {
      ...getAdminHeaders(),
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      key: HOME_COPY_KEY,
      value: nextCopy,
      updated_at: new Date().toISOString(),
    }),
  });

  const rows = await fetchJsonOrThrow(response);
  const list = Array.isArray(rows) ? rows : [];
  return normalizeCopy(list[0]?.value || nextCopy);
}

export async function getAboutCopy() {
  if (!hasSupabaseAdminConfig()) return defaultAboutCopy;

  try {
    const url = new URL(buildRestUrl(`/rest/v1/${SETTINGS_TABLE}`));
    url.searchParams.set("select", "value");
    url.searchParams.set("key", `eq.${ABOUT_COPY_KEY}`);
    url.searchParams.set("limit", "1");

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: getAdminHeaders(),
      next: {
        revalidate: 300,
        tags: ["site-settings"],
      },
    });

    const rows = await fetchJsonOrThrow(response);
    const list = Array.isArray(rows) ? rows : [];
    return normalizeAboutCopy(list[0]?.value);
  } catch {
    return defaultAboutCopy;
  }
}

export async function updateAboutCopy(input) {
  const nextCopy = normalizeAboutCopy(input);

  if (!hasSupabaseAdminConfig()) {
    return nextCopy;
  }

  const response = await fetch(buildRestUrl(`/rest/v1/${SETTINGS_TABLE}`), {
    method: "POST",
    headers: {
      ...getAdminHeaders(),
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      key: ABOUT_COPY_KEY,
      value: nextCopy,
      updated_at: new Date().toISOString(),
    }),
  });

  const rows = await fetchJsonOrThrow(response);
  const list = Array.isArray(rows) ? rows : [];
  return normalizeAboutCopy(list[0]?.value || nextCopy);
}

export async function getCategories() {
  if (!hasSupabaseAdminConfig()) return defaultCategories;

  try {
    const url = new URL(buildRestUrl(`/rest/v1/${SETTINGS_TABLE}`));
    url.searchParams.set("select", "value");
    url.searchParams.set("key", `eq.${CATEGORIES_KEY}`);
    url.searchParams.set("limit", "1");

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: getAdminHeaders(),
      next: {
        revalidate: 300,
        tags: ["site-settings"],
      },
    });

    const rows = await fetchJsonOrThrow(response);
    const list = Array.isArray(rows) ? rows : [];
    return normalizeCategories(list[0]?.value);
  } catch {
    return defaultCategories;
  }
}

export async function updateCategories(input) {
  const nextCategories = normalizeCategories(input);

  if (!hasSupabaseAdminConfig()) {
    return nextCategories;
  }

  const response = await fetch(buildRestUrl(`/rest/v1/${SETTINGS_TABLE}`), {
    method: "POST",
    headers: {
      ...getAdminHeaders(),
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      key: CATEGORIES_KEY,
      value: nextCategories,
      updated_at: new Date().toISOString(),
    }),
  });

  const rows = await fetchJsonOrThrow(response);
  const list = Array.isArray(rows) ? rows : [];
  return normalizeCategories(list[0]?.value || nextCategories);
}

export async function getMaintenanceMode() {
  if (!hasSupabaseAdminConfig()) return false;

  try {
    const url = new URL(buildRestUrl(`/rest/v1/${SETTINGS_TABLE}`));
    url.searchParams.set("select", "value");
    url.searchParams.set("key", `eq.${MAINTENANCE_MODE_KEY}`);
    url.searchParams.set("limit", "1");

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: getAdminHeaders(),
      next: {
        revalidate: 60,
        tags: ["site-settings"],
      },
    });

    const rows = await fetchJsonOrThrow(response);
    const list = Array.isArray(rows) ? rows : [];
    return Boolean(list[0]?.value);
  } catch {
    return false;
  }
}

export async function updateMaintenanceMode(isEnabled) {
  if (!hasSupabaseAdminConfig()) return isEnabled;

  const response = await fetch(buildRestUrl(`/rest/v1/${SETTINGS_TABLE}`), {
    method: "POST",
    headers: {
      ...getAdminHeaders(),
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      key: MAINTENANCE_MODE_KEY,
      value: isEnabled,
      updated_at: new Date().toISOString(),
    }),
  });

  const rows = await fetchJsonOrThrow(response);
  const list = Array.isArray(rows) ? rows : [];
  return Boolean(list[0]?.value);
}

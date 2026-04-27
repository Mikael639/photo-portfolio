const SETTINGS_TABLE = "site_settings";
const HOME_COPY_KEY = "home_copy";

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

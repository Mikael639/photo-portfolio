import fs from "node:fs";
import path from "node:path";

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env.local");
  const raw = fs.readFileSync(envPath, "utf8");
  const values = {};

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    values[key] = value;
  }

  return values;
}

const env = loadEnvFile();
const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase admin configuration in .env.local");
}

const headers = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

function createAlt(title) {
  return `Photographie de concert intitulee ${title}`;
}

function formatRawConcertTitle(rawTitle) {
  const patterns = [
    [/^DanLuiten\s*ConcertMLK/i, "Dan Luiten en scene"],
    [/^Dan Luiten en scene\b/i, "Dan Luiten en scene"],
    [/^YemiAladeZenithParis/i, "Yemi Alade au Zenith"],
    [/^Yemi Alade au Zenith\b/i, "Yemi Alade au Zenith"],
    [/^Franglish\s*StationAfrique/i, "Franglish a Station Afrique"],
    [/^Franglish a Station Afrique\b/i, "Franglish a Station Afrique"],
    [/^Franglish en rouge\b/i, "Franglish en rouge"],
    [/^Ignite\s*2407/i, "Ignite en scene"],
    [/^Ignite en scene\b/i, "Ignite en scene"],
    [/^Ignite en silhouette\b/i, "Ignite en silhouette"],
    [/^BlackM\s*ClubFrance/i, "Black M en live"],
    [/^BlackM\b/i, "Black M en live"],
    [/^Black M en live\b/i, "Black M en live"],
    [/^Black M sous les projecteurs\b/i, "Black M sous les projecteurs"],
    [/^SHineGospelAwards2024/i, "Shine Gospel Awards"],
    [/^Shine Gospel Awards\b/i, "Shine Gospel Awards"],
    [/^SGA\b/i, "Shine Gospel Awards"],
    [/^MLKConcertSolidarite/i, "Concert solidarite MLK"],
    [/^Concert solidarite MLK\b/i, "Concert solidarite MLK"],
    [/^MLKCelebs/i, "Celebration MLK"],
    [/^MLKCe/i, "Celebration MLK"],
    [/^Celebration MLK\b/i, "Celebration MLK"],
    [/^Locko10ans/i, "Locko 10 ans"],
    [/^Locko 10 ans\b/i, "Locko 10 ans"],
    [/^PAJESunrise/i, "Paje Sunrise"],
    [/^Paje Sunrise\b/i, "Paje Sunrise"],
    [/^ECHODay1/i, "Echo Day 1"],
    [/^Echo Day 1\b/i, "Echo Day 1"],
    [/^CysoulConcert0806\s*FGOBarbara/i, "Cysoul a FGO Barbara"],
    [/^Cysoul a FGO Barbara\b/i, "Cysoul a FGO Barbara"],
  ];

  for (const [pattern, formatted] of patterns) {
    if (pattern.test(rawTitle)) {
      return formatted;
    }
  }

  return null;
}

async function fetchConcertPhotos() {
  const url = new URL("/rest/v1/photos", SUPABASE_URL);
  url.searchParams.set("select", "id,title,alt,roles,is_pinned,category");
  url.searchParams.set("category", "eq.Concert");
  url.searchParams.append("order", "created_at.desc");

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`Unable to load concert photos: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

async function updatePhoto(id, payload) {
  const url = new URL("/rest/v1/photos", SUPABASE_URL);
  url.searchParams.set("id", `eq.${id}`);

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      ...headers,
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Unable to update ${id}: ${response.status} ${await response.text()}`);
  }
}

async function main() {
  const rows = await fetchConcertPhotos();
  let renamedCount = 0;
  let curatedCount = 0;

  for (const row of rows) {
    const rawTitle = row.title || "";
    const normalized = formatRawConcertTitle(rawTitle);

    if (!normalized) continue;

    const patch = {};
    if (rawTitle !== normalized) {
      patch.title = normalized;
      patch.alt = createAlt(normalized);
      renamedCount += 1;
    }

    if (Object.keys(patch).length > 0) {
      await updatePhoto(row.id, patch);
    }
  }

  const visibleEditorialTitles = [
    {
      id: "0e2bf725-6013-458b-affd-e9b67ddc5924",
      title: "Dan Luiten en scene",
      alt: "Dan Luiten sous les projecteurs pendant un concert",
    },
    {
      id: "e284eaf4-832c-4119-b5cd-8215ad4f7fe7",
      title: "Yemi Alade en mouvement",
      alt: "Yemi Alade en mouvement sur la scene du Zenith",
    },
    {
      id: "e6e1b4ec-cb9c-4cc6-a0dc-a305f2d5b804",
      title: "Yemi Alade en majeste",
      alt: "Portrait de Yemi Alade en tenue doree sur scene",
    },
    {
      id: "77c6e1fb-51eb-43cf-84f6-26bb24a02bdc",
      title: "Franglish en rouge",
      alt: "Franglish sur scene dans une lumiere rouge",
    },
    {
      id: "8d7b965b-1ac1-49ac-a965-00f05cbd3c98",
      title: "Foule bleue",
      alt: "Scene de concert avec une foule en contre-jour bleu",
    },
    {
      id: "5d2aa348-a3b2-4bc0-b470-58a9d1bb4933",
      title: "Ignite en silhouette",
      alt: "Silhouette en mouvement sous une lumiere bleue de concert",
    },
    {
      id: "6cba8489-1bad-484c-81b4-a6877bf2c6f2",
      title: "Dan Luiten au lointain",
      alt: "Dan Luiten sur scene dans une lumiere lointaine",
    },
    {
      id: "4185c9b2-0c2d-4ca6-968a-06a13f92e082",
      title: "Dan Luiten au seuil",
      alt: "Dan Luiten devant une arche de lumiere sur scene",
    },
    {
      id: "3cc3bc4a-3486-4be4-8edc-65ceaf305faf",
      title: "Eclats de scene",
      alt: "Concert acoustique devant un decor rouge en eclats lumineux",
    },
    {
      id: "fcb86418-e578-4b84-96c0-80ae65c045ec",
      title: "Black M sous les projecteurs",
      alt: "Black M sur scene dans une atmosphere bleue et lumineuse",
    },
    {
      id: "f02195d7-87cc-4907-a690-fa544b27ec74",
      title: "Yemi Alade en cadence",
      alt: "Yemi Alade sur scene dans une lumiere dramatique",
    },
    {
      id: "d8333452-2ca1-4d04-979b-08c342c5cf2c",
      title: "Locko en celebration",
      alt: "Locko sur scene lors d un concert anniversaire",
    },
    {
      id: "21c069cd-864a-4cc1-b2ba-0c05e3a2d7ec",
      title: "Dan Luiten et la salle",
      alt: "Dan Luiten face au public sous les faisceaux lumineux",
    },
    {
      id: "4dd81259-0953-46fc-aff6-50cf0cc8c834",
      title: "Yemi Alade a contre-jour",
      alt: "Yemi Alade en portrait dans un contre-jour de scene",
    },
    {
      id: "3c5cf736-1c0d-42d1-aac8-7ade2a2353a5",
      title: "Dan Luiten en clair-obscur",
      alt: "Dan Luiten eclaire par un faisceau de scene en clair-obscur",
    },
    {
      id: "01d5e824-864f-440e-be9f-02a1e118a838",
      title: "Locko en lumiere",
      alt: "Locko saisi dans une lumiere de scene douce",
    },
    {
      id: "a1d0c732-7fbc-4d04-a202-3349ff46e317",
      title: "Dan Luiten au premier plan",
      alt: "Dan Luiten au premier plan pendant un concert",
    },
    {
      id: "12221eea-5571-4eef-b22c-abc6431a7b79",
      title: "Nuit gospel",
      alt: "Performance gospel dans une ambiance rouge et sombre",
    },
    {
      id: "7dc239cf-cdc7-40ad-98e1-3532e43e7424",
      title: "Yemi Alade en silhouette",
      alt: "Yemi Alade dessinee en silhouette sur scene",
    },
    {
      id: "1cb7cb2c-8f2d-4dcc-ba99-bda1fad27092",
      title: "Choeur en rouge",
      alt: "Scene gospel en rouge pendant une remise de prix",
    },
    {
      id: "adc1f82d-c9e8-448b-87d1-146899d897c3",
      title: "Rideau de lumiere",
      alt: "Scene musicale habitee par un rideau de lumiere",
    },
    {
      id: "7ee9c509-bb12-44c3-8c60-ab4e710830ec",
      title: "Dan Luiten a distance",
      alt: "Dan Luiten photographie a distance dans une scene bleue",
    },
    {
      id: "6382fec6-a67e-4787-9627-9c3303986ca2",
      title: "Locko face au public",
      alt: "Locko face au public dans une ambiance de concert",
    },
    {
      id: "435b924c-cb54-41e9-8ce8-5265289d4500",
      title: "Franglish en tension",
      alt: "Franglish saisi dans un instant de tension sur scene",
    },
    {
      id: "de42a7d1-c1f5-4dc5-bbc4-3e4328a0354d",
      title: "Franglish et la foule",
      alt: "Franglish face au public pendant un concert",
    },
    {
      id: "b7171201-8c6d-4089-a14c-8b8f1ca4bae6",
      title: "Black M a l avant-scene",
      alt: "Black M a l avant-scene dans une lumiere rouge",
    },
    {
      id: "ce3d2df8-c858-427c-92dd-8a4fd5c98231",
      title: "Black M en grand angle",
      alt: "Black M saisi en grand angle depuis la foule",
    },
    {
      id: "8a766591-cc1f-412b-ad26-23a910d5c459",
      title: "Gospel en elevation",
      alt: "Performance gospel en elevation sous la lumiere",
    },
    {
      id: "3b48ae8b-802e-4269-9399-131edd54dd2e",
      title: "Yemi Alade en portrait",
      alt: "Portrait de Yemi Alade sur la scene du Zenith",
    },
    {
      id: "984e62b3-c2ae-4bb9-a3e5-f733bc33a6b1",
      title: "Ignite sous les faisceaux",
      alt: "Scene musicale sous des faisceaux lumineux bleus",
    },
  ];

  for (const item of visibleEditorialTitles) {
    const row = rows.find((photo) => photo.id === item.id);
    if (!row) continue;

    await updatePhoto(row.id, {
      title: item.title,
      alt: item.alt,
    });

    curatedCount += 1;
  }

  const curatedHighlights = [
    {
      id: "0e2bf725-6013-458b-affd-e9b67ddc5924",
      title: "Dan Luiten en scene",
      alt: "Dan Luiten sous les projecteurs pendant un concert",
      roles: ["featured"],
    },
    {
      id: "e6e1b4ec-cb9c-4cc6-a0dc-a305f2d5b804",
      title: "Yemi Alade au Zenith",
      alt: "Portrait de Yemi Alade sur scene au Zenith de Paris",
      roles: ["featured"],
    },
    {
      id: "77c6e1fb-51eb-43cf-84f6-26bb24a02bdc",
      title: "Franglish en rouge",
      alt: "Franglish sur scene dans une lumiere rouge",
      roles: ["featured"],
    },
    {
      id: "5d2aa348-a3b2-4bc0-b470-58a9d1bb4933",
      title: "Ignite en silhouette",
      alt: "Silhouette en mouvement sous une lumiere bleue de concert",
      roles: [],
    },
    {
      id: "fcb86418-e578-4b84-96c0-80ae65c045ec",
      title: "Black M sous les projecteurs",
      alt: "Black M sur scene dans une atmosphere bleue et lumineuse",
      roles: ["featured"],
    },
  ];

  for (const item of curatedHighlights) {
    const row = rows.find((photo) => photo.id === item.id);
    if (!row) continue;

    await updatePhoto(row.id, {
      title: item.title,
      alt: item.alt,
      roles: item.roles,
    });

    curatedCount += 1;
  }

  console.log(JSON.stringify({ renamedCount, curatedCount }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

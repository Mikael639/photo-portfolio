import fs from "node:fs";
import path from "node:path";

const PROJECT_ROOT = process.cwd();
const ENV_PATH = path.join(PROJECT_ROOT, ".env.local");

function readEnvFile() {
  const env = {};
  if (!fs.existsSync(ENV_PATH)) return env;

  const lines = fs.readFileSync(ENV_PATH, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith("#")) continue;
    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    env[key] = value;
  }

  return env;
}

function applyEnv(env) {
  for (const [key, value] of Object.entries(env)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => resolve(data.trim()));
    process.stdin.on("error", reject);
  });
}

function getExtension(sourceUrl, contentType) {
  if (contentType?.includes("png")) return ".png";
  if (contentType?.includes("webp")) return ".webp";
  if (contentType?.includes("gif")) return ".gif";

  const pathname = new URL(sourceUrl).pathname.toLowerCase();
  if (pathname.endsWith(".png")) return ".png";
  if (pathname.endsWith(".webp")) return ".webp";
  if (pathname.endsWith(".gif")) return ".gif";
  return ".jpg";
}

function toTitle(rawAlt) {
  return rawAlt
    .replace(/\.[^.]+$/, "")
    .replace(/[+_]+/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

function buildRestUrl(pathname) {
  return new URL(pathname, getRequiredEnv("SUPABASE_URL")).toString();
}

function getServiceHeaders(contentType) {
  const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    ...(contentType ? { "Content-Type": contentType } : {}),
  };
}

function sanitizeSegment(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function encodeStoragePath(storagePath) {
  return storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

async function fetchJson(response) {
  const payload = await response.text();
  if (!response.ok) {
    throw new Error(payload || `Supabase request failed with status ${response.status}`);
  }
  return payload ? JSON.parse(payload) : null;
}

async function getExistingConcertTitles() {
  const url = new URL(buildRestUrl("/rest/v1/photos"));
  url.searchParams.set("select", "title,category");
  url.searchParams.set("category", "eq.Concert");

  const rows = await fetchJson(
    await fetch(url, {
      method: "GET",
      headers: getServiceHeaders(),
    })
  );

  return new Set((Array.isArray(rows) ? rows : []).map((row) => String(row.title || "").trim()));
}

async function uploadToStorage(buffer, sourceUrl, fileName) {
  const bucket = process.env.SUPABASE_BUCKET || "portfolio-images";
  const storagePath = `concert/${Date.now()}-${sanitizeSegment(fileName) || "concert-photo.jpg"}`;
  const uploadUrl = buildRestUrl(`/storage/v1/object/${bucket}/${encodeStoragePath(storagePath)}`);
  const contentType = getExtension(sourceUrl, "");
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      ...getServiceHeaders(contentType === ".png" ? "image/png" : contentType === ".webp" ? "image/webp" : "image/jpeg"),
      "x-upsert": "false",
    },
    body: buffer,
  });

  await fetchJson(response);

  return {
    storagePath,
    publicUrl: `${getRequiredEnv("SUPABASE_URL")}/storage/v1/object/public/${bucket}/${encodeStoragePath(storagePath)}`,
  };
}

async function createPhotoRecord({ title, alt, publicUrl, storagePath }) {
  const payload = {
    title,
    alt,
    category: "Concert",
    image_url: publicUrl,
    storage_path: storagePath,
    roles: [],
    is_published: true,
    is_pinned: false,
  };

  await fetchJson(
    await fetch(buildRestUrl("/rest/v1/photos"), {
      method: "POST",
      headers: {
        ...getServiceHeaders("application/json"),
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    })
  );
}

async function main() {
  applyEnv(readEnvFile());

  const input = await readStdin();
  if (!input) {
    throw new Error("Missing JSON batch on stdin.");
  }

  const items = JSON.parse(input);
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Empty or invalid Pixieset batch.");
  }

  const existingTitles = await getExistingConcertTitles();

  let imported = 0;
  let skipped = 0;

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const title = toTitle(item.alt || `Concert ${index + 1}`);
    if (!item?.src || !title) {
      skipped += 1;
      continue;
    }

    if (existingTitles.has(title)) {
      skipped += 1;
      continue;
    }

    const imageResponse = await fetch(item.src);
    if (!imageResponse.ok) {
      throw new Error(`Image download failed for ${item.src} with status ${imageResponse.status}`);
    }

    const extension = getExtension(item.src, imageResponse.headers.get("content-type") || "image/jpeg");
    const fileName = `concert-${String(index + 1).padStart(3, "0")}${extension}`;
    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    const { storagePath, publicUrl } = await uploadToStorage(buffer, item.src, fileName);
    await createPhotoRecord({
      title,
      alt: title,
      publicUrl,
      storagePath,
    });

    existingTitles.add(title);
    imported += 1;

    if ((index + 1) % 10 === 0 || index === items.length - 1) {
      console.log(`processed ${index + 1}/${items.length}`);
    }
  }

  console.log(JSON.stringify({ imported, skipped, total: items.length }, null, 2));
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});

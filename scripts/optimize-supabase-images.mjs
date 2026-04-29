import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const PROJECT_ROOT = process.cwd();
const ENV_PATH = path.join(PROJECT_ROOT, ".env.local");
const MAX_EDGE = 2000;
const JPEG_QUALITY = 82;
const MIN_SAVING_RATIO = 0.92;
const CONCURRENCY = 4;

function readEnvFile() {
  const env = {};
  if (!fs.existsSync(ENV_PATH)) return env;

  const lines = fs.readFileSync(ENV_PATH, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith("#")) continue;
    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) continue;
    env[line.slice(0, separatorIndex).trim()] = line.slice(separatorIndex + 1).trim();
  }

  return env;
}

function applyEnv(env) {
  for (const [key, value] of Object.entries(env)) {
    if (!process.env[key]) process.env[key] = value;
  }
}

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

function getBucket() {
  return process.env.SUPABASE_BUCKET || "portfolio-images";
}

function buildRestUrl(pathname) {
  return new URL(pathname, getRequiredEnv("SUPABASE_URL")).toString();
}

function getServiceHeaders(contentType) {
  const key = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    ...(contentType ? { "Content-Type": contentType } : {}),
  };
}

function encodeStoragePath(storagePath) {
  return storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
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

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function fetchJson(response) {
  const payload = await response.text();
  if (!response.ok) throw new Error(payload || `Request failed with ${response.status}`);
  return payload ? JSON.parse(payload) : null;
}

async function getPhotos() {
  const url = new URL(buildRestUrl("/rest/v1/photos"));
  url.searchParams.set("select", "id,title,category,image_url,storage_path");
  url.searchParams.append("order", "created_at.asc");
  const rows = await fetchJson(await fetch(url, { headers: getServiceHeaders() }));
  return Array.isArray(rows) ? rows : [];
}

async function downloadImage(photo) {
  const response = await fetch(photo.image_url);
  if (!response.ok) throw new Error(`Download failed with ${response.status}`);
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.startsWith("image/") || contentType.includes("svg") || contentType.includes("gif")) {
    return null;
  }

  return Buffer.from(await response.arrayBuffer());
}

async function optimizeBuffer(buffer) {
  return sharp(buffer)
    .rotate()
    .resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({
      quality: JPEG_QUALITY,
      mozjpeg: true,
    })
    .toBuffer();
}

async function uploadOptimizedPhoto(photo, buffer) {
  const bucket = getBucket();
  const categorySegment = sanitizeSegment(photo.category || "portfolio") || "portfolio";
  const titleSegment = sanitizeSegment(photo.title || photo.id || "photo") || "photo";
  const storagePath = `${categorySegment}/optimized-${Date.now()}-${titleSegment}.jpg`;
  const uploadUrl = buildRestUrl(`/storage/v1/object/${bucket}/${encodeStoragePath(storagePath)}`);

  await fetchJson(
    await fetch(uploadUrl, {
      method: "POST",
      headers: {
        ...getServiceHeaders("image/jpeg"),
        "x-upsert": "false",
      },
      body: buffer,
    })
  );

  return {
    storagePath,
    publicUrl: `${getRequiredEnv("SUPABASE_URL")}/storage/v1/object/public/${bucket}/${encodeStoragePath(storagePath)}`,
  };
}

async function updatePhoto(photo, publicUrl, storagePath) {
  const url = new URL(buildRestUrl("/rest/v1/photos"));
  url.searchParams.set("id", `eq.${photo.id}`);

  await fetchJson(
    await fetch(url, {
      method: "PATCH",
      headers: {
        ...getServiceHeaders("application/json"),
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        image_url: publicUrl,
        storage_path: storagePath,
      }),
    })
  );
}

async function deleteOldStorageObject(storagePath) {
  if (!storagePath) return;
  const bucket = getBucket();
  await fetch(buildRestUrl(`/storage/v1/object/${bucket}/${encodeStoragePath(storagePath)}`), {
    method: "DELETE",
    headers: getServiceHeaders(),
  });
}

async function optimizePhoto(photo, index, total) {
  const label = `${index + 1}/${total} ${photo.category} | ${photo.title}`;

  try {
    const original = await downloadImage(photo);
    if (!original) {
      console.log(`[skip] ${label} unsupported image type`);
      return { optimized: 0, skipped: 1, saved: 0 };
    }

    const optimized = await optimizeBuffer(original);
    if (optimized.length >= original.length * MIN_SAVING_RATIO) {
      console.log(`[skip] ${label} ${formatBytes(original.length)} -> ${formatBytes(optimized.length)}`);
      return { optimized: 0, skipped: 1, saved: 0 };
    }

    const uploaded = await uploadOptimizedPhoto(photo, optimized);
    await updatePhoto(photo, uploaded.publicUrl, uploaded.storagePath);
    await deleteOldStorageObject(photo.storage_path);

    const saved = original.length - optimized.length;
    console.log(`[ok] ${label} ${formatBytes(original.length)} -> ${formatBytes(optimized.length)}`);
    return { optimized: 1, skipped: 0, saved };
  } catch (error) {
    console.log(`[warn] ${label} ${error.message}`);
    return { optimized: 0, skipped: 1, saved: 0 };
  }
}

async function runPool(items, worker) {
  const results = [];
  let cursor = 0;

  async function runNext() {
    const index = cursor;
    cursor += 1;
    if (index >= items.length) return;
    results[index] = await worker(items[index], index, items.length);
    await runNext();
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, runNext));
  return results;
}

async function main() {
  applyEnv(readEnvFile());
  const photos = await getPhotos();
  console.log(`[start] ${photos.length} photo(s) to inspect`);

  const results = await runPool(photos, optimizePhoto);
  const summary = results.reduce(
    (acc, result) => ({
      optimized: acc.optimized + (result?.optimized || 0),
      skipped: acc.skipped + (result?.skipped || 0),
      saved: acc.saved + (result?.saved || 0),
    }),
    { optimized: 0, skipped: 0, saved: 0 }
  );

  console.log("[done]");
  console.log(
    JSON.stringify(
      {
        optimized: summary.optimized,
        skipped: summary.skipped,
        saved: formatBytes(summary.saved),
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});

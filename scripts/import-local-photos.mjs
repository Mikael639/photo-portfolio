import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const PROJECT_ROOT = process.cwd();
const ENV_PATH = path.join(PROJECT_ROOT, ".env.local");
const SOURCE_ROOT = path.join(PROJECT_ROOT, "photos.zip");
const MAX_EDGE = 2000;
const JPEG_QUALITY = 82;
const CONCURRENCY = 3;
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const CATEGORY_PRIORITY = ["Studio", "Fashion Week & Celebrities", "Events", "Fashion Wedding"];

function readEnvFile() {
  const env = {};
  if (!fs.existsSync(ENV_PATH)) return env;

  for (const line of fs.readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) continue;
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");
    env[key] = value;
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

function getSupabaseUrl() {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
}

function buildRestUrl(pathname) {
  return new URL(pathname, getSupabaseUrl()).toString();
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

function getR2PublicUrl() {
  return getRequiredEnv("R2_PUBLIC_URL").replace(/\/+$/, "");
}

function hashBuffer(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function hmac(key, value, encoding) {
  return crypto.createHmac("sha256", key).update(value).digest(encoding);
}

function encodeRfc3986(value) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}

function signR2Request({ method, url, body = Buffer.alloc(0), contentType = "" }) {
  const parsed = new URL(url);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const credentialScope = `${dateStamp}/auto/s3/aws4_request`;
  const payloadHash = hashBuffer(body);
  const headerEntries = [
    ["host", parsed.host],
    ["x-amz-content-sha256", payloadHash],
    ["x-amz-date", amzDate],
  ];

  if (contentType) headerEntries.push(["content-type", contentType]);
  headerEntries.sort(([left], [right]) => left.localeCompare(right));

  const canonicalQuery = [...parsed.searchParams.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${encodeRfc3986(key)}=${encodeRfc3986(value)}`)
    .join("&");
  const canonicalHeaders = headerEntries.map(([key, value]) => `${key}:${value}\n`).join("");
  const signedHeaders = headerEntries.map(([key]) => key).join(";");
  const canonicalRequest = [method, parsed.pathname, canonicalQuery, canonicalHeaders, signedHeaders, payloadHash].join(
    "\n"
  );
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, hashBuffer(canonicalRequest)].join("\n");
  const dateKey = hmac(`AWS4${getRequiredEnv("R2_SECRET_ACCESS_KEY")}`, dateStamp);
  const regionKey = hmac(dateKey, "auto");
  const serviceKey = hmac(regionKey, "s3");
  const signingKey = hmac(serviceKey, "aws4_request");
  const signature = hmac(signingKey, stringToSign, "hex");

  return {
    ...(contentType ? { "Content-Type": contentType } : {}),
    Authorization: `AWS4-HMAC-SHA256 Credential=${getRequiredEnv("R2_ACCESS_KEY_ID")}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
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

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function titleFromFileName(filePath) {
  return path
    .basename(filePath, path.extname(filePath))
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function getCategoryFromPath(filePath) {
  const relativePath = path.relative(SOURCE_ROOT, filePath);
  return relativePath.split(path.sep)[0] || "Portfolio";
}

function getCategoryRank(category) {
  const index = CATEGORY_PRIORITY.indexOf(category);
  return index === -1 ? CATEGORY_PRIORITY.length : index;
}

function walkImages(directory) {
  if (!fs.existsSync(directory)) return [];

  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkImages(fullPath));
    } else if (IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files;
}

function hashFile(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function selectUniqueFiles(files) {
  const byHash = new Map();
  const duplicates = [];

  for (const filePath of files) {
    const hash = hashFile(filePath);
    const category = getCategoryFromPath(filePath);
    const candidate = { filePath, hash, category };
    const existing = byHash.get(hash);

    if (!existing) {
      byHash.set(hash, candidate);
      continue;
    }

    if (getCategoryRank(candidate.category) < getCategoryRank(existing.category)) {
      duplicates.push(existing);
      byHash.set(hash, candidate);
    } else {
      duplicates.push(candidate);
    }
  }

  return {
    uniqueFiles: [...byHash.values()],
    duplicateCount: duplicates.length,
  };
}

async function fetchJson(response) {
  const payload = await response.text();
  if (!response.ok) throw new Error(payload || `Request failed with ${response.status}`);
  return payload ? JSON.parse(payload) : null;
}

async function getExistingPhotos() {
  const url = new URL(buildRestUrl("/rest/v1/photos"));
  url.searchParams.set("select", "id,title,category,storage_path");
  url.searchParams.set("limit", "5000");

  const rows = await fetchJson(await fetch(url, { headers: getServiceHeaders() }));
  return Array.isArray(rows) ? rows : [];
}

async function optimizeImage(filePath) {
  return sharp(filePath)
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

async function uploadImage({ buffer, category, title, hash }) {
  const categorySegment = sanitizeSegment(category || "portfolio") || "portfolio";
  const titleSegment = sanitizeSegment(title || "photo") || "photo";
  const storagePath = `${categorySegment}/local-${hash.slice(0, 16)}-${titleSegment}.jpg`;
  const encodedPath = encodeStoragePath(storagePath);
  const uploadUrl = `https://${getRequiredEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com/${getRequiredEnv(
    "R2_BUCKET"
  )}/${encodedPath}`;

  const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: signR2Request({
        method: "PUT",
        url: uploadUrl,
        body: buffer,
        contentType: "image/jpeg",
      }),
      body: buffer,
    });
  const payload = await response.text();
  if (!response.ok) throw new Error(payload || `R2 upload failed with ${response.status}`);

  return {
    storagePath,
    publicUrl: `${getR2PublicUrl()}/${encodedPath}`,
  };
}

async function insertPhoto({ title, category, publicUrl, storagePath }) {
  const payload = {
    title,
    alt: title,
    category,
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
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    })
  );
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

async function importPhoto(item, index, total, existingKeys, existingStoragePaths) {
  const title = titleFromFileName(item.filePath) || "Photo";
  const category = item.category;
  const titleKey = `${category}::${title}`.toLowerCase();
  const storageKey = `local-${item.hash.slice(0, 16)}`;
  const label = `${index + 1}/${total} ${category} | ${title}`;

  if (existingKeys.has(titleKey) || [...existingStoragePaths].some((storagePath) => storagePath?.includes(storageKey))) {
    console.log(`[skip] ${label} already exists`);
    return { imported: 0, skipped: 1, original: 0, optimized: 0 };
  }

  const originalSize = fs.statSync(item.filePath).size;
  const buffer = await optimizeImage(item.filePath);
  const uploaded = await uploadImage({ buffer, category, title, hash: item.hash });
  await insertPhoto({ title, category, publicUrl: uploaded.publicUrl, storagePath: uploaded.storagePath });

  existingKeys.add(titleKey);
  existingStoragePaths.add(uploaded.storagePath);

  console.log(`[ok] ${label} ${formatBytes(originalSize)} -> ${formatBytes(buffer.length)}`);
  return { imported: 1, skipped: 0, original: originalSize, optimized: buffer.length };
}

async function main() {
  applyEnv(readEnvFile());
  if (!getSupabaseUrl()) throw new Error("Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL");
  getRequiredEnv("R2_ACCOUNT_ID");
  getRequiredEnv("R2_ACCESS_KEY_ID");
  getRequiredEnv("R2_SECRET_ACCESS_KEY");
  getRequiredEnv("R2_BUCKET");
  getRequiredEnv("R2_PUBLIC_URL");
  if (!fs.existsSync(SOURCE_ROOT)) throw new Error(`Missing source folder: ${SOURCE_ROOT}`);

  const files = walkImages(SOURCE_ROOT);
  const { uniqueFiles, duplicateCount } = selectUniqueFiles(files);
  const existingPhotos = await getExistingPhotos();
  const existingKeys = new Set(existingPhotos.map((photo) => `${photo.category || ""}::${photo.title || ""}`.toLowerCase()));
  const existingStoragePaths = new Set(existingPhotos.map((photo) => photo.storage_path).filter(Boolean));

  console.log(
    `[start] ${files.length} image(s), ${uniqueFiles.length} unique candidate(s), ${duplicateCount} duplicate file(s) ignored`
  );

  const results = await runPool(uniqueFiles, (item, index, total) =>
    importPhoto(item, index, total, existingKeys, existingStoragePaths)
  );

  const summary = results.reduce(
    (acc, result) => ({
      imported: acc.imported + (result?.imported || 0),
      skipped: acc.skipped + (result?.skipped || 0),
      original: acc.original + (result?.original || 0),
      optimized: acc.optimized + (result?.optimized || 0),
    }),
    { imported: 0, skipped: 0, original: 0, optimized: 0 }
  );

  console.log("[done]");
  console.log(
    JSON.stringify(
      {
        imported: summary.imported,
        skipped: summary.skipped,
        duplicateFilesIgnored: duplicateCount,
        originalUploadedSet: formatBytes(summary.original),
        optimizedUploadedSet: formatBytes(summary.optimized),
        savedBeforeUpload: formatBytes(summary.original - summary.optimized),
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

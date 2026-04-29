import crypto from "node:crypto";
import fs from "node:fs";

const CONCURRENCY = 3;
const DEFAULT_SUPABASE_BUCKET = "portfolio-images";

function readEnvFile() {
  const env = {};
  if (!fs.existsSync(".env.local")) return env;

  for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) continue;
    const index = line.indexOf("=");
    env[line.slice(0, index).trim()] = line.slice(index + 1).trim().replace(/^["']|["']$/g, "");
  }

  return env;
}

function applyEnv(env) {
  for (const [key, value] of Object.entries(env)) {
    if (!process.env[key]) process.env[key] = value;
  }
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

function getSupabaseUrl() {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
}

function getSupabaseBucket() {
  return process.env.SUPABASE_BUCKET || DEFAULT_SUPABASE_BUCKET;
}

function getR2PublicUrl() {
  return requiredEnv("R2_PUBLIC_URL").replace(/\/+$/, "");
}

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function hmac(key, value, encoding) {
  return crypto.createHmac("sha256", key).update(value).digest(encoding);
}

function encodeRfc3986(value) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}

function encodeStoragePath(storagePath) {
  return storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function signR2Request({ method, url, body = Buffer.alloc(0), contentType = "" }) {
  const parsed = new URL(url);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const credentialScope = `${dateStamp}/auto/s3/aws4_request`;
  const payloadHash = hash(body);
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
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, hash(canonicalRequest)].join("\n");
  const dateKey = hmac(`AWS4${requiredEnv("R2_SECRET_ACCESS_KEY")}`, dateStamp);
  const regionKey = hmac(dateKey, "auto");
  const serviceKey = hmac(regionKey, "s3");
  const signingKey = hmac(serviceKey, "aws4_request");
  const signature = hmac(signingKey, stringToSign, "hex");

  return {
    ...(contentType ? { "Content-Type": contentType } : {}),
    Authorization: `AWS4-HMAC-SHA256 Credential=${requiredEnv("R2_ACCESS_KEY_ID")}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };
}

async function fetchTextOrThrow(response) {
  const payload = await response.text();
  if (!response.ok) throw new Error(payload || `Request failed with ${response.status}`);
  return payload;
}

async function fetchJsonOrThrow(response) {
  const payload = await fetchTextOrThrow(response);
  return payload ? JSON.parse(payload) : null;
}

function getSupabaseHeaders(contentType) {
  const key = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    ...(contentType ? { "Content-Type": contentType } : {}),
  };
}

async function getPhotos() {
  const url = new URL("/rest/v1/photos", getSupabaseUrl());
  url.searchParams.set("select", "id,title,category,image_url,storage_path");
  url.searchParams.set("limit", "5000");

  const rows = await fetchJsonOrThrow(
    await fetch(url, {
      headers: getSupabaseHeaders(),
    })
  );

  return Array.isArray(rows) ? rows : [];
}

function getR2StoragePath(photo) {
  const existingPath = photo.storage_path || `${photo.category || "portfolio"}/${photo.id}.jpg`;
  return `migrated/${existingPath.replace(/^\/+/, "")}`;
}

async function uploadToR2(storagePath, buffer, contentType) {
  const encodedPath = encodeStoragePath(storagePath);
  const url = `https://${requiredEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com/${requiredEnv("R2_BUCKET")}/${encodedPath}`;

  await fetchTextOrThrow(
    await fetch(url, {
      method: "PUT",
      headers: signR2Request({
        method: "PUT",
        url,
        body: buffer,
        contentType,
      }),
      body: buffer,
    })
  );

  return `${getR2PublicUrl()}/${encodedPath}`;
}

async function updatePhoto(photo, publicUrl, storagePath) {
  const url = new URL("/rest/v1/photos", getSupabaseUrl());
  url.searchParams.set("id", `eq.${photo.id}`);

  await fetchTextOrThrow(
    await fetch(url, {
      method: "PATCH",
      headers: {
        ...getSupabaseHeaders("application/json"),
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        image_url: publicUrl,
        storage_path: storagePath,
      }),
    })
  );
}

async function deleteSupabaseObject(storagePath) {
  if (!storagePath) return;

  const encodedPath = encodeStoragePath(storagePath);
  const url = new URL(`/storage/v1/object/${getSupabaseBucket()}/${encodedPath}`, getSupabaseUrl());
  await fetch(url, {
    method: "DELETE",
    headers: getSupabaseHeaders(),
  });
}

async function migratePhoto(photo, index, total, { deleteSource }) {
  const label = `${index + 1}/${total} ${photo.category || "Portfolio"} | ${photo.title || photo.id}`;

  if (!photo.image_url || photo.image_url.startsWith(getR2PublicUrl())) {
    console.log(`[skip] ${label} already on R2`);
    return { migrated: 0, skipped: 1, bytes: 0 };
  }

  const downloadResponse = await fetch(photo.image_url);
  if (!downloadResponse.ok) {
    throw new Error(`Download failed ${downloadResponse.status}`);
  }

  const contentType = downloadResponse.headers.get("content-type") || "application/octet-stream";
  const buffer = Buffer.from(await downloadResponse.arrayBuffer());
  const storagePath = getR2StoragePath(photo);
  const publicUrl = await uploadToR2(storagePath, buffer, contentType);
  await updatePhoto(photo, publicUrl, storagePath);

  if (deleteSource) {
    await deleteSupabaseObject(photo.storage_path);
  }

  console.log(`[ok] ${label} ${Math.round(buffer.length / 1024)} KB`);
  return { migrated: 1, skipped: 0, bytes: buffer.length };
}

async function runPool(items, worker) {
  const results = [];
  let cursor = 0;

  async function runNext() {
    const index = cursor;
    cursor += 1;
    if (index >= items.length) return;

    try {
      results[index] = await worker(items[index], index, items.length);
    } catch (error) {
      console.log(`[warn] ${index + 1}/${items.length} ${error.message}`);
      results[index] = { migrated: 0, skipped: 1, bytes: 0 };
    }

    await runNext();
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, runNext));
  return results;
}

async function main() {
  applyEnv(readEnvFile());
  const deleteSource = process.argv.includes("--delete-source");
  const photos = await getPhotos();
  const candidates = photos.filter((photo) => photo.image_url && !photo.image_url.startsWith(getR2PublicUrl()));

  console.log(`[start] ${candidates.length}/${photos.length} photo(s) to migrate to R2`);
  const results = await runPool(candidates, (photo, index, total) => migratePhoto(photo, index, total, { deleteSource }));
  const summary = results.reduce(
    (acc, result) => ({
      migrated: acc.migrated + (result?.migrated || 0),
      skipped: acc.skipped + (result?.skipped || 0),
      bytes: acc.bytes + (result?.bytes || 0),
    }),
    { migrated: 0, skipped: 0, bytes: 0 }
  );

  console.log("[done]");
  console.log(
    JSON.stringify(
      {
        migrated: summary.migrated,
        skipped: summary.skipped,
        copied: `${(summary.bytes / (1024 * 1024)).toFixed(1)} MB`,
        deletedSourceObjects: deleteSource,
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

import fs from "node:fs";
import path from "node:path";

const PROJECT_ROOT = process.cwd();
const ENV_PATH = path.join(PROJECT_ROOT, ".env.local");
const APP_URL = "http://localhost:3000";
const MAX_BATCH_SIZE = 12;

const albums = [
  {
    name: "mariage-event",
    category: "Mariage",
    url: "https://photos.google.com/share/AF1QipPaQE2jxUvEQ9NAi409MjmjPI1ERI9CZ3ezSsodmM3Eb8Z7Gy8HrwV9MGC9tBjR7w?key=ZG54YVJna3U0cWkxWGFKT0szc3JCeVoxTTVET0FB",
  },
  {
    name: "fashion-week",
    category: "Fashion Week",
    url: "https://photos.google.com/share/AF1QipNom0AEA9McRrz64TbArbTQHCe1Ze9bsk4Ghj6XYn_NLGz7XQUtbcewFs3oWwEDWA?key=UkhLSldTLVJLcC1DTGZ2M1BHVGMwcmZ1UXV0RWFn",
  },
];

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

function assertRequiredEnv(env) {
  const required = ["ADMIN_USERNAME", "ADMIN_PASSWORD"];
  const missing = required.filter((key) => !env[key]);
  if (missing.length) {
    throw new Error(`Missing env vars in .env.local: ${missing.join(", ")}`);
  }
}

function getPhotoLinksFromAlbumHtml(html) {
  const matches = html.match(/\/share\/AF1Qip[^"']+?\/photo\/AF1Qip[^"']+?\?key=[^"']+/g) || [];
  return Array.from(new Set(matches)).map((item) => `https://photos.google.com${item}`);
}

function extractImageSourceFromPhotoHtml(html) {
  const patterns = [
    new RegExp(String.raw`https:\\/\\/lh3\\.googleusercontent\\.com\\/pw\\/[^"']+?\\u003ds0-d-ip`),
    new RegExp(String.raw`https:\\/\\/lh3\\.googleusercontent\\.com\\/pw\\/[^"']+`),
    new RegExp(String.raw`https://lh3\.googleusercontent\.com/pw/[^"']+`),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (!match) continue;

    let imageUrl = match[0].replace(/\\u003d/g, "=").replace(/\\\//g, "/");
    if (!/=s0-d-ip/.test(imageUrl)) imageUrl = `${imageUrl}=s0-d-ip`;
    return imageUrl;
  }

  return "";
}

function getExtensionFromContentType(contentType) {
  if (!contentType) return ".jpg";
  if (contentType.includes("png")) return ".png";
  if (contentType.includes("webp")) return ".webp";
  if (contentType.includes("gif")) return ".gif";
  return ".jpg";
}

function chunk(list, size) {
  const chunks = [];
  for (let index = 0; index < list.length; index += size) {
    chunks.push(list.slice(index, index + size));
  }
  return chunks;
}

async function loginAdmin(env) {
  const response = await fetch(`${APP_URL}/api/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: env.ADMIN_USERNAME,
      password: env.ADMIN_PASSWORD,
    }),
  });

  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(payload.message || "Admin login failed.");
  }

  const setCookie = response.headers.getSetCookie?.() || [];
  const cookie = setCookie.map((item) => item.split(";")[0]).join("; ");
  if (!cookie) {
    throw new Error("Admin session cookie missing after login.");
  }

  return cookie;
}

async function uploadBatch(cookie, album, files, batchIndex, batchCount) {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file, file.name);
  }

  formData.append("title", "");
  formData.append("alt", "");
  formData.append("category", album.category);
  formData.append("roles", "[]");
  formData.append("isPublished", "true");
  formData.append("isPinned", "false");

  const response = await fetch(`${APP_URL}/api/admin/photos`, {
    method: "POST",
    headers: {
      Cookie: cookie,
    },
    body: formData,
  });

  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(
      `Upload failed for ${album.name} batch ${batchIndex}/${batchCount}: ${payload.message || "unknown error"}`
    );
  }

  return payload.total || files.length;
}

async function buildFileFromPhotoLink(photoLink, albumName, photoIndex) {
  const photoHtml = await fetch(photoLink).then((response) => response.text());
  const imageUrl = extractImageSourceFromPhotoHtml(photoHtml);
  if (!imageUrl) {
    throw new Error(`No downloadable image source found for ${photoLink}`);
  }

  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Image download failed with ${imageResponse.status} for ${photoLink}`);
  }

  const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
  const extension = getExtensionFromContentType(contentType);
  const arrayBuffer = await imageResponse.arrayBuffer();
  const fileName = `${albumName}-${String(photoIndex).padStart(3, "0")}${extension}`;

  return new File([arrayBuffer], fileName, { type: contentType });
}

async function importAlbum(cookie, album) {
  console.log(`\n[album] ${album.name} -> ${album.category}`);
  const albumHtml = await fetch(album.url).then((response) => response.text());
  const photoLinks = getPhotoLinksFromAlbumHtml(albumHtml);

  if (photoLinks.length === 0) {
    throw new Error(`No photo links found for album ${album.name}`);
  }

  console.log(`[album] found ${photoLinks.length} photo links`);

  const batches = chunk(photoLinks, MAX_BATCH_SIZE);
  let importedCount = 0;

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex += 1) {
    const batchLinks = batches[batchIndex];
    const files = [];

    for (let index = 0; index < batchLinks.length; index += 1) {
      const absoluteIndex = batchIndex * MAX_BATCH_SIZE + index + 1;
      process.stdout.write(`[download] ${album.name} ${absoluteIndex}/${photoLinks.length}\r`);
      const file = await buildFileFromPhotoLink(batchLinks[index], album.name, absoluteIndex);
      files.push(file);
    }

    process.stdout.write(" ".repeat(80) + "\r");
    const uploaded = await uploadBatch(cookie, album, files, batchIndex + 1, batches.length);
    importedCount += uploaded;
    console.log(`[upload] ${album.name} batch ${batchIndex + 1}/${batches.length} -> ${uploaded} photo(s)`);
  }

  return {
    album: album.name,
    category: album.category,
    found: photoLinks.length,
    imported: importedCount,
  };
}

async function main() {
  const env = readEnvFile();
  assertRequiredEnv(env);

  const cookie = await loginAdmin(env);
  const results = [];

  for (const album of albums) {
    const result = await importAlbum(cookie, album);
    results.push(result);
  }

  console.log("\n[done]");
  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error("\n[error]");
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});

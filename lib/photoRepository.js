import { defaultPortfolioCategory, normalizePortfolioCategory } from "./categories";
import { deleteR2Object, isR2Configured, uploadR2Object } from "./r2Storage";

const DEFAULT_BUCKET = "portfolio-images";
export const MAX_BULK_UPLOAD_COUNT = 12;
export const MAX_UPLOAD_FILE_SIZE_BYTES = 15 * 1024 * 1024;
const PUBLIC_PHOTOS_REVALIDATE_SECONDS = 300;

function getSupabaseUrl() {
  return process.env.SUPABASE_URL || "";
}

function getSupabaseAnonKey() {
  return process.env.SUPABASE_ANON_KEY || "";
}

function getSupabaseServiceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

function getSupabaseBucket() {
  return process.env.SUPABASE_BUCKET || DEFAULT_BUCKET;
}

function buildRestUrl(path, params) {
  const url = new URL(path, getSupabaseUrl());
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      url.searchParams.append(key, String(value));
    });
  }
  return url.toString();
}

function hasSupabasePublicConfig() {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

function hasSupabaseAdminConfig() {
  return Boolean(getSupabaseUrl() && getSupabaseServiceKey());
}

function getPublicHeaders() {
  const anonKey = getSupabaseAnonKey();
  return {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
  };
}

function getAdminHeaders(contentType) {
  const serviceRoleKey = getSupabaseServiceKey();
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    ...(contentType ? { "Content-Type": contentType } : {}),
  };
}

function normalizeRoles(rawRoles) {
  if (Array.isArray(rawRoles)) return rawRoles;

  if (typeof rawRoles === "string") {
    try {
      const parsed = JSON.parse(rawRoles);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

const PUBLIC_PHOTO_SELECT = "id,title,alt,category,image_url,roles,is_published,is_pinned,sort_order,created_at";
const PUBLIC_PHOTO_LEGACY_SELECT = "id,title,alt,category,image_url,roles,is_published,is_pinned,created_at";
const ADMIN_PHOTO_SELECT = "id,title,alt,category,image_url,roles,is_published,is_pinned,sort_order,created_at,storage_path";
const ADMIN_PHOTO_LEGACY_SELECT = "id,title,alt,category,image_url,roles,is_published,is_pinned,created_at,storage_path";

function normalizePhotoRow(row) {
  let src = row.image_url || row.src || "";

  return {
    id: row.id,
    src,
    alt: row.alt || "",
    title: row.title || "",
    category: normalizePortfolioCategory(row.category),
    roles: normalizeRoles(row.roles),
    isPublished: row.is_published !== false,
    isPinned: Boolean(row.is_pinned),
    sortOrder: toNumber(row.sort_order ?? row.sortOrder),
    createdAt: row.created_at || null,
    storagePath: row.storage_path || null,
  };
}

function toNumber(value) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function fetchJsonOrThrow(response) {
  const payload = await response.text();

  if (!response.ok) {
    throw new Error(payload || `Request failed with status ${response.status}`);
  }

  if (!payload) return null;

  try {
    return JSON.parse(payload);
  } catch {
    return payload;
  }
}

function isMissingColumnError(error, column) {
  return typeof error?.message === "string" && error.message.includes(`'${column}' column`);
}

async function fetchRowsWithLegacySelect(url, options, legacySelect) {
  let response = await fetch(url.toString(), options);

  if (!response.ok && legacySelect) {
    url.searchParams.set("select", legacySelect);
    response = await fetch(url.toString(), options);
  }

  const rows = await fetchJsonOrThrow(response);
  return Array.isArray(rows) ? rows : [];
}

async function fetchSupabasePublicPhotos({ category, limit }) {
  const url = new URL(buildRestUrl("/rest/v1/photos"));
  url.searchParams.set("select", PUBLIC_PHOTO_SELECT);
  url.searchParams.set("is_published", "eq.true");
  url.searchParams.append("order", "is_pinned.desc");
  url.searchParams.append("order", "sort_order.asc");
  url.searchParams.append("order", "created_at.desc");
  if (limit && (!category || category === "Tout")) {
    url.searchParams.set("limit", String(limit));
  }

  const list = await fetchRowsWithLegacySelect(url, {
    method: "GET",
    headers: getPublicHeaders(),
    next: {
      revalidate: PUBLIC_PHOTOS_REVALIDATE_SECONDS,
      tags: ["public-photos"],
    },
  }, PUBLIC_PHOTO_LEGACY_SELECT);
  const normalized = list.map(normalizePhotoRow);
  const filtered =
    category && category !== "Tout" ? normalized.filter((photo) => photo.category === category) : normalized;
  return limit ? filtered.slice(0, limit) : filtered;
}

export async function getPublicPhotos({ category, limit } = {}) {
  if (!hasSupabasePublicConfig()) {
    return [];
  }

  try {
    return await fetchSupabasePublicPhotos({ category, limit });
  } catch {
    return [];
  }
}

export function isAdminStorageConfigured() {
  return hasSupabaseAdminConfig() && (isR2Configured() || Boolean(getSupabaseBucket()));
}

export async function getAdminPhotos() {
  if (!hasSupabaseAdminConfig()) {
    return [];
  }

  const url = new URL(buildRestUrl("/rest/v1/photos"));
  url.searchParams.set("select", ADMIN_PHOTO_SELECT);
  url.searchParams.append("order", "is_pinned.desc");
  url.searchParams.append("order", "sort_order.asc");
  url.searchParams.append("order", "created_at.desc");

  const list = await fetchRowsWithLegacySelect(url, {
    method: "GET",
    headers: getAdminHeaders(),
    cache: "no-store",
  }, ADMIN_PHOTO_LEGACY_SELECT);
  return list.map(normalizePhotoRow);
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

function encodeStoragePath(path) {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

async function uploadFileToStorage({ file, category }) {
  const categorySegment = sanitizeSegment(category || "autre") || "autre";
  const baseName = sanitizeSegment(file.name || "photo.jpg") || "photo.jpg";
  const storagePath = `${categorySegment}/${Date.now()}-${baseName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (isR2Configured()) {
    return uploadR2Object({
      storagePath,
      buffer,
      contentType: file.type || "application/octet-stream",
    });
  }

  const bucket = getSupabaseBucket();
  const encodedPath = encodeStoragePath(storagePath);
  const uploadUrl = buildRestUrl(`/storage/v1/object/${bucket}/${encodedPath}`);

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      ...getAdminHeaders(file.type || "application/octet-stream"),
      "x-upsert": "false",
    },
    body: buffer,
  });

  await fetchJsonOrThrow(response);

  const publicUrl = `${getSupabaseUrl()}/storage/v1/object/public/${bucket}/${encodedPath}`;
  return {
    storagePath,
    publicUrl,
  };
}

function parseRolesInput(rawRoles) {
  if (Array.isArray(rawRoles)) return rawRoles;
  if (typeof rawRoles === "string") {
    try {
      const parsed = JSON.parse(rawRoles);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function toBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return fallback;
}

function getDefaultTitleFromFile(file) {
  const name = typeof file?.name === "string" ? file.name : "photo";
  const base = name.replace(/\.[^/.]+$/, "");
  return base
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

export async function createAdminPhoto(input) {
  if (!hasSupabaseAdminConfig()) {
    throw new Error("Supabase admin is not configured.");
  }

  const { storagePath, publicUrl } = await uploadFileToStorage({
    file: input.file,
    category: input.category,
  });

  const fallbackTitle = getDefaultTitleFromFile(input.file) || "Photo";
  const title = (input.title || "").trim() || fallbackTitle;
  const alt = (input.alt || "").trim() || title;

  const payload = {
    title,
    alt,
    category: input.category || defaultPortfolioCategory,
    image_url: publicUrl,
    storage_path: storagePath,
    roles: parseRolesInput(input.roles),
    is_published: toBoolean(input.isPublished, true),
    is_pinned: toBoolean(input.isPinned, false),
    sort_order: toNumber(input.sortOrder),
  };

  const response = await fetch(buildRestUrl("/rest/v1/photos"), {
    method: "POST",
    headers: {
      ...getAdminHeaders("application/json"),
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });

  let rows;
  try {
    rows = await fetchJsonOrThrow(response);
  } catch (error) {
    if (!isMissingColumnError(error, "sort_order")) throw error;

    const legacyPayload = { ...payload };
    delete legacyPayload.sort_order;
    const legacyResponse = await fetch(buildRestUrl("/rest/v1/photos"), {
      method: "POST",
      headers: {
        ...getAdminHeaders("application/json"),
        Prefer: "return=representation",
      },
      body: JSON.stringify(legacyPayload),
    });
    rows = await fetchJsonOrThrow(legacyResponse);
  }

  const list = Array.isArray(rows) ? rows : [];
  return normalizePhotoRow(list[0] || payload);
}

export async function createAdminPhotos(input) {
  const files = Array.isArray(input.files) ? input.files : [];
  if (files.length === 0) return [];

  const created = [];
  const multiple = files.length > 1;

  for (const file of files) {
    const fallbackTitle = getDefaultTitleFromFile(file) || "Photo";
    const title = multiple
      ? (input.title || "").trim()
        ? `${input.title.trim()} - ${fallbackTitle}`
        : fallbackTitle
      : input.title;
    const alt = multiple
      ? (input.alt || "").trim()
        ? `${input.alt.trim()} - ${fallbackTitle}`
        : fallbackTitle
      : input.alt;

    const item = await createAdminPhoto({
      ...input,
      file,
      title,
      alt,
    });
    created.push(item);
  }

  return created;
}

export async function updateAdminPhoto(id, patch) {
  if (!hasSupabaseAdminConfig()) {
    throw new Error("Supabase admin is not configured.");
  }

  const payload = {};
  if (patch.title !== undefined) payload.title = patch.title;
  if (patch.alt !== undefined) payload.alt = patch.alt;
  if (patch.category !== undefined) payload.category = patch.category;
  if (patch.roles !== undefined) payload.roles = parseRolesInput(patch.roles);
  if (patch.isPublished !== undefined) payload.is_published = toBoolean(patch.isPublished);
  if (patch.isPinned !== undefined) payload.is_pinned = toBoolean(patch.isPinned);
  if (patch.sortOrder !== undefined) payload.sort_order = toNumber(patch.sortOrder);

  const url = new URL(buildRestUrl("/rest/v1/photos"));
  url.searchParams.set("id", `eq.${id}`);

  const response = await fetch(url.toString(), {
    method: "PATCH",
    headers: {
      ...getAdminHeaders("application/json"),
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });

  let rows;
  try {
    rows = await fetchJsonOrThrow(response);
  } catch (error) {
    if (!isMissingColumnError(error, "sort_order") || patch.sortOrder === undefined) throw error;

    const legacyPayload = { ...payload };
    delete legacyPayload.sort_order;
    const legacyResponse = await fetch(url.toString(), {
      method: "PATCH",
      headers: {
        ...getAdminHeaders("application/json"),
        Prefer: "return=representation",
      },
      body: JSON.stringify(legacyPayload),
    });
    rows = await fetchJsonOrThrow(legacyResponse);
  }

  const list = Array.isArray(rows) ? rows : [];
  return normalizePhotoRow(list[0] || { id, ...payload });
}

export async function reorderAdminPhotos(items) {
  if (!hasSupabaseAdminConfig()) {
    throw new Error("Supabase admin is not configured.");
  }

  const updates = Array.isArray(items) ? items : [];
  await Promise.all(
    updates.map((item, index) =>
      updateAdminPhoto(item.id, {
        sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : index + 1,
      })
    )
  );

  return getAdminPhotos();
}

async function removeStorageObject(storagePath, imageUrl) {
  if (!storagePath) return;

  if (imageUrl && process.env.R2_PUBLIC_URL && imageUrl.startsWith(process.env.R2_PUBLIC_URL.replace(/\/+$/, ""))) {
    await deleteR2Object(storagePath);
    return;
  }

  const bucket = getSupabaseBucket();
  const encodedPath = encodeStoragePath(storagePath);
  const url = buildRestUrl(`/storage/v1/object/${bucket}/${encodedPath}`);

  await fetch(url, {
    method: "DELETE",
    headers: getAdminHeaders(),
  });
}

export async function deleteAdminPhoto(id) {
  if (!hasSupabaseAdminConfig()) {
    throw new Error("Supabase admin is not configured.");
  }

  const url = new URL(buildRestUrl("/rest/v1/photos"));
  url.searchParams.set("id", `eq.${id}`);
  url.searchParams.set("select", "id,storage_path,image_url");

  const response = await fetch(url.toString(), {
    method: "DELETE",
    headers: {
      ...getAdminHeaders(),
      Prefer: "return=representation",
    },
  });

  const rows = await fetchJsonOrThrow(response);
  const list = Array.isArray(rows) ? rows : [];
  const deleted = list[0];

  if (deleted?.storage_path) {
    await removeStorageObject(deleted.storage_path, deleted.image_url);
  }

  return deleted || null;
}

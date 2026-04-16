import { photos as localPhotos } from "../data/photos";

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

function normalizePhotoRow(row) {
  return {
    id: row.id,
    src: row.image_url || row.src || "",
    alt: row.alt || "",
    title: row.title || "",
    category: row.category || "Autre",
    roles: normalizeRoles(row.roles),
    isPublished: row.is_published !== false,
    isPinned: Boolean(row.is_pinned),
    createdAt: row.created_at || null,
    storagePath: row.storage_path || null,
  };
}

function toNumber(value) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sortPhotos(list) {
  return [...list].sort((left, right) => {
    if (Boolean(left.isPinned) !== Boolean(right.isPinned)) {
      return Number(Boolean(right.isPinned)) - Number(Boolean(left.isPinned));
    }

    if (left.createdAt && right.createdAt) {
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    }

    return toNumber(right.id) - toNumber(left.id);
  });
}

function getLocalPublicPhotos({ category, limit }) {
  const filtered = localPhotos.filter((photo) => {
    if (photo.isPublished === false) return false;
    if (!category || category === "Tout") return true;
    return photo.category === category;
  });

  const normalized = filtered.map((photo) =>
    normalizePhotoRow({
      ...photo,
      image_url: photo.src,
      is_published: photo.isPublished ?? true,
      is_pinned: photo.isPinned ?? false,
    })
  );

  const sorted = sortPhotos(normalized);
  if (!limit) return sorted;
  return sorted.slice(0, limit);
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

async function fetchSupabasePublicPhotos({ category, limit }) {
  const url = new URL(buildRestUrl("/rest/v1/photos"));
  url.searchParams.set("select", "id,title,alt,category,image_url,roles,is_published,is_pinned,created_at");
  url.searchParams.set("is_published", "eq.true");
  if (category && category !== "Tout") {
    url.searchParams.set("category", `eq.${category}`);
  }
  url.searchParams.append("order", "is_pinned.desc");
  url.searchParams.append("order", "created_at.desc");
  if (limit) {
    url.searchParams.set("limit", String(limit));
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getPublicHeaders(),
    next: {
      revalidate: PUBLIC_PHOTOS_REVALIDATE_SECONDS,
      tags: ["public-photos"],
    },
  });
  const rows = await fetchJsonOrThrow(response);
  const list = Array.isArray(rows) ? rows : [];
  return list.map(normalizePhotoRow);
}

export async function getPublicPhotos({ category, limit } = {}) {
  if (!hasSupabasePublicConfig()) {
    return getLocalPublicPhotos({ category, limit });
  }

  try {
    return await fetchSupabasePublicPhotos({ category, limit });
  } catch {
    return getLocalPublicPhotos({ category, limit });
  }
}

export function isAdminStorageConfigured() {
  return hasSupabaseAdminConfig();
}

export async function getAdminPhotos() {
  if (!hasSupabaseAdminConfig()) {
    return sortPhotos(
      localPhotos.map((photo) =>
        normalizePhotoRow({
          ...photo,
          image_url: photo.src,
          is_published: photo.isPublished ?? true,
          is_pinned: photo.isPinned ?? false,
        })
      )
    );
  }

  const url = new URL(buildRestUrl("/rest/v1/photos"));
  url.searchParams.set(
    "select",
    "id,title,alt,category,image_url,roles,is_published,is_pinned,created_at,storage_path"
  );
  url.searchParams.append("order", "is_pinned.desc");
  url.searchParams.append("order", "created_at.desc");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getAdminHeaders(),
    cache: "no-store",
  });
  const rows = await fetchJsonOrThrow(response);
  const list = Array.isArray(rows) ? rows : [];
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
  const bucket = getSupabaseBucket();
  const categorySegment = sanitizeSegment(category || "autre") || "autre";
  const baseName = sanitizeSegment(file.name || "photo.jpg") || "photo.jpg";
  const storagePath = `${categorySegment}/${Date.now()}-${baseName}`;
  const encodedPath = encodeStoragePath(storagePath);
  const uploadUrl = buildRestUrl(`/storage/v1/object/${bucket}/${encodedPath}`);
  const buffer = Buffer.from(await file.arrayBuffer());

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
    category: input.category || "Autre",
    image_url: publicUrl,
    storage_path: storagePath,
    roles: parseRolesInput(input.roles),
    is_published: toBoolean(input.isPublished, true),
    is_pinned: toBoolean(input.isPinned, false),
  };

  const response = await fetch(buildRestUrl("/rest/v1/photos"), {
    method: "POST",
    headers: {
      ...getAdminHeaders("application/json"),
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });

  const rows = await fetchJsonOrThrow(response);
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

  const rows = await fetchJsonOrThrow(response);
  const list = Array.isArray(rows) ? rows : [];
  return normalizePhotoRow(list[0] || { id, ...payload });
}

async function removeStorageObject(storagePath) {
  if (!storagePath) return;
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
    await removeStorageObject(deleted.storage_path);
  }

  return deleted || null;
}

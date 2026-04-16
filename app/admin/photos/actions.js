"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  getAdminCookieOptions,
  isAdminConfigured,
  validateAdminCredentials,
  verifyAdminSessionToken,
} from "../../../lib/adminAuth";
import {
  createAdminPhotos,
  deleteAdminPhoto,
  getAdminPhotos,
  isAdminStorageConfigured,
  MAX_BULK_UPLOAD_COUNT,
  MAX_UPLOAD_FILE_SIZE_BYTES,
  updateAdminPhoto,
} from "../../../lib/photoRepository";

function unauthorizedResult(message = "Unauthorized.") {
  return createActionResult({ ok: false, message });
}

function createActionResult({ ok, message, data = null }) {
  return {
    ok,
    message,
    data,
  };
}

function revalidatePublicPhotoViews() {
  revalidateTag("public-photos");
  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/about");
  revalidatePath("/contact");
}

async function getAuthorizedCookieStore() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value || "";
  if (!verifyAdminSessionToken(token)) {
    return null;
  }

  return cookieStore;
}

function toStringValue(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function toBooleanValue(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return fallback;
}

export async function loginAdminAction(credentials) {
  if (!isAdminConfigured()) {
    return createActionResult({
      ok: false,
      message: "Admin auth is not configured. Set ADMIN_USERNAME, ADMIN_PASSWORD and ADMIN_SESSION_SECRET.",
    });
  }

  const username = typeof credentials?.username === "string" ? credentials.username : "";
  const password = typeof credentials?.password === "string" ? credentials.password : "";

  if (!validateAdminCredentials(username, password)) {
    return createActionResult({ ok: false, message: "Invalid credentials." });
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, createAdminSessionToken(username), getAdminCookieOptions());
  const photos = await getAdminPhotos();

  return createActionResult({ ok: true, message: "Connexion admin reussie.", data: photos });
}

export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, "", {
    ...getAdminCookieOptions(),
    maxAge: 0,
  });

  return createActionResult({ ok: true, message: "Deconnecte." });
}

export async function uploadAdminPhotosAction(formData) {
  const cookieStore = await getAuthorizedCookieStore();
  if (!cookieStore) return unauthorizedResult();

  if (!isAdminStorageConfigured()) {
    return createActionResult({ ok: false, message: "Supabase is not configured yet." });
  }

  const filesFromForm = formData.getAll("files");
  const fallbackSingleFile = formData.get("file");
  const files = [...filesFromForm, fallbackSingleFile]
    .filter(Boolean)
    .filter((value) => typeof value !== "string");

  if (files.length === 0) {
    return createActionResult({ ok: false, message: "At least one photo file is required." });
  }

  if (files.length > MAX_BULK_UPLOAD_COUNT) {
    return createActionResult({ ok: false, message: `Max ${MAX_BULK_UPLOAD_COUNT} photos per upload.` });
  }

  const invalidFile = files.find((file) => !file.type?.startsWith("image/"));
  if (invalidFile) {
    return createActionResult({ ok: false, message: "Only image files are allowed." });
  }

  const oversizedFile = files.find((file) => file.size > MAX_UPLOAD_FILE_SIZE_BYTES);
  if (oversizedFile) {
    return createActionResult({ ok: false, message: "One file exceeds the 15MB limit." });
  }

  try {
    const created = await createAdminPhotos({
      files,
      title: toStringValue(formData.get("title")),
      alt: toStringValue(formData.get("alt")),
      category: toStringValue(formData.get("category"), "Autre"),
      roles: toStringValue(formData.get("roles"), "[]"),
      isPublished: toBooleanValue(formData.get("isPublished"), true),
      isPinned: toBooleanValue(formData.get("isPinned"), false),
    });

    revalidatePublicPhotoViews();
    const photos = await getAdminPhotos();
    return createActionResult({
      ok: true,
      message: `${created.length || files.length} photo(s) ajoutee(s).`,
      data: photos,
    });
  } catch (error) {
    return createActionResult({ ok: false, message: error.message || "Unable to create photo." });
  }
}

export async function updateAdminPhotoAction(input) {
  const cookieStore = await getAuthorizedCookieStore();
  if (!cookieStore) return unauthorizedResult();

  const id = toStringValue(input?.id);
  if (!id) {
    return createActionResult({ ok: false, message: "Photo id is required." });
  }

  try {
    await updateAdminPhoto(id, {
      title: input?.title,
      alt: input?.alt,
      category: input?.category,
      roles: input?.roles,
      isPublished: input?.isPublished,
      isPinned: input?.isPinned,
    });

    revalidatePublicPhotoViews();
    const photos = await getAdminPhotos();
    return createActionResult({ ok: true, message: "Photo mise a jour.", data: photos });
  } catch (error) {
    return createActionResult({ ok: false, message: error.message || "Unable to update photo." });
  }
}

export async function deleteAdminPhotoAction(id) {
  const cookieStore = await getAuthorizedCookieStore();
  if (!cookieStore) return unauthorizedResult();

  const photoId = toStringValue(id);
  if (!photoId) {
    return createActionResult({ ok: false, message: "Photo id is required." });
  }

  try {
    await deleteAdminPhoto(photoId);
    revalidatePublicPhotoViews();
    const photos = await getAdminPhotos();
    return createActionResult({ ok: true, message: "Photo supprimee.", data: photos });
  } catch (error) {
    return createActionResult({ ok: false, message: error.message || "Unable to delete photo." });
  }
}

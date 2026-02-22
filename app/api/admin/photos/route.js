import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "../../../../lib/adminAuth";
import {
  createAdminPhotos,
  deleteAdminPhoto,
  getAdminPhotos,
  isAdminStorageConfigured,
  MAX_BULK_UPLOAD_COUNT,
  MAX_UPLOAD_FILE_SIZE_BYTES,
  updateAdminPhoto,
} from "../../../../lib/photoRepository";

export const runtime = "nodejs";

function getAdminSessionToken(request) {
  return request.cookies.get(ADMIN_COOKIE_NAME)?.value || "";
}

function createUnauthorizedResponse() {
  return NextResponse.json(
    {
      ok: false,
      message: "Unauthorized.",
    },
    { status: 401 }
  );
}

function ensureAuthorized(request) {
  const token = getAdminSessionToken(request);
  return verifyAdminSessionToken(token);
}

function toStringValue(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function toBooleanValue(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return fallback;
}

export async function GET(request) {
  if (!ensureAuthorized(request)) return createUnauthorizedResponse();

  try {
    const data = await getAdminPhotos();
    return NextResponse.json({
      ok: true,
      total: data.length,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error.message || "Unable to load photos.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  if (!ensureAuthorized(request)) return createUnauthorizedResponse();

  if (!isAdminStorageConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        message: "Supabase is not configured yet.",
      },
      { status: 503 }
    );
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid form data.",
      },
      { status: 400 }
    );
  }

  const filesFromForm = formData.getAll("files");
  const fallbackSingleFile = formData.get("file");
  const files = [...filesFromForm, fallbackSingleFile]
    .filter(Boolean)
    .filter((value) => typeof value !== "string");

  if (files.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        message: "At least one photo file is required.",
      },
      { status: 400 }
    );
  }

  if (files.length > MAX_BULK_UPLOAD_COUNT) {
    return NextResponse.json(
      {
        ok: false,
        message: `Max ${MAX_BULK_UPLOAD_COUNT} photos per upload.`,
      },
      { status: 400 }
    );
  }

  const invalidFile = files.find((file) => !file.type?.startsWith("image/"));
  if (invalidFile) {
    return NextResponse.json(
      {
        ok: false,
        message: "Only image files are allowed.",
      },
      { status: 400 }
    );
  }

  const oversizedFile = files.find((file) => file.size > MAX_UPLOAD_FILE_SIZE_BYTES);
  if (oversizedFile) {
    return NextResponse.json(
      {
        ok: false,
        message: "One file exceeds the 15MB limit.",
      },
      { status: 400 }
    );
  }

  const payload = {
    files,
    title: toStringValue(formData.get("title")),
    alt: toStringValue(formData.get("alt")),
    category: toStringValue(formData.get("category"), "Autre"),
    roles: toStringValue(formData.get("roles"), "[]"),
    isPublished: toBooleanValue(formData.get("isPublished"), true),
    isPinned: toBooleanValue(formData.get("isPinned"), false),
  };

  try {
    const created = await createAdminPhotos(payload);
    return NextResponse.json(
      {
        ok: true,
        total: created.length,
        data: created,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error.message || "Unable to create photo.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  if (!ensureAuthorized(request)) return createUnauthorizedResponse();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid JSON body.",
      },
      { status: 400 }
    );
  }

  const id = toStringValue(body?.id);
  if (!id) {
    return NextResponse.json(
      {
        ok: false,
        message: "Photo id is required.",
      },
      { status: 400 }
    );
  }

  try {
    const updated = await updateAdminPhoto(id, {
      title: body.title,
      alt: body.alt,
      category: body.category,
      roles: body.roles,
      isPublished: body.isPublished,
      isPinned: body.isPinned,
    });

    return NextResponse.json({
      ok: true,
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error.message || "Unable to update photo.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  if (!ensureAuthorized(request)) return createUnauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const id = toStringValue(searchParams.get("id"));
  if (!id) {
    return NextResponse.json(
      {
        ok: false,
        message: "Photo id is required.",
      },
      { status: 400 }
    );
  }

  try {
    await deleteAdminPhoto(id);
    return NextResponse.json({
      ok: true,
      message: "Photo deleted.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error.message || "Unable to delete photo.",
      },
      { status: 500 }
    );
  }
}

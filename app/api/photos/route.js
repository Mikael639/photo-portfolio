import { NextResponse } from "next/server";
import { getPublicPhotos } from "../../../lib/photoRepository";

function getCategoryParam(value) {
  if (!value) return "Tout";
  return value;
}

function getLimitParam(value) {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = getCategoryParam(searchParams.get("category"));
  const limit = getLimitParam(searchParams.get("limit"));

  const result = await getPublicPhotos({ category, limit });

  return NextResponse.json({
    ok: true,
    total: result.length,
    category,
    data: result,
  });
}

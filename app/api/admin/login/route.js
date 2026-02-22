import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  getAdminCookieOptions,
  isAdminConfigured,
  validateAdminCredentials,
} from "../../../../lib/adminAuth";

export const runtime = "nodejs";

export async function POST(request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        message: "Admin auth is not configured. Set ADMIN_USERNAME, ADMIN_PASSWORD and ADMIN_SESSION_SECRET.",
      },
      { status: 500 }
    );
  }

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

  const username = typeof body?.username === "string" ? body.username : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!validateAdminCredentials(username, password)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid credentials.",
      },
      { status: 401 }
    );
  }

  const response = NextResponse.json({
    ok: true,
    message: "Authenticated.",
  });

  response.cookies.set(ADMIN_COOKIE_NAME, createAdminSessionToken(username), getAdminCookieOptions());
  return response;
}

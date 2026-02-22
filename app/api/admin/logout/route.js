import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, getAdminCookieOptions } from "../../../../lib/adminAuth";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({
    ok: true,
    message: "Logged out.",
  });

  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    ...getAdminCookieOptions(),
    maxAge: 0,
  });

  return response;
}

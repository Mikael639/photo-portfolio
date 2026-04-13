import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "../../../../lib/adminAuth";

export const runtime = "nodejs";

export async function GET(request) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value || "";

  return NextResponse.json({
    ok: true,
    authenticated: verifyAdminSessionToken(token),
  });
}

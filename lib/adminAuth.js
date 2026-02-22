import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE_NAME = "jp_admin_session";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;

function getAdminUsername() {
  return process.env.ADMIN_USERNAME || "admin";
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || "";
}

function timingSafeEquals(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function signPayload(payload) {
  const secret = getSessionSecret();
  if (!secret) return "";
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function isAdminConfigured() {
  return Boolean(getAdminPassword() && getSessionSecret());
}

export function validateAdminCredentials(username, password) {
  if (!isAdminConfigured()) return false;
  return timingSafeEquals(username || "", getAdminUsername()) && timingSafeEquals(password || "", getAdminPassword());
}

export function createAdminSessionToken(username) {
  const payload = `${username}:${Date.now()}`;
  const signature = signPayload(payload);
  return `${Buffer.from(payload).toString("base64url")}.${signature}`;
}

export function verifyAdminSessionToken(token) {
  if (!token || !isAdminConfigured()) return false;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return false;

  const payload = Buffer.from(encodedPayload, "base64url").toString("utf8");
  const expectedSignature = signPayload(payload);
  if (!expectedSignature) return false;
  if (!timingSafeEquals(signature, expectedSignature)) return false;

  const [username, issuedAtRaw] = payload.split(":");
  const issuedAt = Number.parseInt(issuedAtRaw, 10);
  if (!username || !Number.isFinite(issuedAt)) return false;
  if (!timingSafeEquals(username, getAdminUsername())) return false;

  const expiresAt = issuedAt + SESSION_TTL_SECONDS * 1000;
  return Date.now() < expiresAt;
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

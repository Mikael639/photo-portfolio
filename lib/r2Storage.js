import crypto from "node:crypto";

function getR2AccountId() {
  return process.env.R2_ACCOUNT_ID || "";
}

function getR2AccessKeyId() {
  return process.env.R2_ACCESS_KEY_ID || "";
}

function getR2SecretAccessKey() {
  return process.env.R2_SECRET_ACCESS_KEY || "";
}

export function getR2Bucket() {
  return process.env.R2_BUCKET || "";
}

export function getR2PublicUrl() {
  return (process.env.R2_PUBLIC_URL || "").replace(/\/+$/, "");
}

export function isR2Configured() {
  return Boolean(getR2AccountId() && getR2AccessKeyId() && getR2SecretAccessKey() && getR2Bucket() && getR2PublicUrl());
}

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function hmac(key, value, encoding) {
  return crypto.createHmac("sha256", key).update(value).digest(encoding);
}

function encodeRfc3986(value) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}

function encodeStoragePath(storagePath) {
  return storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function getR2ObjectUrl(storagePath) {
  const bucket = getR2Bucket();
  const encodedPath = encodeStoragePath(storagePath);
  return `https://${getR2AccountId()}.r2.cloudflarestorage.com/${bucket}/${encodedPath}`;
}

function signR2Request({ method, url, body = Buffer.alloc(0), contentType = "" }) {
  const parsed = new URL(url);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const region = "auto";
  const service = "s3";
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const payloadHash = hash(body);
  const canonicalQuery = [...parsed.searchParams.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${encodeRfc3986(key)}=${encodeRfc3986(value)}`)
    .join("&");
  const headerEntries = [
    ["host", parsed.host],
    ["x-amz-content-sha256", payloadHash],
    ["x-amz-date", amzDate],
  ];

  if (contentType) {
    headerEntries.push(["content-type", contentType]);
  }

  headerEntries.sort(([left], [right]) => left.localeCompare(right));

  const canonicalHeaders = headerEntries.map(([key, value]) => `${key}:${value}\n`).join("");
  const signedHeaders = headerEntries.map(([key]) => key).join(";");
  const canonicalRequest = [method, parsed.pathname, canonicalQuery, canonicalHeaders, signedHeaders, payloadHash].join(
    "\n"
  );
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, hash(canonicalRequest)].join("\n");
  const dateKey = hmac(`AWS4${getR2SecretAccessKey()}`, dateStamp);
  const regionKey = hmac(dateKey, region);
  const serviceKey = hmac(regionKey, service);
  const signingKey = hmac(serviceKey, "aws4_request");
  const signature = hmac(signingKey, stringToSign, "hex");

  return {
    ...(contentType ? { "Content-Type": contentType } : {}),
    Authorization: `AWS4-HMAC-SHA256 Credential=${getR2AccessKeyId()}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };
}

async function fetchR2OrThrow(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const payload = await response.text();
    throw new Error(payload || `R2 request failed with status ${response.status}`);
  }
  return response;
}

export async function uploadR2Object({ storagePath, buffer, contentType }) {
  if (!isR2Configured()) {
    throw new Error("R2 is not configured.");
  }

  const url = getR2ObjectUrl(storagePath);
  await fetchR2OrThrow(url, {
    method: "PUT",
    headers: signR2Request({
      method: "PUT",
      url,
      body: buffer,
      contentType: contentType || "application/octet-stream",
    }),
    body: buffer,
  });

  const encodedPath = encodeStoragePath(storagePath);
  return {
    storagePath,
    publicUrl: `${getR2PublicUrl()}/${encodedPath}`,
  };
}

export async function deleteR2Object(storagePath) {
  if (!storagePath || !isR2Configured()) return;

  const url = getR2ObjectUrl(storagePath);
  await fetchR2OrThrow(url, {
    method: "DELETE",
    headers: signR2Request({
      method: "DELETE",
      url,
    }),
  });
}

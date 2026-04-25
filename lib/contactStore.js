const GLOBAL_STORE_KEY = "__photo_portfolio_contact_store__";
const CONTACT_MESSAGES_TABLE = "contact_messages";

function getSupabaseUrl() {
  return process.env.SUPABASE_URL || "";
}

function getSupabaseServiceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

function hasSupabaseAdminConfig() {
  return Boolean(getSupabaseUrl() && getSupabaseServiceKey());
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

function getAdminHeaders(contentType = "application/json") {
  const serviceRoleKey = getSupabaseServiceKey();
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": contentType,
  };
}

function getStore() {
  if (!globalThis[GLOBAL_STORE_KEY]) {
    globalThis[GLOBAL_STORE_KEY] = [];
  }

  return globalThis[GLOBAL_STORE_KEY];
}

export function addContactMessage(payload) {
  const store = getStore();
  const message = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    ...payload,
  };

  store.unshift(message);
  return message;
}

export function listLocalContactMessages() {
  return getStore();
}

function normalizeContactMessage(row) {
  return {
    id: row.id,
    createdAt: row.created_at || row.createdAt || "",
    name: row.name || "",
    email: row.email || "",
    company: row.company || "",
    phone: row.phone || "",
    serviceType: row.service_type || row.serviceType || "",
    preferredContact: row.preferred_contact || row.preferredContact || "Email",
    budget: row.budget || "A definir",
    eventDate: row.event_date || row.eventDate || "",
    location: row.location || "",
    referenceLink: row.reference_link || row.referenceLink || "",
    project: row.project || "",
  };
}

function toDatabasePayload(payload) {
  return {
    name: payload.name,
    email: payload.email,
    company: payload.company,
    phone: payload.phone,
    service_type: payload.serviceType,
    preferred_contact: payload.preferredContact,
    budget: payload.budget,
    event_date: payload.eventDate || null,
    location: payload.location,
    reference_link: payload.referenceLink,
    project: payload.project,
  };
}

async function fetchJsonOrThrow(response) {
  const payload = await response.text();

  if (!response.ok) {
    throw new Error(payload || `Request failed with status ${response.status}`);
  }

  return payload ? JSON.parse(payload) : null;
}

async function addSupabaseContactMessage(payload) {
  const response = await fetch(buildRestUrl(`/rest/v1/${CONTACT_MESSAGES_TABLE}`), {
    method: "POST",
    headers: {
      ...getAdminHeaders(),
      Prefer: "return=representation",
    },
    body: JSON.stringify(toDatabasePayload(payload)),
  });

  const rows = await fetchJsonOrThrow(response);
  const list = Array.isArray(rows) ? rows : [];
  return normalizeContactMessage(list[0] || payload);
}

async function listSupabaseContactMessages() {
  const url = new URL(buildRestUrl(`/rest/v1/${CONTACT_MESSAGES_TABLE}`));
  url.searchParams.set("select", "*");
  url.searchParams.append("order", "created_at.desc");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getAdminHeaders(),
    cache: "no-store",
  });

  const rows = await fetchJsonOrThrow(response);
  const list = Array.isArray(rows) ? rows : [];
  return list.map(normalizeContactMessage);
}

export async function createContactMessage(payload) {
  if (!hasSupabaseAdminConfig()) {
    return addContactMessage(payload);
  }

  try {
    return await addSupabaseContactMessage(payload);
  } catch (error) {
    console.error("Unable to persist contact message in Supabase", error);
    return addContactMessage(payload);
  }
}

export async function listContactMessages() {
  if (!hasSupabaseAdminConfig()) {
    return listLocalContactMessages();
  }

  try {
    return await listSupabaseContactMessages();
  } catch (error) {
    console.error("Unable to list contact messages from Supabase", error);
    return listLocalContactMessages();
  }
}

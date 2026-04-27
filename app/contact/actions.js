"use server";

import { headers } from "next/headers";
import { createContactMessage } from "../../lib/contactStore";
import { sendContactEmails } from "../../lib/contactEmail";
import { validateContactInput } from "../../lib/contactValidation";
import { consumeRateLimit } from "../../lib/rateLimit";

const CONTACT_SEND_ERROR_MESSAGE =
  "Message enregistré, mais l'envoi email est temporairement indisponible. Nous traiterons votre demande rapidement.";

function getHeaderValue(headersList, key) {
  const value = headersList.get(key);
  return typeof value === "string" ? value : "";
}

async function getClientIp() {
  const requestHeaders = await headers();
  const forwarded = getHeaderValue(requestHeaders, "x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIp = getHeaderValue(requestHeaders, "x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

function getStringValue(formData, key, fallback = "") {
  const value = formData.get(key);
  return typeof value === "string" ? value : fallback;
}

export async function submitContactForm(_previousState, formData) {
  const ip = await getClientIp();
  const limiter = consumeRateLimit(ip, { limit: 5, windowMs: 10 * 60 * 1000 });

  if (!limiter.allowed) {
    return {
      status: "error",
      message: "Trop de tentatives. Réessaye dans quelques minutes.",
      errors: {},
    };
  }

  const validation = validateContactInput({
    name: getStringValue(formData, "name"),
    email: getStringValue(formData, "email"),
    company: getStringValue(formData, "company"),
    phone: getStringValue(formData, "phone"),
    serviceType: getStringValue(formData, "serviceType"),
    preferredContact: getStringValue(formData, "preferredContact"),
    budget: getStringValue(formData, "budget"),
    eventDate: getStringValue(formData, "eventDate"),
    location: getStringValue(formData, "location"),
    referenceLink: getStringValue(formData, "referenceLink"),
    project: getStringValue(formData, "project"),
  });

  if (!validation.isValid) {
    return {
      status: "error",
      message: "Validation échouée.",
      errors: validation.errors,
    };
  }

  const created = await createContactMessage(validation.sanitized);

  try {
    const emailResult = await sendContactEmails(created);
    return {
      status: "success",
      message: emailResult?.autoReplySent
        ? "Message envoyé."
        : "Message envoyé. Confirmation email au client non disponible pour le moment.",
      errors: {},
    };
  } catch (error) {
    console.error("Contact email delivery failed", error);
    return {
      status: "error",
      message: CONTACT_SEND_ERROR_MESSAGE,
      errors: {},
    };
  }
}

import { NextResponse } from "next/server";
import { createContactMessage, listContactMessages } from "../../../lib/contactStore";
import { sendContactEmails } from "../../../lib/contactEmail";
import { validateContactInput } from "../../../lib/contactValidation";
import { consumeRateLimit } from "../../../lib/rateLimit";

export const runtime = "nodejs";

const CONTACT_SEND_ERROR_MESSAGE =
  "Message enregistré, mais l'envoi email est temporairement indisponible. Nous traiterons votre demande rapidement.";

function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

export async function POST(request) {
  const ip = getClientIp(request);
  const limiter = consumeRateLimit(ip, { limit: 5, windowMs: 10 * 60 * 1000 });

  if (!limiter.allowed) {
    return NextResponse.json(
      {
        ok: false,
        message: "Trop de tentatives. Réessaye dans quelques minutes.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(limiter.retryAfterMs / 1000)),
        },
      }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Body JSON invalide.",
      },
      { status: 400 }
    );
  }

  const validation = validateContactInput(body);
  if (!validation.isValid) {
    return NextResponse.json(
      {
        ok: false,
        message: "Validation échouée.",
        errors: validation.errors,
      },
      { status: 422 }
    );
  }

  const created = await createContactMessage(validation.sanitized);

  let emailResult;
  try {
    emailResult = await sendContactEmails(created);
  } catch (error) {
    console.error("Contact API email delivery failed", error);
    return NextResponse.json(
      {
        ok: false,
        message: CONTACT_SEND_ERROR_MESSAGE,
      },
      { status: 502 }
    );
  }

  const responseMessage = emailResult?.autoReplySent
    ? "Message envoyé."
    : "Message envoyé. Confirmation email au client non disponible pour le moment.";

  return NextResponse.json(
    {
      ok: true,
      message: responseMessage,
      warning: emailResult?.autoReplySent ? null : "AUTO_REPLY_UNAVAILABLE",
    },
    { status: 201 }
  );
}

export async function GET(request) {
  const adminKey = process.env.ADMIN_API_KEY;
  const requestKey = request.headers.get("x-admin-key");

  if (!adminKey || requestKey !== adminKey) {
    return NextResponse.json(
      {
        ok: false,
        message: "Unauthorized.",
      },
      { status: 401 }
    );
  }

  const messages = await listContactMessages();

  return NextResponse.json({
    ok: true,
    total: messages.length,
    data: messages,
  });
}

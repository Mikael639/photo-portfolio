import { NextResponse } from "next/server";
import { addContactMessage, listContactMessages } from "../../../lib/contactStore";
import { sendContactEmails } from "../../../lib/contactEmail";
import { validateContactInput } from "../../../lib/contactValidation";
import { consumeRateLimit } from "../../../lib/rateLimit";

export const runtime = "nodejs";

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
        message: "Trop de tentatives. Reessaye dans quelques minutes.",
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
        message: "Validation echouee.",
        errors: validation.errors,
      },
      { status: 422 }
    );
  }

  const created = addContactMessage(validation.sanitized);

  let emailResult;
  try {
    emailResult = await sendContactEmails(created);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: `Message enregistre mais email principal non envoye: ${error.message || "erreur inconnue"}`,
      },
      { status: 502 }
    );
  }

  const responseMessage = emailResult?.autoReplySent
    ? "Message envoye."
    : "Message envoye. Confirmation email au client non disponible pour le moment.";

  return NextResponse.json(
    {
      ok: true,
      message: responseMessage,
      warning: emailResult?.autoReplySent ? null : emailResult?.autoReplyError || null,
      data: created,
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

  return NextResponse.json({
    ok: true,
    total: listContactMessages().length,
    data: listContactMessages(),
  });
}

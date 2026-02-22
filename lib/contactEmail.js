const RESEND_API_URL = "https://api.resend.com/emails";
const DEFAULT_TO = "coulibaly@et.esiea.fr";
const DEFAULT_FROM = "Jerrypicsart <onboarding@resend.dev>";
const DEFAULT_REPLY_SUBJECT = "Merci pour votre demande - Jerrypicsart";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getEmailConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY || "",
    to: process.env.CONTACT_TO_EMAIL || DEFAULT_TO,
    from: process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM,
    autoReplySubject: process.env.CONTACT_AUTO_REPLY_SUBJECT || DEFAULT_REPLY_SUBJECT,
  };
}

function buildOwnerEmailPayload(message) {
  const subject = `[Nouveau devis] ${message.serviceType || "Prestation"} - ${message.name}`;

  const text = [
    "Nouveau formulaire de contact",
    "",
    `Nom: ${message.name}`,
    `Email: ${message.email}`,
    `Prestation: ${message.serviceType || ""}`,
    `Date evenement: ${message.eventDate || "Non precisee"}`,
    `Lieu: ${message.location || "Non precise"}`,
    "",
    "Details du projet:",
    message.project || "",
    "",
    `Date envoi: ${message.createdAt || ""}`,
  ].join("\n");

  const html = `
    <h2>Nouveau formulaire de contact</h2>
    <p><strong>Nom:</strong> ${escapeHtml(message.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(message.email)}</p>
    <p><strong>Prestation:</strong> ${escapeHtml(message.serviceType || "")}</p>
    <p><strong>Date evenement:</strong> ${escapeHtml(message.eventDate || "Non precisee")}</p>
    <p><strong>Lieu:</strong> ${escapeHtml(message.location || "Non precise")}</p>
    <p><strong>Details:</strong></p>
    <p>${escapeHtml(message.project || "").replace(/\n/g, "<br/>")}</p>
    <hr />
    <p><small>Envoye le ${escapeHtml(message.createdAt || "")}</small></p>
  `;

  return { subject, text, html };
}

function buildClientAutoReplyPayload(message, autoReplySubject) {
  const text = [
    `Bonjour ${message.name},`,
    "",
    "Merci pour votre prise de contact.",
    "Nous avons bien recu votre demande et nous reviendrons vers vous tres rapidement.",
    "",
    "Recapitulatif de votre demande:",
    `- Prestation: ${message.serviceType || ""}`,
    `- Date evenement: ${message.eventDate || "Non precisee"}`,
    `- Lieu: ${message.location || "Non precise"}`,
    "",
    "A bientot,",
    "Jerrypicsart",
  ].join("\n");

  const html = `
    <p>Bonjour ${escapeHtml(message.name)},</p>
    <p>Merci pour votre prise de contact.</p>
    <p>Nous avons bien recu votre demande et nous reviendrons vers vous tres rapidement.</p>
    <p><strong>Recapitulatif:</strong></p>
    <ul>
      <li>Prestation: ${escapeHtml(message.serviceType || "")}</li>
      <li>Date evenement: ${escapeHtml(message.eventDate || "Non precisee")}</li>
      <li>Lieu: ${escapeHtml(message.location || "Non precise")}</li>
    </ul>
    <p>A bientot,<br/>Jerrypicsart</p>
  `;

  return {
    subject: autoReplySubject,
    text,
    html,
  };
}

async function sendResendEmail({ apiKey, from, to, replyTo, subject, text, html }) {
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(payload || "Unable to send email.");
  }
}

export async function sendContactEmails(message) {
  const config = getEmailConfig();
  if (!config.apiKey) {
    throw new Error("RESEND_API_KEY is missing.");
  }

  const ownerMail = buildOwnerEmailPayload(message);
  await sendResendEmail({
    apiKey: config.apiKey,
    from: config.from,
    to: config.to,
    replyTo: message.email,
    subject: ownerMail.subject,
    text: ownerMail.text,
    html: ownerMail.html,
  });

  const result = {
    ownerSent: true,
    autoReplySent: false,
    autoReplyError: "",
  };

  const clientMail = buildClientAutoReplyPayload(message, config.autoReplySubject);
  try {
    await sendResendEmail({
      apiKey: config.apiKey,
      from: config.from,
      to: message.email,
      subject: clientMail.subject,
      text: clientMail.text,
      html: clientMail.html,
    });
    result.autoReplySent = true;
  } catch (error) {
    result.autoReplyError = error.message || "auto-reply failed";
  }

  return result;
}

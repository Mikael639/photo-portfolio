"use client";

import { useState } from "react";

const serviceOptions = ["Fashion Week", "Mariage", "Eglise", "Concert", "Autre"];
const preferredContactOptions = ["Email", "Telephone", "Instagram / WhatsApp"];
const budgetOptions = ["A definir", "Moins de 500 EUR", "500 - 1000 EUR", "1000 - 2000 EUR", "Plus de 2000 EUR"];

const initialForm = {
  name: "",
  email: "",
  company: "",
  phone: "",
  serviceType: "Fashion Week",
  preferredContact: "Email",
  budget: "A definir",
  eventDate: "",
  location: "",
  referenceLink: "",
  project: "",
};

export default function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    setErrors({});

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(result.message || "Une erreur est survenue.");
        setErrors(result.errors || {});
        return;
      }

      setStatus("success");
      setMessage(result.message || "Message envoye.");
      setForm(initialForm);
    } catch {
      setStatus("error");
      setMessage("Impossible de contacter le serveur.");
    }
  }

  return (
    <form
      id="contact-form"
      onSubmit={handleSubmit}
      className="grid scroll-mt-32 gap-5 rounded-[1.7rem] border border-line/12 bg-white/52 p-6 md:grid-cols-2 md:p-7"
    >
      <div className="space-y-3 rounded-[1.6rem] border border-line/10 bg-paper/70 p-5 md:col-span-2">
        <p className="text-[11px] uppercase tracking-[0.24em] text-ink/48">Brief express</p>
        <h2 className="font-serif text-3xl leading-tight md:text-4xl">Parle-moi du contexte et du rendu attendu.</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-ink/65 md:text-base">
          Date, lieu, type de prestation, ambiance recherchee et contraintes utiles suffisent pour lancer un echange
          clair.
        </p>
      </div>

      <label className="space-y-2">
        <span className="text-[11px] uppercase tracking-[0.2em] text-ink/58">Nom</span>
        <input
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          className="w-full rounded-xl border border-line/18 bg-paper/88 px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
          required
        />
        {errors.name ? <span className="text-xs text-red-700">{errors.name}</span> : null}
      </label>

      <label className="space-y-2">
        <span className="text-[11px] uppercase tracking-[0.2em] text-ink/58">Email</span>
        <input
          type="email"
          value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          className="w-full rounded-xl border border-line/18 bg-paper/88 px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
          required
        />
        {errors.email ? <span className="text-xs text-red-700">{errors.email}</span> : null}
      </label>

      <label className="space-y-2">
        <span className="text-[11px] uppercase tracking-[0.2em] text-ink/58">Structure / marque</span>
        <input
          value={form.company}
          onChange={(event) => updateField("company", event.target.value)}
          autoComplete="organization"
          aria-invalid={Boolean(errors.company)}
          className="w-full rounded-xl border border-line/18 bg-paper/88 px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
          placeholder="Optionnel"
        />
        {errors.company ? <span className="text-xs text-red-700">{errors.company}</span> : null}
      </label>

      <label className="space-y-2">
        <span className="text-[11px] uppercase tracking-[0.2em] text-ink/58">Telephone</span>
        <input
          value={form.phone}
          onChange={(event) => updateField("phone", event.target.value)}
          autoComplete="tel"
          inputMode="tel"
          aria-invalid={Boolean(errors.phone)}
          className="w-full rounded-xl border border-line/18 bg-paper/88 px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
          placeholder="Optionnel"
        />
        {errors.phone ? <span className="text-xs text-red-700">{errors.phone}</span> : null}
      </label>

      <label className="space-y-2">
        <span className="text-[11px] uppercase tracking-[0.2em] text-ink/58">Type de prestation</span>
        <select
          value={form.serviceType}
          onChange={(event) => updateField("serviceType", event.target.value)}
          aria-invalid={Boolean(errors.serviceType)}
          className="w-full rounded-xl border border-line/18 bg-paper/88 px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
        >
          {serviceOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {errors.serviceType ? <span className="text-xs text-red-700">{errors.serviceType}</span> : null}
      </label>

      <label className="space-y-2">
        <span className="text-[11px] uppercase tracking-[0.2em] text-ink/58">Canal prefere</span>
        <select
          value={form.preferredContact}
          onChange={(event) => updateField("preferredContact", event.target.value)}
          aria-invalid={Boolean(errors.preferredContact)}
          className="w-full rounded-xl border border-line/18 bg-paper/88 px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
        >
          {preferredContactOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {errors.preferredContact ? <span className="text-xs text-red-700">{errors.preferredContact}</span> : null}
      </label>

      <label className="space-y-2">
        <span className="text-[11px] uppercase tracking-[0.2em] text-ink/58">Budget indicatif</span>
        <select
          value={form.budget}
          onChange={(event) => updateField("budget", event.target.value)}
          aria-invalid={Boolean(errors.budget)}
          className="w-full rounded-xl border border-line/18 bg-paper/88 px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
        >
          {budgetOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {errors.budget ? <span className="text-xs text-red-700">{errors.budget}</span> : null}
      </label>

      <label className="space-y-2">
        <span className="text-[11px] uppercase tracking-[0.2em] text-ink/58">Date de l&apos;evenement</span>
        <input
          type="date"
          value={form.eventDate}
          onChange={(event) => updateField("eventDate", event.target.value)}
          aria-invalid={Boolean(errors.eventDate)}
          className="w-full rounded-xl border border-line/18 bg-paper/88 px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
        />
        {errors.eventDate ? <span className="text-xs text-red-700">{errors.eventDate}</span> : null}
      </label>

      <label className="space-y-2 md:col-span-2">
        <span className="text-[11px] uppercase tracking-[0.2em] text-ink/58">Lieu</span>
        <input
          value={form.location}
          onChange={(event) => updateField("location", event.target.value)}
          autoComplete="address-level2"
          aria-invalid={Boolean(errors.location)}
          className="w-full rounded-xl border border-line/18 bg-paper/88 px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
          placeholder="Ville, salle, eglise..."
        />
        {errors.location ? <span className="text-xs text-red-700">{errors.location}</span> : null}
      </label>

      <label className="space-y-2 md:col-span-2">
        <span className="text-[11px] uppercase tracking-[0.2em] text-ink/58">Reference ou lien utile</span>
        <input
          value={form.referenceLink}
          onChange={(event) => updateField("referenceLink", event.target.value)}
          aria-invalid={Boolean(errors.referenceLink)}
          className="w-full rounded-xl border border-line/18 bg-paper/88 px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
          placeholder="Pinterest, Instagram, dossier press, brief..."
        />
        {errors.referenceLink ? <span className="text-xs text-red-700">{errors.referenceLink}</span> : null}
      </label>

      <label className="space-y-2 md:col-span-2">
        <span className="text-[11px] uppercase tracking-[0.2em] text-ink/58">Details du projet</span>
        <textarea
          rows={6}
          value={form.project}
          onChange={(event) => updateField("project", event.target.value)}
          aria-invalid={Boolean(errors.project)}
          className="w-full rounded-[1.2rem] border border-line/18 bg-paper/88 px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
          placeholder="Type de projet, date, lieu, ambiance recherchee, contraintes utiles..."
          required
        />
        {errors.project ? <span className="text-xs text-red-700">{errors.project}</span> : null}
      </label>

      <div className="flex flex-wrap items-center gap-3 md:col-span-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-fit rounded-full bg-ink px-6 py-3 text-sm uppercase tracking-[0.18em] text-paper transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "loading" ? "Envoi..." : "Envoyer la demande"}
        </button>

        <p className="text-sm text-ink/55">Reponse habituelle sous 24h a 48h avec un retour oriente action.</p>

        {message ? (
          <p
            aria-live="polite"
            className={`text-sm ${status === "success" ? "text-emerald-700" : "text-red-700"}`}
          >
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";

const serviceOptions = ["Fashion Week", "Mariage", "Eglise", "Concert", "Autre"];

const initialForm = {
  name: "",
  email: "",
  serviceType: "Fashion Week",
  eventDate: "",
  location: "",
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
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-line/25 bg-white/50 p-6 md:grid-cols-2">
      <label className="space-y-2">
        <span className="text-sm text-ink/70">Nom</span>
        <input
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          className="w-full rounded-lg border border-line/30 bg-paper px-3 py-2 outline-none focus:border-accent"
          required
        />
        {errors.name ? <span className="text-xs text-red-700">{errors.name}</span> : null}
      </label>

      <label className="space-y-2">
        <span className="text-sm text-ink/70">Email</span>
        <input
          type="email"
          value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
          className="w-full rounded-lg border border-line/30 bg-paper px-3 py-2 outline-none focus:border-accent"
          required
        />
        {errors.email ? <span className="text-xs text-red-700">{errors.email}</span> : null}
      </label>

      <label className="space-y-2">
        <span className="text-sm text-ink/70">Type de prestation</span>
        <select
          value={form.serviceType}
          onChange={(event) => updateField("serviceType", event.target.value)}
          className="w-full rounded-lg border border-line/30 bg-paper px-3 py-2 outline-none focus:border-accent"
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
        <span className="text-sm text-ink/70">Date de l&apos;evenement (optionnel)</span>
        <input
          type="date"
          value={form.eventDate}
          onChange={(event) => updateField("eventDate", event.target.value)}
          className="w-full rounded-lg border border-line/30 bg-paper px-3 py-2 outline-none focus:border-accent"
        />
        {errors.eventDate ? <span className="text-xs text-red-700">{errors.eventDate}</span> : null}
      </label>

      <label className="space-y-2 md:col-span-2">
        <span className="text-sm text-ink/70">Lieu (optionnel)</span>
        <input
          value={form.location}
          onChange={(event) => updateField("location", event.target.value)}
          className="w-full rounded-lg border border-line/30 bg-paper px-3 py-2 outline-none focus:border-accent"
          placeholder="Ville, salle, eglise..."
        />
        {errors.location ? <span className="text-xs text-red-700">{errors.location}</span> : null}
      </label>

      <label className="space-y-2 md:col-span-2">
        <span className="text-sm text-ink/70">Details du projet</span>
        <textarea
          rows={6}
          value={form.project}
          onChange={(event) => updateField("project", event.target.value)}
          className="w-full rounded-lg border border-line/30 bg-paper px-3 py-2 outline-none focus:border-accent"
          required
        />
        {errors.project ? <span className="text-xs text-red-700">{errors.project}</span> : null}
      </label>

      <div className="flex flex-wrap items-center gap-3 md:col-span-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-fit rounded-full bg-ink px-5 py-2 text-sm uppercase tracking-[0.18em] text-paper transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "loading" ? "Envoi..." : "Envoyer"}
        </button>

        {message ? (
          <p className={`text-sm ${status === "success" ? "text-emerald-700" : "text-red-700"}`}>{message}</p>
        ) : null}
      </div>
    </form>
  );
}

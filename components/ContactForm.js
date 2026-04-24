"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitContactForm } from "../app/contact/actions";
import { initialContactFormState } from "../app/contact/constants";
import SubmitButton from "./SubmitButton";

const serviceOptions = ["Fashion Week", "Mariage", "Shooting photo"];
const preferredContactOptions = ["Email", "Telephone", "Instagram / WhatsApp"];
const budgetOptions = ["A definir", "Moins de 500 EUR", "500 - 1000 EUR", "1000 - 2000 EUR", "Plus de 2000 EUR"];

export default function ContactForm() {
  const formRef = useRef(null);
  const [formState, formAction] = useActionState(submitContactForm, initialContactFormState);
  const errors = formState.errors || {};
  const status = formState.status || "idle";
  const message = formState.message || "";

  useEffect(() => {
    if (status === "success") {
      formRef.current?.reset();
    }
  }, [status]);

  return (
    <form
      ref={formRef}
      id="contact-form"
      action={formAction}
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
          name="name"
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
          name="email"
          type="email"
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
          name="company"
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
          name="phone"
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
          name="serviceType"
          defaultValue="Fashion Week"
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
          name="preferredContact"
          defaultValue="Email"
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
          name="budget"
          defaultValue="A definir"
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
          name="eventDate"
          type="date"
          aria-invalid={Boolean(errors.eventDate)}
          className="w-full rounded-xl border border-line/18 bg-paper/88 px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
        />
        {errors.eventDate ? <span className="text-xs text-red-700">{errors.eventDate}</span> : null}
      </label>

      <label className="space-y-2 md:col-span-2">
        <span className="text-[11px] uppercase tracking-[0.2em] text-ink/58">Lieu</span>
        <input
          name="location"
          autoComplete="address-level2"
          aria-invalid={Boolean(errors.location)}
          className="w-full rounded-xl border border-line/18 bg-paper/88 px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
          placeholder="Ville, salle, lieu..."
        />
        {errors.location ? <span className="text-xs text-red-700">{errors.location}</span> : null}
      </label>

      <label className="space-y-2 md:col-span-2">
        <span className="text-[11px] uppercase tracking-[0.2em] text-ink/58">Reference ou lien utile</span>
        <input
          name="referenceLink"
          aria-invalid={Boolean(errors.referenceLink)}
          className="w-full rounded-xl border border-line/18 bg-paper/88 px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
          placeholder="Pinterest, Instagram, dossier press, brief..."
        />
        {errors.referenceLink ? <span className="text-xs text-red-700">{errors.referenceLink}</span> : null}
      </label>

      <label className="space-y-2 md:col-span-2">
        <span className="text-[11px] uppercase tracking-[0.2em] text-ink/58">Details du projet</span>
        <textarea
          name="project"
          rows={6}
          aria-invalid={Boolean(errors.project)}
          className="w-full rounded-[1.2rem] border border-line/18 bg-paper/88 px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
          placeholder="Type de projet, date, lieu, ambiance recherchee, contraintes utiles..."
          required
        />
        {errors.project ? <span className="text-xs text-red-700">{errors.project}</span> : null}
      </label>

      <div className="flex flex-wrap items-center gap-3 md:col-span-2">
        <SubmitButton
          idleLabel="Envoyer la demande"
          pendingLabel="Envoi..."
          className="w-fit rounded-full bg-ink px-6 py-3 text-sm uppercase tracking-[0.18em] text-paper transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
        />

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

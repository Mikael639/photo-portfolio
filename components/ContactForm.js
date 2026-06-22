"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { submitContactForm } from "../app/contact/actions";
import { initialContactFormState } from "../app/contact/constants";
import { defaultPortfolioCategory, portfolioCategories } from "../lib/categories";
import SubmitButton from "./SubmitButton";
import CustomSelect from "./CustomSelect";

const serviceOptions = portfolioCategories;
const preferredContactOptions = ["Email", "Téléphone", "Instagram / WhatsApp"];
const budgetOptions = ["À définir", "Moins de 500 EUR", "500 - 1000 EUR", "1000 - 2000 EUR", "Plus de 2000 EUR"];

function SuccessCard({ onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-inset border border-emerald-200/60 bg-[linear-gradient(180deg,rgba(236,253,245,0.95),rgba(255,255,255,0.92))] p-8 text-center shadow-[0_24px_80px_rgba(12,10,8,0.08)]"
      role="status"
      aria-live="polite"
    >
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 220, damping: 16 }}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_10px_30px_rgba(16,185,129,0.35)]"
        aria-hidden="true"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </motion.div>
      <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-700/80">Demande envoyée</p>
      <h3 className="mt-3 font-serif text-3xl tracking-tight text-ink md:text-4xl">
        Merci pour votre message.
      </h3>
      <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink/65">
        Un email récapitulatif vient d&apos;être envoyé automatiquement à votre adresse. Je reviens vers vous personnellement
        sous 24 à 48h avec un retour orienté action.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-line/25 px-6 py-3 text-[12px] font-bold uppercase tracking-[0.18em] text-ink transition hover:border-ink hover:bg-white"
        >
          Envoyer une autre demande
        </button>
        <a
          href="/gallery"
          className="rounded-full bg-ink px-6 py-3 text-[12px] font-bold uppercase tracking-[0.18em] text-paper transition hover:bg-accent"
        >
          Revoir la galerie
        </a>
      </div>
    </motion.div>
  );
}

export default function ContactForm() {
  const formRef = useRef(null);
  const [formState, formAction] = useActionState(submitContactForm, initialContactFormState);
  const [isSuccessDismissed, setIsSuccessDismissed] = useState(false);
  const [lastStatus, setLastStatus] = useState("idle");
  const errors = formState.errors || {};
  const status = formState.status || "idle";
  const message = formState.message || "";
  const showSuccessCard = status === "success" && !isSuccessDismissed;

  // Recommended React 19 pattern: derive state from props/state changes during render
  if (status !== lastStatus) {
    setLastStatus(status);
    if (status === "success") {
      setIsSuccessDismissed(false);
    }
  }

  useEffect(() => {
    if (status === "success") {
      formRef.current?.reset();
    }
  }, [status]);

  if (showSuccessCard) {
    return (
      <AnimatePresence mode="wait">
        <SuccessCard key="success" onReset={() => setIsSuccessDismissed(true)} />
      </AnimatePresence>
    );
  }

  return (
    <form
      ref={formRef}
      id="contact-form"
      action={formAction}
      className="grid scroll-mt-32 gap-5 rounded-inset border border-line/12 bg-white/52 p-6 md:grid-cols-2 md:p-7"
    >
      <div className="space-y-3 rounded-inset border border-line/10 bg-paper/70 p-5 md:col-span-2">
        <p className="text-[11px] uppercase tracking-[0.24em] text-ink/48">Brief express</p>
        <h2 className="font-serif text-3xl leading-tight md:text-4xl">Parle-moi du contexte et du rendu attendu.</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-ink/65 md:text-base">
          Date, lieu, type de prestation, ambiance recherchée et contraintes utiles suffisent pour lancer un échange
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
        <span className="text-[11px] uppercase tracking-[0.2em] text-ink/58">Téléphone</span>
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

      <CustomSelect
        name="serviceType"
        label="Type de prestation"
        options={serviceOptions}
        defaultValue={defaultPortfolioCategory}
        error={errors.serviceType}
      />

      <CustomSelect
        name="preferredContact"
        label="Canal préféré"
        options={preferredContactOptions}
        defaultValue="Email"
        error={errors.preferredContact}
      />

      <CustomSelect
        name="budget"
        label="Budget indicatif"
        options={budgetOptions}
        defaultValue="À définir"
        error={errors.budget}
      />

      <label className="space-y-2">
        <span className="text-[11px] uppercase tracking-[0.2em] text-ink/58">Date de l&apos;événement</span>
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
        <span className="text-[11px] uppercase tracking-[0.2em] text-ink/58">Référence ou lien utile</span>
        <input
          name="referenceLink"
          aria-invalid={Boolean(errors.referenceLink)}
          className="w-full rounded-xl border border-line/18 bg-paper/88 px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
          placeholder="Pinterest, Instagram, dossier press, brief..."
        />
        {errors.referenceLink ? <span className="text-xs text-red-700">{errors.referenceLink}</span> : null}
      </label>

      <label className="space-y-2 md:col-span-2">
        <span className="text-[11px] uppercase tracking-[0.2em] text-ink/58">Détails du projet</span>
        <textarea
          name="project"
          rows={6}
          aria-invalid={Boolean(errors.project)}
          className="w-full rounded-[1.2rem] border border-line/18 bg-paper/88 px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
          placeholder="Type de projet, date, lieu, ambiance recherchée, contraintes utiles..."
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

        <p className="text-sm text-ink/55">Réponse habituelle sous 24h à 48h avec un retour orienté action.</p>

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

const fields = [
  { key: "eyebrow", label: "Petit texte en haut de l'accueil" },
  { key: "heroTitle", label: "Titre principal de l'accueil (hero)", multiline: true },
  { key: "primaryCta", label: "Bouton principal" },
  { key: "secondaryCta", label: "Bouton secondaire" },
  { key: "directionTitle", label: "Titre du bloc direction" },
  { key: "directionText", label: "Texte du bloc direction", multiline: true },
  { key: "weddingEyebrow", label: "Etiquette du bloc mariage" },
  { key: "weddingTitle", label: "Titre du bloc mariage" },
  { key: "weddingText", label: "Texte du bloc mariage", multiline: true },
];

export default function AdminSiteTextEditor({ homeCopy, setHomeCopy, onSave, isSaving }) {
  return (
    <form onSubmit={onSave} className="space-y-5 rounded-2xl border border-line/20 bg-white/65 p-5">
      <div>
        <h2 className="font-serif text-3xl">Textes du site</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/65">
          Petites modifications visibles sur l&apos;accueil, sans toucher au code.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <label key={field.key} className={`space-y-2 ${field.multiline ? "md:col-span-2" : ""}`}>
            <span className="text-xs uppercase tracking-[0.18em] text-ink/50">{field.label}</span>
            {field.multiline ? (
              <textarea
                value={homeCopy[field.key] || ""}
                rows={4}
                onChange={(event) => setHomeCopy((current) => ({ ...current, [field.key]: event.target.value }))}
                className="w-full rounded-xl border border-line/25 bg-paper px-3 py-2 outline-none focus:border-accent"
              />
            ) : (
              <input
                value={homeCopy[field.key] || ""}
                onChange={(event) => setHomeCopy((current) => ({ ...current, [field.key]: event.target.value }))}
                className="w-full rounded-xl border border-line/25 bg-paper px-3 py-2 outline-none focus:border-accent"
              />
            )}
          </label>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-full bg-ink px-5 py-2 text-sm uppercase tracking-[0.15em] text-paper disabled:opacity-60"
        >
          {isSaving ? "Enregistrement..." : "Enregistrer les textes"}
        </button>
        <a href="/" target="_blank" className="rounded-full border border-line/25 px-5 py-2 text-sm hover:border-ink">
          Voir l&apos;accueil
        </a>
      </div>
    </form>
  );
}

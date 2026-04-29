"use client";

import { useState } from "react";

export default function AdminAboutEditor({ aboutCopy, onSave, isSaving }) {
  const [localCopy, setLocalCopy] = useState(aboutCopy);

  const handleChange = (key, value) => {
    setLocalCopy((prev) => ({ ...prev, [key]: value }));
  };

  const handleParagraphChange = (index, value) => {
    const newParagraphs = [...localCopy.storyParagraphs];
    newParagraphs[index] = value;
    handleChange("storyParagraphs", newParagraphs);
  };

  const addParagraph = () => {
    handleChange("storyParagraphs", [...localCopy.storyParagraphs, ""]);
  };

  const removeParagraph = (index) => {
    const newParagraphs = localCopy.storyParagraphs.filter((_, i) => i !== index);
    handleChange("storyParagraphs", newParagraphs);
  };

  const handleValueChange = (index, field, value) => {
    const newValues = [...localCopy.values];
    newValues[index] = { ...newValues[index], [field]: value };
    handleChange("values", newValues);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(localCopy);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 rounded-2xl border border-line/20 bg-white/65 p-6">
      <div className="border-b border-line/10 pb-4">
        <h2 className="font-serif text-3xl">Page À Propos</h2>
        <p className="mt-2 text-sm text-ink/65">Gère ta bio, tes valeurs et ton parcours.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Hero Section */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-ink/40">Introduction</h3>
          <label className="block space-y-2">
            <span className="text-xs font-medium text-ink/50">Titre principal (Headline)</span>
            <input
              type="text"
              value={localCopy.headline}
              onChange={(e) => handleChange("headline", e.target.value)}
              className="w-full rounded-xl border border-line/25 bg-paper px-4 py-2 outline-none focus:border-accent"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs font-medium text-ink/50">Sous-titre</span>
            <textarea
              rows={3}
              value={localCopy.subheadline}
              onChange={(e) => handleChange("subheadline", e.target.value)}
              className="w-full rounded-xl border border-line/25 bg-paper px-4 py-2 outline-none focus:border-accent"
            />
          </label>
        </div>

        {/* Story Section */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-ink/40">Parcours & Histoire</h3>
          <label className="block space-y-2">
            <span className="text-xs font-medium text-ink/50">Titre de la section parcours</span>
            <input
              type="text"
              value={localCopy.storyTitle}
              onChange={(e) => handleChange("storyTitle", e.target.value)}
              className="w-full rounded-xl border border-line/25 bg-paper px-4 py-2 outline-none focus:border-accent"
            />
          </label>
          <div className="space-y-3">
            <span className="text-xs font-medium text-ink/50">Paragraphes de l&apos;histoire</span>
            {localCopy.storyParagraphs.map((para, index) => (
              <div key={index} className="flex gap-2">
                <textarea
                  rows={3}
                  value={para}
                  onChange={(e) => handleParagraphChange(index, e.target.value)}
                  className="w-full rounded-xl border border-line/25 bg-paper px-4 py-2 outline-none focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => removeParagraph(index)}
                  className="h-10 w-10 shrink-0 rounded-full border border-line/20 text-red-500 hover:bg-red-50"
                  title="Supprimer ce paragraphe"
                >
                  &times;
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addParagraph}
              className="rounded-full border border-line/25 px-4 py-2 text-xs font-medium hover:border-ink"
            >
              + Ajouter un paragraphe
            </button>
          </div>
        </div>

        {/* Values Section */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-ink/40">Valeurs (3 items)</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {localCopy.values.map((val, index) => (
              <div key={index} className="space-y-3 rounded-xl border border-line/10 bg-paper/50 p-4">
                <label className="block space-y-1">
                  <span className="text-[10px] font-bold uppercase text-ink/40">Label {index + 1}</span>
                  <input
                    type="text"
                    value={val.label}
                    onChange={(e) => handleValueChange(index, "label", e.target.value)}
                    className="w-full rounded-lg border border-line/20 bg-paper px-3 py-1 text-sm outline-none focus:border-accent"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[10px] font-bold uppercase text-ink/40">Description</span>
                  <textarea
                    rows={4}
                    value={val.text}
                    onChange={(e) => handleValueChange(index, "text", e.target.value)}
                    className="w-full rounded-lg border border-line/20 bg-paper px-3 py-1 text-sm outline-none focus:border-accent"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Manifesto & Conviction */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-ink/40">Manifeste</h3>
          <label className="block space-y-2">
            <span className="text-xs font-medium text-ink/50">Titre manifeste</span>
            <input
              type="text"
              value={localCopy.manifestoTitle}
              onChange={(e) => handleChange("manifestoTitle", e.target.value)}
              className="w-full rounded-xl border border-line/25 bg-paper px-4 py-2 outline-none focus:border-accent"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs font-medium text-ink/50">Texte manifeste</span>
            <textarea
              rows={4}
              value={localCopy.manifestoText}
              onChange={(e) => handleChange("manifestoText", e.target.value)}
              className="w-full rounded-xl border border-line/25 bg-paper px-4 py-2 outline-none focus:border-accent"
            />
          </label>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-ink/40">Conviction (Encadré photo)</h3>
          <label className="block space-y-2">
            <span className="text-xs font-medium text-ink/50">Titre conviction</span>
            <input
              type="text"
              value={localCopy.convictionTitle}
              onChange={(e) => handleChange("convictionTitle", e.target.value)}
              className="w-full rounded-xl border border-line/25 bg-paper px-4 py-2 outline-none focus:border-accent"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs font-medium text-ink/50">Texte conviction</span>
            <textarea
              rows={4}
              value={localCopy.convictionText}
              onChange={(e) => handleChange("convictionText", e.target.value)}
              className="w-full rounded-xl border border-line/25 bg-paper px-4 py-2 outline-none focus:border-accent"
            />
          </label>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-full bg-ink px-8 py-3 text-sm font-bold uppercase tracking-widest text-paper transition-all hover:bg-accent disabled:opacity-50"
        >
          {isSaving ? "Enregistrement..." : "Enregistrer la page À Propos"}
        </button>
      </div>
    </form>
  );
}

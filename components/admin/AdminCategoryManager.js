"use client";

import { useState } from "react";

export default function AdminCategoryManager({ categories, onSave, isSaving }) {
  const [localCategories, setLocalCategories] = useState(categories);
  const [newCategory, setNewCategory] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    if (localCategories.includes(newCategory.trim())) {
      alert("Cette catégorie existe déjà.");
      return;
    }
    setLocalCategories([...localCategories, newCategory.trim()]);
    setNewCategory("");
  };

  const handleRemove = (cat) => {
    if (confirm(`Es-tu sûr de vouloir supprimer la catégorie "${cat}" ? Les photos liées à cette catégorie ne seront pas supprimées mais perdront leur étiquette.`)) {
      setLocalCategories(localCategories.filter((c) => c !== cat));
    }
  };

  const handleRename = (oldName, newName) => {
    if (!newName.trim() || oldName === newName) return;
    setLocalCategories(localCategories.map((c) => (c === oldName ? newName.trim() : c)));
  };

  const handleSubmit = () => {
    onSave(localCategories);
  };

  return (
    <div className="space-y-6 rounded-2xl border border-line/20 bg-white/65 p-6">
      <div className="border-b border-line/10 pb-4">
        <h2 className="font-serif text-3xl">Gestion des Thèmes</h2>
        <p className="mt-2 text-sm text-ink/65">Ajoute ou modifie les catégories de ton portfolio.</p>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          placeholder="Nouveau thème (ex: Portrait, Mariage...)"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="flex-1 rounded-xl border border-line/25 bg-paper px-4 py-2 outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-xl bg-ink px-6 py-2 text-xs font-bold uppercase tracking-widest text-paper hover:bg-accent"
        >
          Ajouter
        </button>
      </form>

      <div className="grid gap-3">
        {localCategories.map((cat) => (
          <div
            key={cat}
            className="flex items-center justify-between rounded-xl border border-line/15 bg-paper/50 p-4 transition hover:bg-white"
          >
            <input
              type="text"
              defaultValue={cat}
              onBlur={(e) => handleRename(cat, e.target.value)}
              className="bg-transparent font-serif text-xl outline-none focus:text-accent"
            />
            <button
              onClick={() => handleRemove(cat)}
              className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700"
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className="rounded-full bg-ink px-8 py-3 text-sm font-bold uppercase tracking-widest text-paper transition-all hover:bg-accent disabled:opacity-50"
        >
          {isSaving ? "Enregistrement..." : "Enregistrer les thèmes"}
        </button>
      </div>
    </div>
  );
}

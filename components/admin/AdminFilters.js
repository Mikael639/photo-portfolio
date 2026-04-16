export default function AdminFilters({
  categoryFilter,
  categoryFilters,
  publishFilter,
  searchQuery,
  setCategoryFilter,
  setPublishFilter,
  setSearchQuery,
}) {
  return (
    <div className="grid gap-4 rounded-2xl border border-line/25 bg-white/55 p-4 md:grid-cols-[minmax(0,1.3fr)_220px_220px]">
      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.2em] text-ink/55">Recherche</span>
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Titre, alt, categorie, role..."
          className="w-full rounded-lg border border-line/25 bg-paper px-3 py-2 outline-none focus:border-accent"
        />
      </label>
      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.2em] text-ink/55">Categorie</span>
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="w-full rounded-lg border border-line/25 bg-paper px-3 py-2 outline-none focus:border-accent"
        >
          {categoryFilters.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.2em] text-ink/55">Etat</span>
        <select
          value={publishFilter}
          onChange={(event) => setPublishFilter(event.target.value)}
          className="w-full rounded-lg border border-line/25 bg-paper px-3 py-2 outline-none focus:border-accent"
        >
          <option value="all">Tous</option>
          <option value="published">Publiees</option>
          <option value="draft">Brouillons</option>
        </select>
      </label>
    </div>
  );
}

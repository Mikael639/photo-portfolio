export default function AdminUploadForm({
  categories,
  fileInputKey,
  isUploading,
  maxBulkUploadCount,
  onSubmit,
  toggleUploadRole,
  roleOptions,
  setUploadForm,
  uploadForm,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-line/25 bg-white/60 p-5">
      <h2 className="font-serif text-2xl">Ajouter une photo</h2>
      <p className="text-sm text-ink/65">
        Prepare la categorie, les roles editoriaux et l&apos;etat de publication avant l&apos;envoi.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm">Titre (optionnel en multi-upload)</span>
          <input
            value={uploadForm.title}
            onChange={(event) => setUploadForm((current) => ({ ...current, title: event.target.value }))}
            className="w-full rounded-lg border border-line/30 bg-paper px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm">Alt (optionnel en multi-upload)</span>
          <input
            value={uploadForm.alt}
            onChange={(event) => setUploadForm((current) => ({ ...current, alt: event.target.value }))}
            className="w-full rounded-lg border border-line/30 bg-paper px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm">Categorie</span>
          <select
            value={uploadForm.category}
            onChange={(event) => setUploadForm((current) => ({ ...current, category: event.target.value }))}
            className="w-full rounded-lg border border-line/30 bg-paper px-3 py-2 outline-none focus:border-accent"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm">Images (max {maxBulkUploadCount})</span>
          <input
            key={fileInputKey}
            type="file"
            multiple
            accept="image/*"
            onChange={(event) =>
              setUploadForm((current) => ({
                ...current,
                files: event.target.files ? Array.from(event.target.files) : [],
              }))
            }
            className="w-full rounded-lg border border-line/30 bg-paper px-3 py-2 outline-none focus:border-accent"
            required
          />
          <p className="text-xs text-ink/60">{uploadForm.files.length} fichier(s) selectionne(s)</p>
        </label>
      </div>

      <div className="flex flex-wrap gap-4">
        {roleOptions.map((role) => (
          <label key={role} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={uploadForm.roles.includes(role)}
              onChange={() => toggleUploadRole(role)}
            />
            {role}
          </label>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={uploadForm.isPublished}
            onChange={(event) => setUploadForm((current) => ({ ...current, isPublished: event.target.checked }))}
          />
          Publiee
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={uploadForm.isPinned}
            onChange={(event) => setUploadForm((current) => ({ ...current, isPinned: event.target.checked }))}
          />
          Epinglee en haut
        </label>
      </div>

      <button
        type="submit"
        disabled={isUploading}
        className="rounded-full bg-ink px-5 py-2 text-sm uppercase tracking-[0.15em] text-paper disabled:opacity-60"
      >
        {isUploading ? "Upload..." : "Ajouter"}
      </button>
    </form>
  );
}

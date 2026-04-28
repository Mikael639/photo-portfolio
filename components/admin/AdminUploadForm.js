import { useEffect, useMemo } from "react";

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
  const previews = useMemo(
    () =>
      uploadForm.files.slice(0, 6).map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [uploadForm.files]
  );

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-line/20 bg-white/65 p-5">
      <div>
        <h2 className="font-serif text-3xl">Ajouter des photos</h2>
        <p className="mt-2 text-sm text-ink/65">
          Choisis le theme, depose les images, puis publie. Les photos sont allegees automatiquement avant l&apos;envoi.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm">Titre</span>
          <input
            value={uploadForm.title}
            onChange={(event) => setUploadForm((current) => ({ ...current, title: event.target.value }))}
            className="w-full rounded-lg border border-line/30 bg-paper px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm">Description courte</span>
          <input
            value={uploadForm.alt}
            onChange={(event) => setUploadForm((current) => ({ ...current, alt: event.target.value }))}
            className="w-full rounded-lg border border-line/30 bg-paper px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm">Theme</span>
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

      {previews.length ? (
        <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-6">
          {previews.map((preview) => (
            <div key={preview.url} className="overflow-hidden rounded-xl border border-line/20 bg-paper">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview.url} alt={preview.name} className="aspect-square w-full object-cover" />
              <p className="truncate px-2 py-1 text-[11px] text-ink/55">{preview.name}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-4">
        {roleOptions.map((role) => (
          <label key={role} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={uploadForm.roles.includes(role)}
              onChange={() => toggleUploadRole(role)}
            />
            {role === "hero"
              ? "Image d'accueil"
              : role === "featured"
                ? "Mise en avant"
                : role === "servicesBackground"
                  ? "Fond de section"
                  : "Image approche"}
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
          Publier directement
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={uploadForm.isPinned}
            onChange={(event) => setUploadForm((current) => ({ ...current, isPinned: event.target.checked }))}
          />
          Mettre en haut
        </label>
      </div>

      <button
        type="submit"
        disabled={isUploading}
        className="rounded-full bg-ink px-5 py-2 text-sm uppercase tracking-[0.15em] text-paper disabled:opacity-60"
      >
        {isUploading ? "Upload..." : "Ajouter"}
      </button>

      {isUploading ? (
        <div className="overflow-hidden rounded-full bg-ink/10">
          <div className="h-1.5 w-1/3 animate-[admin-upload_1.1s_ease-in-out_infinite] rounded-full bg-ink" />
          <style jsx>{`
            @keyframes admin-upload {
              0% {
                transform: translateX(-100%);
              }
              100% {
                transform: translateX(320%);
              }
            }
          `}</style>
        </div>
      ) : null}
    </form>
  );
}

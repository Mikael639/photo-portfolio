"use client";

import { useEffect, useMemo, useState } from "react";

export default function AdminUploadForm({
  categories,
  fileInputKey,
  heroPhotoCount,
  isUploading,
  maxBulkUploadCount,
  maxHeroPhotoCount,
  onSubmit,
  toggleUploadRole,
  roleOptions,
  setUploadForm,
  uploadForm,
}) {
  const [isDragging, setIsDragging] = useState(false);

  const previews = useMemo(
    () =>
      uploadForm.files.map((file) => ({
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

  const handleFiles = (files) => {
    const fileArray = Array.from(files).slice(0, maxBulkUploadCount);
    setUploadForm((current) => ({
      ...current,
      files: fileArray,
    }));
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index) => {
    setUploadForm((current) => ({
      ...current,
      files: current.files.filter((_, i) => i !== index),
    }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-2xl border border-line/20 bg-white/65 p-6 shadow-sm">
      <div className="border-b border-line/10 pb-4">
        <h2 className="font-serif text-3xl">Ajouter des photos</h2>
        <p className="mt-2 text-sm text-ink/65">
          Glisse tes photos ici ou clique pour parcourir tes fichiers.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-ink/40">Titre (optionnel)</span>
            <input
              value={uploadForm.title}
              onChange={(event) => setUploadForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Ex: Shooting Studio #1"
              className="w-full rounded-xl border border-line/25 bg-paper px-4 py-2 outline-none focus:border-accent"
            />
          </label>
          
          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-ink/40">Description / Alt</span>
            <input
              value={uploadForm.alt}
              onChange={(event) => setUploadForm((current) => ({ ...current, alt: event.target.value }))}
              placeholder="Description pour le référencement..."
              className="w-full rounded-xl border border-line/25 bg-paper px-4 py-2 outline-none focus:border-accent"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-ink/40">Thème / Catégorie</span>
            <select
              value={uploadForm.category}
              onChange={(event) => setUploadForm((current) => ({ ...current, category: event.target.value }))}
              className="w-full rounded-xl border border-line/25 bg-paper px-4 py-2 outline-none focus:border-accent"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-ink/40">Sélection des fichiers</span>
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`relative flex min-h-[12rem] flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${
              isDragging ? "border-accent bg-accent/5" : "border-line/20 bg-paper/50"
            }`}
          >
            <input
              key={fileInputKey}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFiles(e.target.files)}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            <div className="pointer-events-none flex flex-col items-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink/30">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className="mt-4 text-sm font-medium text-ink/70">Glisse tes photos ici</p>
              <p className="text-xs text-ink/45">ou clique pour parcourir</p>
            </div>
          </div>
          <p className="text-right text-[10px] uppercase tracking-wider text-ink/40">
            {uploadForm.files.length} / {maxBulkUploadCount} fichiers sélectionnés
          </p>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-ink/40">Prévisualisation</span>
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
            {previews.map((preview, index) => (
              <div key={preview.url} className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-line/20 bg-paper">
                <img src={preview.url} alt={preview.name} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-6 border-t border-line/10 pt-6">
        <div className="flex flex-wrap gap-4">
          {roleOptions.map((role) => {
            const isHeroRole = role === "hero";
            const selectedFilesCount = Math.max(uploadForm.files.length, 1);
            const wouldExceedHeroLimit =
              isHeroRole && !uploadForm.roles.includes(role) && heroPhotoCount + selectedFilesCount > maxHeroPhotoCount;

            return (
              <label
                key={role}
                className={`flex items-center gap-2 text-xs font-medium uppercase tracking-wider ${
                  wouldExceedHeroLimit ? "cursor-not-allowed opacity-30" : "cursor-pointer text-ink/60 hover:text-ink"
                }`}
              >
                <input
                  type="checkbox"
                  className="accent-ink"
                  checked={uploadForm.roles.includes(role)}
                  disabled={wouldExceedHeroLimit}
                  onChange={() => toggleUploadRole(role)}
                />
                {isHeroRole
                  ? `Diaporama (${heroPhotoCount}/${maxHeroPhotoCount})`
                  : role === "featured"
                    ? "Mise en avant"
                    : role === "servicesBackground"
                      ? "Fond"
                      : "Approche"}
              </label>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-ink/60 cursor-pointer hover:text-ink">
            <input
              type="checkbox"
              className="accent-ink"
              checked={uploadForm.isPublished}
              onChange={(event) => setUploadForm((current) => ({ ...current, isPublished: event.target.checked }))}
            />
            Publier
          </label>
          <button
            type="submit"
            disabled={isUploading || uploadForm.files.length === 0}
            className="rounded-full bg-ink px-10 py-3 text-xs font-bold uppercase tracking-widest text-paper transition-all hover:bg-accent disabled:opacity-40"
          >
            {isUploading ? "Upload en cours..." : "Publier maintenant"}
          </button>
        </div>
      </div>

      {isUploading && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-ink/5">
          <div className="h-full w-1/3 animate-[admin-upload_1.2s_infinite_linear] bg-accent" />
        </div>
      )}

      <style jsx>{`
        @keyframes admin-upload {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </form>
  );
}

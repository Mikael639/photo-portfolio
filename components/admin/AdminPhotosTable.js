import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

function roleLabel(role) {
  if (role === "hero") return "Accueil";
  if (role === "featured") return "Mise en avant";
  if (role === "servicesBackground") return "Fond";
  if (role === "approachImage") return "Image approche";
  return role;
}

export default function AdminPhotosTable({
  busyId,
  categories,
  deletePhoto,
  filteredPhotos,
  roleOptions,
  updatePhoto,
  onReorder,
}) {
  const [editingId, setEditingId] = useState("");
  const [draggedId, setDraggedId] = useState("");

  function toggleRole(photo, role) {
    const currentRoles = photo.roles || [];
    const nextRoles = currentRoles.includes(role)
      ? currentRoles.filter((item) => item !== role)
      : [...currentRoles, role];
    updatePhoto(photo.id, { roles: nextRoles });
  }

  function handleDrop(targetId) {
    if (!draggedId || draggedId === targetId) return;

    const nextPhotos = [...filteredPhotos];
    const fromIndex = nextPhotos.findIndex((photo) => photo.id === draggedId);
    const toIndex = nextPhotos.findIndex((photo) => photo.id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;

    const [movedPhoto] = nextPhotos.splice(fromIndex, 1);
    nextPhotos.splice(toIndex, 0, movedPhoto);
    setDraggedId("");
    onReorder(nextPhotos.map((photo, index) => ({ id: photo.id, sortOrder: index + 1 })));
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line/20 bg-white/65 p-4">
        <div>
          <h2 className="font-serif text-3xl">Phototheque</h2>
          <p className="text-sm text-ink/60">{filteredPhotos.length} photo(s) affichee(s)</p>
        </div>
        <a href="/gallery" target="_blank" className="rounded-full border border-line/25 px-4 py-2 text-sm hover:border-ink">
          Voir la galerie
        </a>
      </div>

      {filteredPhotos.length === 0 ? (
        <div className="rounded-2xl border border-line/20 bg-white/55 p-8 text-center text-sm text-ink/60">
          Aucune photo ne correspond aux filtres.
        </div>
      ) : (
        <motion.div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" layout>
          {filteredPhotos.map((photo) => {
            const isEditing = editingId === photo.id;

            return (
              <motion.article
                key={photo.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.985 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                draggable
                onDragStart={() => setDraggedId(photo.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(photo.id)}
                className={`overflow-hidden rounded-2xl border bg-white/75 shadow-[0_18px_70px_rgba(12,10,8,0.04)] transition ${
                  draggedId === photo.id ? "border-accent opacity-70 ring-4 ring-accent/10" : "border-line/20"
                }`}
              >
                <div className="relative aspect-[4/3] bg-ink">
                  <Image
                    src={photo.src}
                    alt={photo.alt || photo.title}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 1280px) 50vw, 33vw"
                  />
                  <div className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white">
                    {photo.category}
                  </div>
                  <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs text-ink">
                      {photo.isPublished ? "Publiee" : "Brouillon"}
                    </span>
                    {photo.isPinned ? (
                      <span className="rounded-full bg-ink px-3 py-1 text-xs text-paper">En haut</span>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-2xl leading-tight">{photo.title || "Photo sans titre"}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-ink/55">{photo.alt || "Description a completer"}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingId(isEditing ? "" : photo.id)}
                      className="shrink-0 rounded-full border border-line/25 px-3 py-1 text-sm hover:border-ink"
                    >
                      {isEditing ? "Fermer" : "Modifier"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <button
                      type="button"
                      disabled={busyId === photo.id}
                      onClick={() => updatePhoto(photo.id, { isPublished: !photo.isPublished })}
                      className="relative overflow-hidden rounded-full border border-line/25 px-3 py-2 hover:border-ink disabled:opacity-50"
                    >
                      {busyId === photo.id ? <span className="absolute inset-0 animate-pulse bg-ink/5" /> : null}
                      {photo.isPublished ? "Masquer" : "Publier"}
                    </button>
                    <button
                      type="button"
                      disabled={busyId === photo.id}
                      onClick={() => updatePhoto(photo.id, { isPinned: !photo.isPinned })}
                      className="rounded-full border border-line/25 px-3 py-2 hover:border-ink disabled:opacity-50"
                    >
                      {photo.isPinned ? "Retirer du haut" : "Mettre en haut"}
                    </button>
                  </div>

                  <AnimatePresence initial={false}>
                  {isEditing ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-3 overflow-hidden rounded-xl border border-line/15 bg-paper/70 p-3"
                    >
                      <label className="block space-y-1">
                        <span className="text-xs uppercase tracking-[0.18em] text-ink/45">Titre</span>
                        <input
                          defaultValue={photo.title}
                          onBlur={(event) => {
                            const nextTitle = event.target.value.trim();
                            if (nextTitle && nextTitle !== photo.title) updatePhoto(photo.id, { title: nextTitle });
                          }}
                          className="w-full rounded-lg border border-line/25 bg-white px-3 py-2"
                        />
                      </label>
                      <label className="block space-y-1">
                        <span className="text-xs uppercase tracking-[0.18em] text-ink/45">Description</span>
                        <textarea
                          defaultValue={photo.alt}
                          rows={3}
                          onBlur={(event) => {
                            const nextAlt = event.target.value.trim();
                            if (nextAlt !== photo.alt) updatePhoto(photo.id, { alt: nextAlt });
                          }}
                          className="w-full rounded-lg border border-line/25 bg-white px-3 py-2"
                        />
                      </label>
                      <label className="block space-y-1">
                        <span className="text-xs uppercase tracking-[0.18em] text-ink/45">Theme</span>
                        <select
                          value={photo.category}
                          onChange={(event) => updatePhoto(photo.id, { category: event.target.value })}
                          className="w-full rounded-lg border border-line/25 bg-white px-3 py-2"
                        >
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </label>

                      <div className="flex flex-wrap gap-2">
                        {roleOptions.map((role) => (
                          <label key={role} className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs">
                            <input
                              type="checkbox"
                              checked={(photo.roles || []).includes(role)}
                              onChange={() => toggleRole(photo, role)}
                            />
                            {roleLabel(role)}
                          </label>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <a
                          href={photo.src}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-line/25 px-3 py-2 text-sm hover:border-ink"
                        >
                          Ouvrir l&apos;image
                        </a>
                        <button
                          type="button"
                          onClick={() => deletePhoto(photo.id)}
                          className="rounded-full border border-red-300 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                          disabled={busyId === photo.id}
                        >
                          Supprimer
                        </button>
                      </div>
                    </motion.div>
                  ) : null}
                  </AnimatePresence>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      )}
    </section>
  );
}

import Image from "next/image";

export default function AdminPhotosTable({ busyId, categories, deletePhoto, filteredPhotos, updatePhoto }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line/25 bg-white/60">
      <div className="flex items-center justify-between border-b border-line/15 px-4 py-3 text-sm text-ink/65">
        <p>{filteredPhotos.length} photo(s) affichee(s)</p>
        <p>Les changements se sauvegardent au blur ou au clic.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full text-left text-sm">
          <thead className="bg-paper/90">
            <tr>
              <th className="px-4 py-3">Apercu</th>
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Categorie</th>
              <th className="px-4 py-3">Roles</th>
              <th className="px-4 py-3">Publiee</th>
              <th className="px-4 py-3">Epinglee</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPhotos.map((photo) => (
              <tr key={photo.id} className="border-t border-line/20">
                <td className="px-4 py-3">
                  <a
                    href={photo.src}
                    target="_blank"
                    rel="noreferrer"
                    className="block h-16 w-16 overflow-hidden rounded-xl border border-line/20 bg-paper"
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt || photo.title}
                      width={64}
                      height={64}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  </a>
                </td>
                <td className="px-4 py-3">
                  <div className="grid gap-2">
                    <input
                      defaultValue={photo.title}
                      onBlur={(event) => {
                        const nextTitle = event.target.value.trim();
                        if (nextTitle && nextTitle !== photo.title) {
                          updatePhoto(photo.id, { title: nextTitle });
                        }
                      }}
                      className="w-full rounded-md border border-line/30 bg-paper px-2 py-1 font-semibold"
                      disabled={busyId === photo.id}
                    />
                    <input
                      defaultValue={photo.alt}
                      onBlur={(event) => {
                        const nextAlt = event.target.value.trim();
                        if (nextAlt !== photo.alt) {
                          updatePhoto(photo.id, { alt: nextAlt });
                        }
                      }}
                      className="w-full rounded-md border border-line/20 bg-paper px-2 py-1 text-xs text-ink/70"
                      disabled={busyId === photo.id}
                    />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={photo.category}
                    onChange={(event) => updatePhoto(photo.id, { category: event.target.value })}
                    className="rounded-md border border-line/30 bg-paper px-2 py-1"
                    disabled={busyId === photo.id}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <input
                    defaultValue={(photo.roles || []).join(",")}
                    onBlur={(event) => {
                      const roles = event.target.value
                        .split(",")
                        .map((value) => value.trim())
                        .filter(Boolean);
                      updatePhoto(photo.id, { roles });
                    }}
                    className="w-44 rounded-md border border-line/30 bg-paper px-2 py-1"
                    disabled={busyId === photo.id}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={photo.isPublished}
                    onChange={(event) => updatePhoto(photo.id, { isPublished: event.target.checked })}
                    disabled={busyId === photo.id}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={photo.isPinned}
                    onChange={(event) => updatePhoto(photo.id, { isPinned: event.target.checked })}
                    disabled={busyId === photo.id}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={photo.src}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-line/25 px-3 py-1 hover:border-ink"
                    >
                      Ouvrir
                    </a>
                    <button
                      type="button"
                      onClick={() => deletePhoto(photo.id)}
                      className="rounded-full border border-red-300 px-3 py-1 text-red-700 hover:bg-red-50"
                      disabled={busyId === photo.id}
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const categories = ["Fashion Week", "Mariage", "Eglise", "Concert", "Autre"];
const categoryFilters = ["Toutes", ...categories];
const roleOptions = ["hero", "featured", "servicesBackground"];
const maxBulkUploadCount = 12;

const initialUploadForm = {
  title: "",
  alt: "",
  category: "Concert",
  roles: [],
  isPublished: true,
  isPinned: false,
  files: [],
};

export default function AdminPhotosPage() {
  const [authForm, setAuthForm] = useState({ username: "admin", password: "" });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [uploadForm, setUploadForm] = useState(initialUploadForm);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [busyId, setBusyId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Toutes");
  const [publishFilter, setPublishFilter] = useState("all");
  const [fileInputKey, setFileInputKey] = useState(0);

  async function loadAdminPhotos() {
    const response = await fetch("/api/admin/photos", { cache: "no-store" });
    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(result.message || "Unable to load photos.");
    }

    setPhotos(result.data || []);
    return result.data || [];
  }

  useEffect(() => {
    async function bootstrap() {
      setIsCheckingAuth(true);

      try {
        const sessionResponse = await fetch("/api/admin/session", { cache: "no-store" });
        const sessionResult = await sessionResponse.json();

        if (!sessionResponse.ok || !sessionResult.ok || !sessionResult.authenticated) {
          setIsAuthenticated(false);
          return;
        }

        await loadAdminPhotos();
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    }

    bootstrap();
  }, []);

  const totalPublished = useMemo(() => photos.filter((photo) => photo.isPublished).length, [photos]);
  const totalDrafts = useMemo(() => photos.filter((photo) => !photo.isPublished).length, [photos]);
  const filteredPhotos = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return photos.filter((photo) => {
      const matchesCategory = categoryFilter === "Toutes" ? true : photo.category === categoryFilter;
      const matchesPublishState =
        publishFilter === "all" ? true : publishFilter === "published" ? photo.isPublished : !photo.isPublished;
      const matchesQuery = !normalizedQuery
        ? true
        : [photo.title, photo.alt, photo.category, ...(photo.roles || [])]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

      return matchesCategory && matchesPublishState && matchesQuery;
    });
  }, [categoryFilter, photos, publishFilter, searchQuery]);

  async function handleLogin(event) {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm),
      });
      const result = await response.json();

      if (!response.ok || !result.ok) {
        setErrorMessage(result.message || "Login failed.");
        return;
      }

      setIsAuthenticated(true);
      await loadAdminPhotos();
      setStatusMessage("Connexion admin reussie.");
    } catch (error) {
      setIsAuthenticated(false);
      setErrorMessage(error?.message || "Impossible de charger les photos admin.");
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsAuthenticated(false);
    setPhotos([]);
    setStatusMessage("Deconnecte.");
  }

  function toggleUploadRole(role) {
    setUploadForm((current) => {
      const hasRole = current.roles.includes(role);
      return {
        ...current,
        roles: hasRole ? current.roles.filter((item) => item !== role) : [...current.roles, role],
      };
    });
  }

  async function handleUpload(event) {
    event.preventDefault();
    if (!uploadForm.files.length) {
      setErrorMessage("Ajoute au moins un fichier image avant de publier.");
      return;
    }

    if (uploadForm.files.length > maxBulkUploadCount) {
      setErrorMessage(`Tu peux envoyer max ${maxBulkUploadCount} photos en meme temps.`);
      return;
    }

    setIsUploading(true);
    setErrorMessage("");
    setStatusMessage("");

    const formData = new FormData();
    uploadForm.files.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("title", uploadForm.title);
    formData.append("alt", uploadForm.alt);
    formData.append("category", uploadForm.category);
    formData.append("roles", JSON.stringify(uploadForm.roles));
    formData.append("isPublished", String(uploadForm.isPublished));
    formData.append("isPinned", String(uploadForm.isPinned));

    const response = await fetch("/api/admin/photos", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();

    if (!response.ok || !result.ok) {
      setErrorMessage(result.message || "Upload failed.");
      setIsUploading(false);
      return;
    }

    setUploadForm(initialUploadForm);
    setFileInputKey((current) => current + 1);
    await loadAdminPhotos();
    setStatusMessage(`${result.total || uploadForm.files.length} photo(s) ajoutee(s).`);
    setIsUploading(false);
  }

  async function updatePhoto(id, patch) {
    setBusyId(id);
    setErrorMessage("");
    const response = await fetch("/api/admin/photos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    const result = await response.json();
    setBusyId("");

    if (!response.ok || !result.ok) {
      setErrorMessage(result.message || "Update failed.");
      return;
    }

    await loadAdminPhotos();
    setStatusMessage("Photo mise a jour.");
  }

  async function deletePhoto(id) {
    const confirmed = window.confirm("Supprimer cette photo ?");
    if (!confirmed) return;

    setBusyId(id);
    setErrorMessage("");
    const response = await fetch(`/api/admin/photos?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const result = await response.json();
    setBusyId("");

    if (!response.ok || !result.ok) {
      setErrorMessage(result.message || "Delete failed.");
      return;
    }

    await loadAdminPhotos();
    setStatusMessage("Photo supprimee.");
  }

  if (isCheckingAuth) {
    return (
      <div className="mx-auto max-w-4xl px-4 pt-10 md:px-8">
        <p className="text-sm text-ink/70">Chargement de l&apos;espace admin...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-xl px-4 pt-10 md:px-8">
        <h1 className="font-serif text-4xl">Admin Photos</h1>
        <p className="mt-2 text-sm text-ink/70">Connecte-toi pour gerer les publications.</p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4 rounded-2xl border border-line/25 bg-white/60 p-5">
          <label className="block space-y-2">
            <span className="text-sm">Username</span>
            <input
              value={authForm.username}
              onChange={(event) => setAuthForm((current) => ({ ...current, username: event.target.value }))}
              autoComplete="username"
              className="w-full rounded-lg border border-line/30 bg-paper px-3 py-2 outline-none focus:border-accent"
              required
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm">Password</span>
            <input
              type="password"
              value={authForm.password}
              onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))}
              autoComplete="current-password"
              className="w-full rounded-lg border border-line/30 bg-paper px-3 py-2 outline-none focus:border-accent"
              required
            />
          </label>
          <button type="submit" className="rounded-full bg-ink px-5 py-2 text-sm uppercase tracking-[0.15em] text-paper">
            Se connecter
          </button>
          {errorMessage ? <p className="text-sm text-red-700">{errorMessage}</p> : null}
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 pt-10 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">Admin Photos</h1>
          <p className="text-sm text-ink/70">
            Total: {photos.length} | Publiees: {totalPublished} | Brouillons: {totalDrafts}
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full border border-line/40 px-4 py-2 text-sm hover:border-ink"
        >
          Deconnexion
        </button>
      </div>

      <form onSubmit={handleUpload} className="space-y-4 rounded-2xl border border-line/25 bg-white/60 p-5">
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
            <span className="text-sm">Images (max 12)</span>
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

      {statusMessage ? <p className="text-sm text-emerald-700">{statusMessage}</p> : null}
      {errorMessage ? <p className="text-sm text-red-700">{errorMessage}</p> : null}

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
    </div>
  );
}

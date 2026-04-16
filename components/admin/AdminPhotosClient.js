"use client";

import { startTransition, useMemo, useState } from "react";
import {
  deleteAdminPhotoAction,
  loginAdminAction,
  logoutAdminAction,
  updateAdminPhotoAction,
  uploadAdminPhotosAction,
} from "../../app/admin/photos/actions";
import AdminFeedback from "./AdminFeedback";
import AdminFilters from "./AdminFilters";
import AdminLoginForm from "./AdminLoginForm";
import AdminPhotosTable from "./AdminPhotosTable";
import AdminUploadForm from "./AdminUploadForm";
import { categories, categoryFilters, initialUploadForm, maxBulkUploadCount, roleOptions } from "./constants";

export default function AdminPhotosClient({ initialAuthenticated = false, initialPhotos = [] }) {
  const [authForm, setAuthForm] = useState({ username: "admin", password: "" });
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthenticated);
  const [photos, setPhotos] = useState(initialPhotos);
  const [uploadForm, setUploadForm] = useState(initialUploadForm);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [busyId, setBusyId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Toutes");
  const [publishFilter, setPublishFilter] = useState("all");
  const [fileInputKey, setFileInputKey] = useState(0);

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

  function updateAuthField(field, value) {
    setAuthForm((current) => ({ ...current, [field]: value }));
  }

  function replacePhotoLocally(id, patch) {
    setPhotos((current) =>
      current.map((photo) => {
        if (photo.id !== id) return photo;
        return { ...photo, ...patch };
      })
    );
  }

  async function handleLogin(event) {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("");

    try {
      const result = await loginAdminAction(authForm);

      if (!result.ok) {
        setErrorMessage(result.message || "Login failed.");
        return;
      }

      setIsAuthenticated(true);
      setPhotos(result.data || []);
      setStatusMessage(result.message || "Connexion admin reussie.");
    } catch (error) {
      setIsAuthenticated(false);
      setErrorMessage(error?.message || "Impossible de charger les photos admin.");
    }
  }

  async function handleLogout() {
    const result = await logoutAdminAction();
    setIsAuthenticated(false);
    setPhotos([]);
    setErrorMessage("");
    setStatusMessage(result.message || "Deconnecte.");
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

    const result = await uploadAdminPhotosAction(formData);

    if (!result.ok) {
      setErrorMessage(result.message || "Upload failed.");
      setIsUploading(false);
      return;
    }

    setUploadForm(initialUploadForm);
    setFileInputKey((current) => current + 1);
    setPhotos(result.data || []);
    setStatusMessage(result.message || `${uploadForm.files.length} photo(s) ajoutee(s).`);
    setIsUploading(false);
  }

  async function updatePhoto(id, patch) {
    const previousPhoto = photos.find((photo) => photo.id === id);
    if (!previousPhoto) return;

    setBusyId(id);
    setErrorMessage("");
    startTransition(() => {
      replacePhotoLocally(id, patch);
    });
    const result = await updateAdminPhotoAction({ id, ...patch });
    setBusyId("");

    if (!result.ok) {
      setPhotos((current) =>
        current.map((photo) => {
          if (photo.id !== id) return photo;
          return previousPhoto;
        })
      );
      setErrorMessage(result.message || "Update failed.");
      return;
    }

    setPhotos(result.data || []);
    setErrorMessage("");
    setStatusMessage(result.message || "Photo mise a jour.");
  }

  async function deletePhoto(id) {
    const confirmed = window.confirm("Supprimer cette photo ?");
    if (!confirmed) return;

    const previousPhotos = photos;
    setBusyId(id);
    setErrorMessage("");
    startTransition(() => {
      setPhotos((current) => current.filter((photo) => photo.id !== id));
    });
    const result = await deleteAdminPhotoAction(id);
    setBusyId("");

    if (!result.ok) {
      setPhotos(previousPhotos);
      setErrorMessage(result.message || "Delete failed.");
      return;
    }

    setPhotos(result.data || []);
    setErrorMessage("");
    setStatusMessage(result.message || "Photo supprimee.");
  }

  if (!isAuthenticated) {
    return <AdminLoginForm authForm={authForm} errorMessage={errorMessage} onSubmit={handleLogin} onChange={updateAuthField} />;
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

      <AdminUploadForm
        categories={categories}
        fileInputKey={fileInputKey}
        isUploading={isUploading}
        maxBulkUploadCount={maxBulkUploadCount}
        onSubmit={handleUpload}
        toggleUploadRole={toggleUploadRole}
        roleOptions={roleOptions}
        setUploadForm={setUploadForm}
        uploadForm={uploadForm}
      />

      <AdminFeedback errorMessage={errorMessage} statusMessage={statusMessage} />

      <AdminFilters
        categoryFilter={categoryFilter}
        categoryFilters={categoryFilters}
        publishFilter={publishFilter}
        searchQuery={searchQuery}
        setCategoryFilter={setCategoryFilter}
        setPublishFilter={setPublishFilter}
        setSearchQuery={setSearchQuery}
      />

      <AdminPhotosTable
        busyId={busyId}
        categories={categories}
        deletePhoto={deletePhoto}
        filteredPhotos={filteredPhotos}
        updatePhoto={updatePhoto}
      />
    </div>
  );
}

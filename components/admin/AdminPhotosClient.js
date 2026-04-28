"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import {
  deleteAdminPhotoAction,
  loginAdminAction,
  logoutAdminAction,
  reorderAdminPhotosAction,
  updateAdminPhotoAction,
  updateContactStatusAction,
  updateHomeCopyAction,
  uploadAdminPhotosAction,
} from "../../app/admin/photos/actions";
import AdminDashboard from "./AdminDashboard";
import AdminFeedback from "./AdminFeedback";
import AdminFilters from "./AdminFilters";
import AdminLoginForm from "./AdminLoginForm";
import AdminMessagesPanel from "./AdminMessagesPanel";
import AdminPhotosTable from "./AdminPhotosTable";
import AdminSiteTextEditor from "./AdminSiteTextEditor";
import AdminThemeGuide from "./AdminThemeGuide";
import AdminUploadForm from "./AdminUploadForm";
import { categories, categoryFilters, initialUploadForm, maxBulkUploadCount, roleOptions } from "./constants";
import { defaultHomeCopy } from "../../lib/siteSettings";
import { compressImageFiles, formatFileSize } from "../../lib/imageCompression";

const tabs = [
  { id: "photos", label: "Photos" },
  { id: "upload", label: "Ajouter" },
  { id: "messages", label: "Messages" },
  { id: "texts", label: "Textes" },
  { id: "themes", label: "Aide" },
];

export default function AdminPhotosClient({
  initialAuthenticated = false,
  initialPhotos = [],
  initialMessages = [],
  initialHomeCopy = {},
}) {
  const [authForm, setAuthForm] = useState({ username: "admin", password: "" });
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthenticated);
  const [photos, setPhotos] = useState(initialPhotos);
  const [messages, setMessages] = useState(initialMessages);
  const [homeCopy, setHomeCopy] = useState({ ...defaultHomeCopy, ...(initialHomeCopy || {}) });
  const [uploadForm, setUploadForm] = useState(initialUploadForm);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingText, setIsSavingText] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [busyId, setBusyId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Toutes");
  const [publishFilter, setPublishFilter] = useState("all");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [activeTab, setActiveTab] = useState("photos");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 520);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    setPhotos((current) => current.map((photo) => (photo.id === id ? { ...photo, ...patch } : photo)));
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
      setPhotos(result.data?.photos || result.data || []);
      setMessages(result.data?.messages || []);
      setStatusMessage(result.message || "Connexion admin reussie.");
    } catch (error) {
      setIsAuthenticated(false);
      setErrorMessage(error?.message || "Impossible de charger l'admin.");
    }
  }

  async function handleLogout() {
    const result = await logoutAdminAction();
    setIsAuthenticated(false);
    setPhotos([]);
    setMessages([]);
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
    setStatusMessage("Preparation et allegement des images...");

    let uploadFiles = uploadForm.files;
    try {
      const compression = await compressImageFiles(uploadForm.files);
      uploadFiles = compression.files;

      if (compression.compressedCount > 0) {
        setStatusMessage(
          `${compression.compressedCount} image(s) allegee(s) : ${formatFileSize(compression.originalSize)} -> ${formatFileSize(
            compression.compressedSize
          )}. Upload en cours...`
        );
      } else {
        setStatusMessage("Images deja legeres. Upload en cours...");
      }
    } catch (error) {
      setIsUploading(false);
      setErrorMessage(error?.message || "Impossible d'alleger les images avant l'upload.");
      return;
    }

    const formData = new FormData();
    uploadFiles.forEach((file) => {
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
    setActiveTab("photos");
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
      setPhotos((current) => current.map((photo) => (photo.id === id ? previousPhoto : photo)));
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

  async function reorderPhotos(items) {
    const previousPhotos = photos;
    const order = new Map(items.map((item) => [item.id, item.sortOrder]));
    setPhotos((current) =>
      [...current]
        .map((photo) => ({ ...photo, sortOrder: order.get(photo.id) || photo.sortOrder }))
        .sort((left, right) => (left.sortOrder || 0) - (right.sortOrder || 0))
    );

    const result = await reorderAdminPhotosAction(items);
    if (!result.ok) {
      setPhotos(previousPhotos);
      setErrorMessage(result.message || "Impossible d'enregistrer l'ordre.");
      return;
    }

    setPhotos(result.data || []);
    setStatusMessage(result.message || "Ordre enregistre.");
  }

  async function updateMessageStatus(id, status) {
    const previousMessages = messages;
    setMessages((current) => current.map((message) => (message.id === id ? { ...message, status } : message)));

    const result = await updateContactStatusAction(id, status);
    if (!result.ok) {
      setMessages(previousMessages);
      setErrorMessage(result.message || "Impossible de mettre a jour le message.");
      return;
    }

    setMessages(result.data || []);
    setStatusMessage(result.message || "Message mis a jour.");
  }

  async function saveHomeCopy(event) {
    event.preventDefault();
    setIsSavingText(true);
    setErrorMessage("");

    const result = await updateHomeCopyAction(homeCopy);
    setIsSavingText(false);

    if (!result.ok) {
      setErrorMessage(result.message || "Impossible d'enregistrer les textes.");
      return;
    }

    setHomeCopy(result.data || homeCopy);
    setStatusMessage(result.message || "Textes enregistres.");
  }

  if (!isAuthenticated) {
    return (
      <AdminLoginForm authForm={authForm} errorMessage={errorMessage} onSubmit={handleLogin} onChange={updateAuthField} />
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 pb-16 pt-10 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-ink/45">Espace photographe</p>
          <h1 className="font-serif text-5xl leading-tight">Admin Jerrypicsart</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href="/gallery" target="_blank" className="rounded-full border border-line/30 px-4 py-2 text-sm hover:border-ink">
            Voir le site
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-line/30 px-4 py-2 text-sm hover:border-ink"
          >
            Deconnexion
          </button>
        </div>
      </div>

      <AdminDashboard photos={photos} messages={messages} categories={categories} onSelectTab={setActiveTab} />
      <AdminFeedback errorMessage={errorMessage} statusMessage={statusMessage} />

      <nav className="no-scrollbar flex gap-2 overflow-x-auto rounded-2xl border border-line/20 bg-white/55 p-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${
              activeTab === tab.id ? "bg-ink text-paper" : "text-ink/65 hover:bg-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "photos" ? (
        <>
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
            onReorder={reorderPhotos}
            roleOptions={roleOptions}
            updatePhoto={updatePhoto}
          />
        </>
      ) : null}

      {activeTab === "upload" ? (
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
      ) : null}

      {activeTab === "messages" ? (
        <AdminMessagesPanel messages={messages} onUpdateStatus={updateMessageStatus} />
      ) : null}

      {activeTab === "texts" ? (
        <AdminSiteTextEditor
          homeCopy={homeCopy}
          isSaving={isSavingText}
          onSave={saveHomeCopy}
          setHomeCopy={setHomeCopy}
        />
      ) : null}

      {activeTab === "themes" ? <AdminThemeGuide categories={categories} /> : null}

      <button
        type="button"
        aria-label="Remonter en haut de la page admin"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-line/15 bg-paper/90 text-ink shadow-[0_18px_52px_rgba(12,10,8,0.18)] backdrop-blur-xl transition duration-300 hover:bg-ink hover:text-paper md:bottom-8 md:right-8 ${
          showScrollTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 19V5" />
          <path d="m5 12 7-7 7 7" />
        </svg>
      </button>
    </div>
  );
}

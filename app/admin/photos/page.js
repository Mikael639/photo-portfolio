import { cookies } from "next/headers";
import AdminPhotosClient from "../../../components/admin/AdminPhotosClient";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "../../../lib/adminAuth";
import { listContactMessages } from "../../../lib/contactStore";
import { getAdminPhotos } from "../../../lib/photoRepository";
import { getHomeCopy } from "../../../lib/siteSettings";

export default async function AdminPhotosPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value || "";
  const isAuthenticated = verifyAdminSessionToken(token);
  let initialPhotos = [];
  let initialMessages = [];
  let initialHomeCopy = null;

  if (isAuthenticated) {
    try {
      const [photos, messages, homeCopy] = await Promise.all([getAdminPhotos(), listContactMessages(), getHomeCopy()]);
      initialPhotos = photos;
      initialMessages = messages;
      initialHomeCopy = homeCopy;
    } catch {
      initialPhotos = [];
      initialMessages = [];
    }
  }

  return (
    <AdminPhotosClient
      initialAuthenticated={isAuthenticated}
      initialPhotos={initialPhotos}
      initialMessages={initialMessages}
      initialHomeCopy={initialHomeCopy}
    />
  );
}

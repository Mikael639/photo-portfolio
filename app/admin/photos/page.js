import { cookies } from "next/headers";
import AdminPhotosClient from "../../../components/admin/AdminPhotosClient";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "../../../lib/adminAuth";
import { getAdminPhotos } from "../../../lib/photoRepository";

export default async function AdminPhotosPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value || "";
  const isAuthenticated = verifyAdminSessionToken(token);
  let initialPhotos = [];

  if (isAuthenticated) {
    try {
      initialPhotos = await getAdminPhotos();
    } catch {
      initialPhotos = [];
    }
  }

  return <AdminPhotosClient initialAuthenticated={isAuthenticated} initialPhotos={initialPhotos} />;
}

export const categories = ["Fashion Week", "Mariage", "Eglise", "Concert", "Autre"];
export const categoryFilters = ["Toutes", ...categories];
export const roleOptions = ["hero", "featured", "servicesBackground"];
export const maxBulkUploadCount = 12;

export const initialUploadForm = {
  title: "",
  alt: "",
  category: "Concert",
  roles: [],
  isPublished: true,
  isPinned: false,
  files: [],
};

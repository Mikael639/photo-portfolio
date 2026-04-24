export const categories = ["Fashion Week", "Mariage", "Shooting photo"];
export const categoryFilters = ["Toutes", ...categories];
export const roleOptions = ["hero", "featured", "servicesBackground"];
export const maxBulkUploadCount = 12;

export const initialUploadForm = {
  title: "",
  alt: "",
  category: "Fashion Week",
  roles: [],
  isPublished: true,
  isPinned: false,
  files: [],
};

import { defaultPortfolioCategory, portfolioCategories } from "../../lib/categories";

export const categories = portfolioCategories;
export const categoryFilters = ["Toutes", ...categories];
export const roleOptions = ["hero", "featured", "servicesBackground", "approachImage"];
export const maxBulkUploadCount = 12;

export const initialUploadForm = {
  title: "",
  alt: "",
  category: defaultPortfolioCategory,
  roles: [],
  isPublished: true,
  isPinned: false,
  files: [],
};

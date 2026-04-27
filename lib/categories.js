export const portfolioCategories = [
  "Events",
  "Fashion Week & Celebrities",
  "Studio",
  "Fashion Wedding",
];

export const defaultPortfolioCategory = portfolioCategories[0];

const legacyCategoryMap = {
  Concert: "Events",
  Eglise: "Events",
  "Fashion Week": "Fashion Week & Celebrities",
  Celebrities: "Fashion Week & Celebrities",
  Mariage: "Fashion Wedding",
  Wedding: "Fashion Wedding",
  "Shooting photo": "Studio",
};

export function normalizePortfolioCategory(category) {
  if (!category || typeof category !== "string") return defaultPortfolioCategory;

  const trimmedCategory = category.trim();
  return legacyCategoryMap[trimmedCategory] || trimmedCategory;
}

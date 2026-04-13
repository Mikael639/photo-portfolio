import { sitePages, toAbsoluteUrl } from "../lib/siteConfig";

export default function sitemap() {
  const currentDate = new Date();

  return sitePages.map((page) => ({
    url: toAbsoluteUrl(page.href),
    lastModified: currentDate,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}

import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://safardz.com";

  // Static URLs
  const staticUrls = [
    "",
    "/experiences",
    "/destinations",
    "/about",
    "/contact",
    "/faq",
    "/privacy",
    "/terms",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : route === "/experiences" ? 0.9 : 0.7,
  }));

  // Dynamic items (experiences & destinations slug lists could be fetched here in a real database deployment)
  // For placeholder/pre-launch, we list static primary pages
  return [...staticUrls];
}

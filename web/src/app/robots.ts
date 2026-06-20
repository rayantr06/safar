import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/partner/", "/client/", "/login", "/auth/"],
      },
    ],
    sitemap: "https://safardz.com/sitemap.xml",
  };
}

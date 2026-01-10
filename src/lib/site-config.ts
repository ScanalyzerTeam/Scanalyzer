import { env } from "@/env.mjs";

export const siteConfig = {
  title: "Scanalyzer",
  description:
    "AI-powered warehouse management system with scanning, tracking, and intelligent analytics.",
  keywords: ["Warehouse", "Scanner", "AI", "Inventory", "Management"],
  url: env.APP_URL,
  googleSiteVerificationId: env.GOOGLE_SITE_VERIFICATION_ID || "",
};

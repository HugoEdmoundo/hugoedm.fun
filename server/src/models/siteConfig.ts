import { defineModel } from "./base.js";

export interface SiteConfig {
  _id: string;
  site_name: string;
  description: string;
  github_username: string;
  favicon_url: string;
  cv_url: string;
  hero_name: string;
  hero_headline: string;
  hero_photo_url: string;
  about_text: string;
  admin_code: string;
  marketplace_cta_text: string;
  marketplace_cta_url: string;
  bg_day_url: string;
  bg_night_url: string;
  updated_at: Date;
}

export const SiteConfigModel = defineModel<SiteConfig>("SiteConfig", "site_config", {
  site_name: { type: String, default: "My Portfolio" },
  description: { type: String, default: "" },
  github_username: { type: String, default: "" },
  favicon_url: { type: String, default: "" },
  cv_url: { type: String, default: "" },
  hero_name: { type: String, default: "Your Name" },
  hero_headline: { type: String, default: "Full Stack Developer" },
  hero_photo_url: { type: String, default: "" },
  about_text: { type: String, default: "" },
  admin_code: { type: String, required: true, default: "?hl%3Did<26" },
  marketplace_cta_text: { type: String, default: "Visit Marketplace" },
  marketplace_cta_url: { type: String, default: "" },
  bg_day_url: { type: String, default: "" },
  bg_night_url: { type: String, default: "" },
  updated_at: { type: Date, default: Date.now },
}, [{ updated_at: -1 }]);

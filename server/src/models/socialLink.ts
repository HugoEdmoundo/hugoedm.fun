import { defineModel } from "./base.js";

export interface SocialLink {
  _id: string;
  platform: string;
  url: string;
  icon: string;
  sort_order: number;
  created_at: Date;
}

export const SocialLinkModel = defineModel<SocialLink>("SocialLink", "social_links", {
  platform: { type: String, required: true },
  url: { type: String, default: "" },
  icon: { type: String, default: "Link" },
  sort_order: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
}, [{ sort_order: 1, created_at: 1 }, { platform: 1 }]);

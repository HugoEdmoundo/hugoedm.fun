import { defineModel } from "./base.js";

export interface GalleryItem {
  _id: string;
  image_url: string;
  caption: string;
  sort_order: number;
  created_at: Date;
}

export const GalleryModel = defineModel<GalleryItem>("Gallery", "gallery", {
  image_url: { type: String, required: true },
  caption: { type: String, default: "" },
  sort_order: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
}, [{ sort_order: 1, created_at: 1 }]);

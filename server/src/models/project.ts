import { defineModel } from "./base.js";

export interface Project {
  _id: string;
  title: string;
  description: string;
  tech_stack: string[];
  live_demo_url: string;
  github_url: string;
  screenshot_url: string;
  featured: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export const ProjectModel = defineModel<Project>("Project", "projects", {
  title: { type: String, required: true },
  description: { type: String, default: "" },
  tech_stack: { type: [String], default: [] },
  live_demo_url: { type: String, default: "" },
  github_url: { type: String, default: "" },
  screenshot_url: { type: String, default: "" },
  featured: { type: Boolean, default: false },
  sort_order: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
}, [{ sort_order: 1, created_at: 1 }, { featured: 1, sort_order: 1 }]);

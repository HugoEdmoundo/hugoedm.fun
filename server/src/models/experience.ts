import { defineModel } from "./base.js";

export interface Experience {
  _id: string;
  company: string;
  role: string;
  duration: string;
  description: string;
  logo_url: string;
  employment_type: string;
  location: string;
  start_date: string;
  end_date: string;
  responsibilities: string;
  achievements: string;
  technologies: string[];
  reference_contact: string;
  attachment_url: string;
  status: string;
  is_current: boolean;
  sort_order: number;
  created_at: Date;
}

export const ExperienceModel = defineModel<Experience>("Experience", "experience", {
  company: { type: String, required: true },
  role: { type: String, default: "" },
  duration: { type: String, default: "" },
  description: { type: String, default: "" },
  logo_url: { type: String, default: "" },
  employment_type: { type: String, default: "" },
  location: { type: String, default: "" },
  start_date: { type: String, default: "" },
  end_date: { type: String, default: "" },
  responsibilities: { type: String, default: "" },
  achievements: { type: String, default: "" },
  technologies: { type: [String], default: [] },
  reference_contact: { type: String, default: "" },
  attachment_url: { type: String, default: "" },
  status: { type: String, default: "" },
  is_current: { type: Boolean, default: false },
  sort_order: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
}, [{ sort_order: 1, created_at: 1 }, { company: 1 }, { is_current: -1 }]);

import { defineModel } from "./base.js";

export interface Education {
  _id: string;
  institution: string;
  education_type: string;
  program_name: string;
  provider: string;
  duration: string;
  degree: string;
  field_of_study: string;
  year: string;
  start_date: string;
  end_date: string;
  expected_graduation: string;
  location: string;
  logo_url: string;
  certificate_url: string;
  credential_id: string;
  activities: string;
  topics: string;
  achievements: string;
  projects_url: string;
  status: string;
  sort_order: number;
  created_at: Date;
}

export const EducationModel = defineModel<Education>("Education", "education", {
  institution: { type: String, required: true },
  education_type: { type: String, default: "Formal" },
  program_name: { type: String, default: "" },
  provider: { type: String, default: "" },
  duration: { type: String, default: "" },
  degree: { type: String, default: "" },
  field_of_study: { type: String, default: "" },
  year: { type: String, default: "" },
  start_date: { type: String, default: "" },
  end_date: { type: String, default: "" },
  expected_graduation: { type: String, default: "" },
  location: { type: String, default: "" },
  logo_url: { type: String, default: "" },
  certificate_url: { type: String, default: "" },
  credential_id: { type: String, default: "" },
  activities: { type: String, default: "" },
  topics: { type: String, default: "" },
  achievements: { type: String, default: "" },
  projects_url: { type: String, default: "" },
  status: { type: String, default: "" },
  sort_order: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
}, [{ sort_order: 1, created_at: 1 }, { institution: 1 }]);

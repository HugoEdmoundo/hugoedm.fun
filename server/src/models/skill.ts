import { defineModel } from "./base.js";

export interface Skill {
  _id: string;
  name: string;
  category: string;
  icon: string;
  sort_order: number;
  created_at: Date;
}

export const SkillModel = defineModel<Skill>("Skill", "skills", {
  name: { type: String, required: true },
  category: { type: String, default: "Other" },
  icon: { type: String, default: "" },
  sort_order: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
}, [{ category: 1, sort_order: 1 }, { sort_order: 1, created_at: 1 }]);

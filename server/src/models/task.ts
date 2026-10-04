import { defineModel } from "./base.js";

export interface Task {
  _id: string;
  title: string;
  description: string;
  url: string;
  github_repo: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export const TaskModel = defineModel<Task>("Task", "tasks", {
  title: { type: String, required: true },
  description: { type: String, default: "" },
  url: { type: String, default: "" },
  github_repo: { type: String, default: "" },
  status: { type: String, default: "pending" },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
}, [{ status: 1, created_at: -1 }, { created_at: -1 }]);

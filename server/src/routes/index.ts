import { Router } from "express";
import { authRouter } from "./auth.js";
import { createCrudRouter } from "./crud.js";
import { siteConfigRouter } from "./siteConfig.js";
import { uploadRouter } from "./upload.js";
import {
  EducationModel,
  ExperienceModel,
  GalleryModel,
  ProjectModel,
  SkillModel,
  SocialLinkModel,
  TaskModel,
} from "../models/index.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ ok: true, service: "hugoedm-api" });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/site-config", siteConfigRouter);
apiRouter.use("/upload", uploadRouter);

apiRouter.use("/projects", createCrudRouter({ model: ProjectModel, touch: ["updated_at"] }));
apiRouter.use("/skills", createCrudRouter({ model: SkillModel }));
apiRouter.use("/gallery", createCrudRouter({ model: GalleryModel }));
apiRouter.use("/tasks", createCrudRouter({ model: TaskModel, sort: { created_at: -1 }, touch: ["updated_at"] }));
apiRouter.use("/education", createCrudRouter({ model: EducationModel }));
apiRouter.use("/experience", createCrudRouter({ model: ExperienceModel }));
apiRouter.use("/social-links", createCrudRouter({ model: SocialLinkModel }));

import { Router } from "express";
import { protect } from "../../middlewares/authMiddleware.js";
import {
  listProjects,
  createProject,
  updateProject,
  deleteProject,
} from "./project.controller.js";
import { ApiError } from "../../utils/apiError.js";

const router = Router();

function validateProject(req, _res, next) {
  const { title, description } = req.body;
  if (!title || !description) {
    throw new ApiError(400, "title and description are required");
  }
  next();
}

// Public
router.get("/:portfolioSlug", listProjects);

// Protected
router.post("/", protect, validateProject, createProject);
router.patch("/:id", protect, updateProject);
router.delete("/:id", protect, deleteProject);

export default router;

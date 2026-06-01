import { asyncHandler } from "../../utils/asyncHandler.js";
import { projectService } from "./project.service.js";

export const listProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.listBySlug(req.params.portfolioSlug);
  res.status(200).json({ success: true, projects });
});

export const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.create(req.user.id, req.body);
  res.status(201).json({ success: true, project });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await projectService.update(req.params.id, req.user.id, req.body);
  res.status(200).json({ success: true, project });
});

export const deleteProject = asyncHandler(async (req, res) => {
  await projectService.remove(req.params.id, req.user.id);
  res.status(200).json({ success: true, message: "Project deleted" });
});

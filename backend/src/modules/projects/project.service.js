import { Project } from "./project.model.js";
import { Portfolio } from "../portfolios/portfolio.model.js";
import { ApiError } from "../../utils/apiError.js";

export const projectService = {
  // GET /api/projects/:portfolioSlug — all projects for a portfolio
  async listBySlug(portfolioSlug) {
    const portfolio = await Portfolio.findOne({ portfolioSlug });
    if (!portfolio) throw new ApiError(404, "Portfolio not found");

    return Project.find({ portfolioId: portfolio._id })
      .sort({ featured: -1, createdAt: -1 })
      .select("-__v");
  },

  // POST /api/projects — create project (must own a portfolio first)
  async create(userId, data) {
    const portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      throw new ApiError(400, "You must have a portfolio before adding projects");
    }

    return Project.create({
      ...data,
      userId,
      portfolioId: portfolio._id,
    });
  },

  // PATCH /api/projects/:id — update own project
  async update(projectId, userId, updates) {
    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, "Project not found");
    if (project.userId.toString() !== userId) {
      throw new ApiError(403, "You do not own this project");
    }

    // Strip protected fields
    const { userId: _u, portfolioId: _p, _id: _i, createdAt: _c, ...safeUpdates } = updates;

    const updated = await Project.findByIdAndUpdate(
      projectId,
      { $set: safeUpdates },
      { new: true, runValidators: true }
    );
    return updated;
  },

  // DELETE /api/projects/:id — delete own project
  async remove(projectId, userId) {
    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, "Project not found");
    if (project.userId.toString() !== userId) {
      throw new ApiError(403, "You do not own this project");
    }

    await Project.findByIdAndDelete(projectId);
    return project;
  },
};

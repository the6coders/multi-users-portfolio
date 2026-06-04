import { Router } from "express";
import { protect } from "../../middlewares/authMiddleware.js";
import {
  listPortfolios,
  getPortfolioBySlug,
  getPortfolioFilters,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
} from "./portfolio.controller.js";
import { ApiError } from "../../utils/apiError.js";

const router = Router();

// Validate create body
function validateCreate(req, _res, next) {
  if (!req.body || typeof req.body !== "object") {
    throw new ApiError(400, "Request body is required");
  }
  next();
}

// Public
router.get("/", listPortfolios);
router.get("/meta", getPortfolioFilters); // MUST be before /:slug
router.get("/:slug", getPortfolioBySlug);

// Protected — authenticated users only
router.post("/", protect, validateCreate, createPortfolio);
router.patch("/", protect, updatePortfolio);
router.delete("/", protect, deletePortfolio);

export default router;

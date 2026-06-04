import { Router } from "express";
import { protect } from "../../middlewares/authMiddleware.js";
import {
  trackPortfolioView,
  trackResumeDownload,
  trackProjectClick,
  trackCertificateView,
  getAnalyticsSummary,
} from "./analytics.controller.js";

const router = Router();

// ── Public tracking endpoints (fire-and-forget from client) ──────
router.post("/portfolio-view/:slug",         trackPortfolioView);
router.post("/resume-download/:slug",        trackResumeDownload);
router.post("/project-click/:projectId",     trackProjectClick);
router.post("/certificate-view/:certificateId", trackCertificateView);

// ── Protected — dashboard analytics summary ──────────────────────
router.get("/summary", protect, getAnalyticsSummary);

export default router;

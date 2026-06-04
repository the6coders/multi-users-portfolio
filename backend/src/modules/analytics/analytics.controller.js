import { asyncHandler } from "../../utils/asyncHandler.js";
import { analyticsService } from "./analytics.service.js";
import mongoose from "mongoose";

// Helper — validate MongoDB ObjectId
function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// POST /api/analytics/portfolio-view/:slug
export const trackPortfolioView = asyncHandler(async (req, res) => {
  const views = await analyticsService.recordPortfolioView(req.params.slug);
  res.status(200).json({ success: true, portfolioViews: views });
});

// POST /api/analytics/resume-download/:slug
export const trackResumeDownload = asyncHandler(async (req, res) => {
  const downloads = await analyticsService.recordResumeDownload(req.params.slug);
  res.status(200).json({ success: true, resumeDownloads: downloads });
});

// POST /api/analytics/project-click/:projectId
export const trackProjectClick = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.projectId)) {
    return res.status(400).json({ success: false, message: "Invalid project ID" });
  }
  const clicks = await analyticsService.recordProjectClick(req.params.projectId);
  res.status(200).json({ success: true, clickCount: clicks });
});

// POST /api/analytics/certificate-view/:certificateId
export const trackCertificateView = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.certificateId)) {
    return res.status(400).json({ success: false, message: "Invalid certificate ID" });
  }
  const views = await analyticsService.recordCertificateView(req.params.certificateId);
  res.status(200).json({ success: true, viewCount: views });
});

// GET /api/analytics/summary (protected — dashboard use)
export const getAnalyticsSummary = asyncHandler(async (req, res) => {
  const summary = await analyticsService.getSummary(
    new mongoose.Types.ObjectId(req.user.id)
  );
  res.status(200).json({ success: true, ...summary });
});

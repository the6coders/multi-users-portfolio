import { Router } from "express";
import { protect } from "../../middlewares/authMiddleware.js";
import { imageUploadMiddleware, pdfUploadMiddleware } from "../../middlewares/upload.js";
import {
  uploadProfileImage,
  deleteProfileImage,
  uploadResume,
  deleteResume,
  uploadProjectImage,
  deleteProjectImage,
  uploadCertificateImage,
  viewResume,
  downloadResume,
} from "./media.controller.js";

const router = Router();

// ── Public resume proxy — no auth required ────────────────────────────────────
// These must be declared BEFORE router.use(protect) so they are publicly accessible.
router.get("/resume/view/:portfolioSlug", viewResume);
router.get("/resume/download/:portfolioSlug", downloadResume);

// All other media routes require authentication
router.use(protect);

// Profile image
router.post("/profile-image", imageUploadMiddleware("file"), uploadProfileImage);
router.delete("/profile-image", deleteProfileImage);

// Resume (PDF)
router.post("/resume", pdfUploadMiddleware("file"), uploadResume);
router.delete("/resume", deleteResume);

// Project image
router.post("/project-image/:id", imageUploadMiddleware("file"), uploadProjectImage);
router.delete("/project-image/:id", deleteProjectImage);

// Certificate image
router.post("/certificate-image/:id", imageUploadMiddleware("file"), uploadCertificateImage);

export default router;

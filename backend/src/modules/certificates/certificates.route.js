import { Router } from "express";
import { protect } from "../../middlewares/authMiddleware.js";
import {
  listCertificates,
  createCertificate,
  updateCertificate,
  deleteCertificate,
} from "./certificate.controller.js";

const router = Router();

// Public — anyone can view certificates for a public portfolio
router.get("/:portfolioSlug", listCertificates);

// Protected — owner only
router.post("/", protect, createCertificate);
router.patch("/:id", protect, updateCertificate);
router.delete("/:id", protect, deleteCertificate);

export default router;

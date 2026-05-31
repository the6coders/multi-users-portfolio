import { Router } from "express";
import { protect } from "../../middlewares/authMiddleware.js";

const router = Router();

router.get("/", (_req, res) => res.json({ success: true, projects: [] }));
router.post("/", protect, (_req, res) =>
  res.json({ success: true, message: "Project creation coming in Phase 2" })
);

export default router;

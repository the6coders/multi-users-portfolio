import { Router } from "express";
import { protect } from "../../middlewares/authMiddleware.js";
import {
  sendMessage,
  getMessages,
  getMessage,
  markRead,
  deleteMessage,
} from "./message.controller.js";

const router = Router();

// ── Public ────────────────────────────────────────────────────────────
router.post("/:portfolioSlug", sendMessage);

// ── Protected ─────────────────────────────────────────────────────────
router.get("/",                        protect, getMessages);
router.get("/:messageId",              protect, getMessage);
router.patch("/:messageId/read",       protect, markRead);
router.delete("/:messageId",           protect, deleteMessage);

export default router;

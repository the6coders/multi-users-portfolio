import mongoose from "mongoose";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { messageService } from "./message.service.js";

// ── Helpers ──────────────────────────────────────────────────────────
function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ── Public ───────────────────────────────────────────────────────────

// POST /api/messages/:portfolioSlug
export const sendMessage = asyncHandler(async (req, res) => {
  const { portfolioSlug } = req.params;
  const { senderName, senderEmail, subject, message } = req.body;

  // Input validation at the boundary
  const missing = [];
  if (!senderName?.trim())  missing.push("senderName");
  if (!senderEmail?.trim()) missing.push("senderEmail");
  if (!subject?.trim())     missing.push("subject");
  if (!message?.trim())     missing.push("message");
  if (missing.length) throw new ApiError(400, `Missing required fields: ${missing.join(", ")}`);

  const emailOk = /^\S+@\S+\.\S+$/.test(senderEmail.trim());
  if (!emailOk) throw new ApiError(400, "Invalid email address");

  await messageService.createMessage(portfolioSlug, { senderName, senderEmail, subject, message });
  res.status(201).json({ success: true, message: "Message sent successfully" });
});

// ── Protected ─────────────────────────────────────────────────────────

// GET /api/messages
export const getMessages = asyncHandler(async (req, res) => {
  const { search, page, limit } = req.query;
  const result = await messageService.getOwnerMessages(req.user.id, { search, page, limit });
  res.status(200).json({ success: true, ...result });
});

// GET /api/messages/:messageId
export const getMessage = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.messageId))
    throw new ApiError(400, "Invalid message ID");

  const msg = await messageService.getMessageById(req.params.messageId, req.user.id);
  res.status(200).json({ success: true, message: msg });
});

// PATCH /api/messages/:messageId/read
export const markRead = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.messageId))
    throw new ApiError(400, "Invalid message ID");

  const msg = await messageService.markAsRead(req.params.messageId, req.user.id);
  res.status(200).json({ success: true, message: msg });
});

// DELETE /api/messages/:messageId
export const deleteMessage = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.messageId))
    throw new ApiError(400, "Invalid message ID");

  await messageService.deleteMessage(req.params.messageId, req.user.id);
  res.status(200).json({ success: true, message: "Message deleted" });
});

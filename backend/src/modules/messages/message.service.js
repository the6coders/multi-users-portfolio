import mongoose from "mongoose";
import { Message } from "./message.model.js";
import { Portfolio } from "../portfolios/portfolio.model.js";
import { ApiError } from "../../utils/apiError.js";

export const messageService = {
  // POST /api/messages/:portfolioSlug  — public
  async createMessage(portfolioSlug, { senderName, senderEmail, subject, message }) {
    const portfolio = await Portfolio.findOne({ portfolioSlug, isPublic: true })
      .select("_id userId")
      .lean();
    if (!portfolio) throw new ApiError(404, "Portfolio not found");

    const doc = await Message.create({
      portfolioId: portfolio._id,
      ownerId:     portfolio.userId,
      senderName,
      senderEmail,
      subject,
      message,
    });
    return doc;
  },

  // GET /api/messages  — owner inbox, newest first
  async getOwnerMessages(ownerId, { search, page, limit } = {}) {
    const pageNum  = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 20));
    const skip     = (pageNum - 1) * limitNum;

    const filter = { ownerId: new mongoose.Types.ObjectId(ownerId) };

    // Optional search across senderName, senderEmail, subject
    if (search && search.trim()) {
      const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { senderName:  regex },
        { senderEmail: regex },
        { subject:     regex },
      ];
    }

    const [messages, totalItems, unreadCount] = await Promise.all([
      Message.find(filter)
        .select("senderName senderEmail subject isRead readAt createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Message.countDocuments(filter),
      Message.countDocuments({ ownerId: new mongoose.Types.ObjectId(ownerId), isRead: false }),
    ]);

    return {
      messages,
      unreadCount,
      pagination: {
        page:       pageNum,
        limit:      limitNum,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / limitNum)),
      },
    };
  },

  // GET /api/messages/:messageId  — marks as read
  async getMessageById(messageId, ownerId) {
    const msg = await Message.findOne({
      _id:     messageId,
      ownerId: new mongoose.Types.ObjectId(ownerId),
    });
    if (!msg) throw new ApiError(404, "Message not found");

    if (!msg.isRead) {
      msg.isRead = true;
      msg.readAt = new Date();
      await msg.save();
    }
    return msg;
  },

  // PATCH /api/messages/:messageId/read
  async markAsRead(messageId, ownerId) {
    const msg = await Message.findOneAndUpdate(
      { _id: messageId, ownerId: new mongoose.Types.ObjectId(ownerId) },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    );
    if (!msg) throw new ApiError(404, "Message not found");
    return msg;
  },

  // DELETE /api/messages/:messageId
  async deleteMessage(messageId, ownerId) {
    const result = await Message.findOneAndDelete({
      _id:     messageId,
      ownerId: new mongoose.Types.ObjectId(ownerId),
    });
    if (!result) throw new ApiError(404, "Message not found");
  },

  // GET unread count only (used by analytics summary)
  async getUnreadCount(ownerId) {
    return Message.countDocuments({
      ownerId: new mongoose.Types.ObjectId(ownerId),
      isRead:  false,
    });
  },
};

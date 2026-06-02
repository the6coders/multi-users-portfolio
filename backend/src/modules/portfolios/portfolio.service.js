import { Portfolio } from "./portfolio.model.js";
import { User } from "../users/user.model.js";
import { ApiError } from "../../utils/apiError.js";

function buildSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const portfolioService = {
  // GET /api/portfolios — all public portfolios
  async listPublic() {
    return Portfolio.find({ isPublic: true })
      .select("portfolioSlug headline role profileImage themeColor userId")
      .populate("userId", "name username");
  },

  // GET /api/portfolios/:slug — single public (or owner's own)
  async getBySlug(slug, requesterId = null) {
    const portfolio = await Portfolio.findOne({ portfolioSlug: slug }).populate(
      "userId",
      "name username email"
    );
    if (!portfolio) throw new ApiError(404, "Portfolio not found");

    const isOwner =
      requesterId && portfolio.userId._id.toString() === requesterId;

    if (!portfolio.isPublic && !isOwner) {
      throw new ApiError(403, "This portfolio is private");
    }
    return portfolio;
  },

  // POST /api/portfolios — create (one per user)
  async create(userId, data) {
    const existing = await Portfolio.findOne({ userId });
    if (existing) throw new ApiError(409, "You already have a portfolio");

    // Derive slug from username if not explicitly provided
    let slug = data.portfolioSlug;
    if (!slug) {
      const user = await User.findById(userId);
      slug = buildSlug(user.portfolioSlug || user.username);
    } else {
      slug = buildSlug(slug);
    }

    // Ensure slug is unique
    const slugTaken = await Portfolio.findOne({ portfolioSlug: slug });
    if (slugTaken) throw new ApiError(409, "Portfolio slug already taken");

    return Portfolio.create({ ...data, userId, portfolioSlug: slug });
  },

  // PATCH /api/portfolios — update own portfolio
  async update(userId, updates) {
    if (!updates || typeof updates !== "object") {
      throw new ApiError(400, "Request body is required");
    }

    // Strip protected fields (including Cloudinary internal IDs)
    const {
      userId: _u,
      _id: _i,
      createdAt: _c,
      profileImagePublicId: _pip,
      resumePublicId: _rp,
      ...safeUpdates
    } = updates;

    // Prevent slug hijacking — re-sanitise if provided
    if (safeUpdates.portfolioSlug) {
      safeUpdates.portfolioSlug = buildSlug(safeUpdates.portfolioSlug);
      const slugTaken = await Portfolio.findOne({
        portfolioSlug: safeUpdates.portfolioSlug,
        userId: { $ne: userId },
      });
      if (slugTaken) throw new ApiError(409, "Portfolio slug already taken");
    }

    const portfolio = await Portfolio.findOneAndUpdate(
      { userId },
      { $set: safeUpdates },
      { new: true, runValidators: true }
    );
    if (!portfolio) throw new ApiError(404, "Portfolio not found");
    return portfolio;
  },

  // DELETE /api/portfolios — delete own portfolio
  async remove(userId) {
    const portfolio = await Portfolio.findOneAndDelete({ userId });
    if (!portfolio) throw new ApiError(404, "Portfolio not found");
    return portfolio;
  },
};

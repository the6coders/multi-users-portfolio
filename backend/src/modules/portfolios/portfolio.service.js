import { Portfolio } from "./portfolio.model.js";
import { User } from "../users/user.model.js";
import { ApiError } from "../../utils/apiError.js";

function buildSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Escape regex metacharacters to prevent ReDoS
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const SORT_MAP = {
  newest:       { createdAt: -1 },
  oldest:       { createdAt:  1 },
  alphabetical: { portfolioSlug: 1 },
};

export const portfolioService = {
  // GET /api/portfolios — paginated, filtered, sorted public portfolios
  async listPublic({ search, skill, role, sort, page, limit } = {}) {
    const filter = { isPublic: true };

    // ── Search ────────────────────────────────────────────────
    // Searches: headline, role, portfolioSlug, and owner name (via User lookup)
    if (search && search.trim()) {
      const safe  = escapeRegex(search.trim());
      const regex = new RegExp(safe, "i");

      // Find matching user IDs by name
      const matchingUsers = await User.find({ name: regex }).select("_id").lean();
      const userIds = matchingUsers.map((u) => u._id);

      filter.$or = [
        { headline:      regex },
        { role:          regex },
        { portfolioSlug: regex },
        ...(userIds.length ? [{ userId: { $in: userIds } }] : []),
      ];
    }

    // ── Skill filter ──────────────────────────────────────────
    // Case-insensitive exact match against the skills array
    if (skill && skill.trim()) {
      const safe = escapeRegex(skill.trim());
      filter.skills = new RegExp(`^${safe}$`, "i");
    }

    // ── Role filter ───────────────────────────────────────────
    // Case-insensitive substring match
    if (role && role.trim()) {
      const safe = escapeRegex(role.trim());
      filter.role = new RegExp(safe, "i");
    }

    // ── Sort ──────────────────────────────────────────────────
    const sortObj = SORT_MAP[sort] ?? SORT_MAP.newest;

    // ── Pagination ────────────────────────────────────────────
    const pageNum  = Math.max(1, parseInt(page)  || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 9));
    const skip     = (pageNum - 1) * limitNum;

    const [portfolios, totalItems] = await Promise.all([
      Portfolio.find(filter)
        .select("portfolioSlug headline role profileImage themeColor userId skills")
        .populate("userId", "name username")
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Portfolio.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalItems / limitNum));

    return {
      portfolios,
      pagination: { page: pageNum, limit: limitNum, totalItems, totalPages },
    };
  },

  // GET /api/portfolios/meta — distinct skills & roles from public portfolios
  async getFilters() {
    const [skills, roles] = await Promise.all([
      Portfolio.distinct("skills", { isPublic: true }),
      Portfolio.distinct("role",   { isPublic: true }),
    ]);

    return {
      skills: skills
        .filter((s) => typeof s === "string" && s.trim())
        .sort((a, b) => a.localeCompare(b)),
      roles: roles
        .filter((r) => typeof r === "string" && r.trim())
        .sort((a, b) => a.localeCompare(b)),
    };
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

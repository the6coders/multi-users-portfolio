import { Router } from "express";
import { protect } from "../../middlewares/authMiddleware.js";
import { authService } from "../auth/auth.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const router = Router();

// GET /api/users/me — returns full user from DB (not raw JWT payload)
router.get("/me", protect, asyncHandler(async (req, res) => {
  const user = await authService.getById(req.user.id);
  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      portfolioSlug: user.portfolioSlug,
      createdAt: user.createdAt,
    },
  });
}));

export default router;

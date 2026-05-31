import { asyncHandler } from "../../utils/asyncHandler.js";
import { authService } from "./auth.service.js";
import { signAccessToken } from "../../utils/jwt.js";

function safeUser(user) {
  return {
    id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    portfolioSlug: user.portfolioSlug,
    createdAt: user.createdAt,
  };
}

export const register = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;
  const user = await authService.register(name, username, email, password);
  const token = signAccessToken({ id: user._id });
  res.status(201).json({ success: true, token, user: safeUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.login(email, password);
  const token = signAccessToken({ id: user._id });
  res.status(200).json({ success: true, token, user: safeUser(user) });
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getById(req.user.id);
  res.status(200).json({ success: true, user: safeUser(user) });
});

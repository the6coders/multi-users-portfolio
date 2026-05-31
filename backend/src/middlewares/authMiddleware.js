import { verifyAccessToken } from "../utils/jwt.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, _res, next) => {
  const token =
    req.cookies?.token || req.headers.authorization?.split(" ")[1];
  if (!token) throw new ApiError(401, "Not authenticated");
  try {
    req.user = verifyAccessToken(token);
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }
  next();
});

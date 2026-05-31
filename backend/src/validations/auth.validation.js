import { ApiError } from "../utils/apiError.js";

export function validateRegister(req, _res, next) {
  const { name, username, email, password } = req.body;
  if (!name || !username || !email || !password) {
    throw new ApiError(400, "name, username, email, and password are required");
  }
  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }
  next();
}

export function validateLogin(req, _res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "email and password are required");
  }
  next();
}

import { User } from "../users/user.model.js";
import { ApiError } from "../../utils/apiError.js";

function generateSlug(username) {
  return username
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const authService = {
  async register(name, username, email, password) {
    const [existingEmail, existingUsername] = await Promise.all([
      User.findOne({ email }),
      User.findOne({ username }),
    ]);
    if (existingEmail) throw new ApiError(409, "Email already in use");
    if (existingUsername) throw new ApiError(409, "Username already taken");

    const portfolioSlug = generateSlug(username);
    const user = await User.create({ name, username, email, password, portfolioSlug });
    return user;
  },

  async login(email, password) {
    const user = await User.findOne({ email }).select("+password");
    if (!user) throw new ApiError(401, "Invalid email or password");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new ApiError(401, "Invalid email or password");

    return user;
  },

  async getById(id) {
    const user = await User.findById(id);
    if (!user) throw new ApiError(404, "User not found");
    return user;
  },
};

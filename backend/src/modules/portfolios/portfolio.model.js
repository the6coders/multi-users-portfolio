import mongoose from "mongoose";

// Ensure User model is registered before populate() runs on this schema
import "../users/user.model.js";

const portfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    portfolioSlug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    headline: {
      type: String,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      trim: true,
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    github: {
      type: String,
      trim: true,
      default: "",
    },
    linkedin: {
      type: String,
      trim: true,
      default: "",
    },
    website: {
      type: String,
      trim: true,
      default: "",
    },
    profileImage: {
      type: String,
      trim: true,
      default: "",
    },
    profileImagePublicId: {
      type: String,
      default: "",
    },
    resumeUrl: {
      type: String,
      trim: true,
      default: "",
    },
    resumePublicId: {
      type: String,
      default: "",
    },
    themeColor: {
      type: String,
      trim: true,
      default: "#14b8a6",
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound indexes for common list-query patterns
portfolioSchema.index({ isPublic: 1, createdAt: -1 });
portfolioSchema.index({ isPublic: 1, portfolioSlug: 1 });
portfolioSchema.index({ isPublic: 1, skills: 1 });
portfolioSchema.index({ isPublic: 1, role: 1 });

export const Portfolio = mongoose.model("Portfolio", portfolioSchema);

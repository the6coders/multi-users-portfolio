import mongoose from "mongoose";

// Ensure referenced models are registered before any populate() calls
import "../users/user.model.js";
import "../portfolios/portfolio.model.js";

const { Schema, Types } = mongoose;

const certificateSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    portfolioId: {
      type: Types.ObjectId,
      ref: "Portfolio",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    issuer: {
      type: String,
      required: [true, "Issuer is required"],
      trim: true,
    },
    issueDate: {
      type: Date,
      default: null,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    imagePublicId: {
      type: String,
      default: "",
    },
    credentialUrl: {
      type: String,
      default: "",
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

certificateSchema.index({ portfolioId: 1, createdAt: -1 });

export const Certificate = mongoose.model("Certificate", certificateSchema);

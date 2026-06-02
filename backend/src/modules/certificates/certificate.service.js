import { Certificate } from "./certificate.model.js";
import { Portfolio } from "../portfolios/portfolio.model.js";
import { ApiError } from "../../utils/apiError.js";

export const certificateService = {
  /** GET /api/certificates/:portfolioSlug — public list */
  async listBySlug(portfolioSlug) {
    const portfolio = await Portfolio.findOne({ portfolioSlug });
    if (!portfolio) throw new ApiError(404, "Portfolio not found");
    return Certificate.find({ portfolioId: portfolio._id })
      .sort({ createdAt: -1 })
      .select("-imagePublicId -__v");
  },

  /** POST /api/certificates */
  async create(userId, data) {
    const portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      throw new ApiError(400, "You must have a portfolio before adding certificates");
    }

    const { imagePublicId: _ip, userId: _u, portfolioId: _p, ...safe } = data;
    return Certificate.create({ ...safe, userId, portfolioId: portfolio._id });
  },

  /** PATCH /api/certificates/:id */
  async update(certId, userId, updates) {
    const cert = await Certificate.findById(certId);
    if (!cert) throw new ApiError(404, "Certificate not found");
    if (cert.userId.toString() !== userId) throw new ApiError(403, "Forbidden");

    // Strip protected fields
    const { userId: _u, portfolioId: _p, _id: _i, imagePublicId: _ip, ...safe } = updates;

    return Certificate.findByIdAndUpdate(
      certId,
      { $set: safe },
      { new: true, runValidators: true }
    );
  },

  /** DELETE /api/certificates/:id */
  async remove(certId, userId) {
    const cert = await Certificate.findById(certId);
    if (!cert) throw new ApiError(404, "Certificate not found");
    if (cert.userId.toString() !== userId) throw new ApiError(403, "Forbidden");
    await Certificate.findByIdAndDelete(certId);
    return cert;
  },
};

import { Portfolio } from "../portfolios/portfolio.model.js";
import { Project } from "../projects/project.model.js";
import { Certificate } from "../certificates/certificate.model.js";
import { Message } from "../messages/message.model.js";
import { ApiError } from "../../utils/apiError.js";

export const analyticsService = {
  // POST /api/analytics/portfolio-view/:slug
  async recordPortfolioView(slug) {
    const result = await Portfolio.findOneAndUpdate(
      { portfolioSlug: slug, isPublic: true },
      { $inc: { portfolioViews: 1 } },
      { new: true, select: "portfolioViews" }
    );
    if (!result) throw new ApiError(404, "Portfolio not found");
    return result.portfolioViews;
  },

  // POST /api/analytics/resume-download/:slug
  async recordResumeDownload(slug) {
    const result = await Portfolio.findOneAndUpdate(
      { portfolioSlug: slug, isPublic: true },
      { $inc: { resumeDownloads: 1 } },
      { new: true, select: "resumeDownloads" }
    );
    if (!result) throw new ApiError(404, "Portfolio not found");
    return result.resumeDownloads;
  },

  // POST /api/analytics/project-click/:projectId
  async recordProjectClick(projectId) {
    const result = await Project.findByIdAndUpdate(
      projectId,
      { $inc: { clickCount: 1 } },
      { new: true, select: "clickCount" }
    );
    if (!result) throw new ApiError(404, "Project not found");
    return result.clickCount;
  },

  // POST /api/analytics/certificate-view/:certificateId
  async recordCertificateView(certificateId) {
    const result = await Certificate.findByIdAndUpdate(
      certificateId,
      { $inc: { viewCount: 1 } },
      { new: true, select: "viewCount" }
    );
    if (!result) throw new ApiError(404, "Certificate not found");
    return result.viewCount;
  },

  // GET /api/analytics/summary — aggregated stats for the authenticated user
  async getSummary(userId) {
    const [portfolio, projectAgg, certAgg, unreadMessages] = await Promise.all([
      Portfolio.findOne({ userId })
        .select("portfolioViews resumeDownloads")
        .lean(),

      Project.aggregate([
        { $match: { userId: userId } },
        { $group: { _id: null, totalClicks: { $sum: "$clickCount" } } },
      ]),

      Certificate.aggregate([
        { $match: { userId: userId } },
        { $group: { _id: null, totalViews: { $sum: "$viewCount" } } },
      ]),

      Message.countDocuments({ ownerId: userId, isRead: false }),
    ]);

    return {
      portfolioViews:   portfolio?.portfolioViews   ?? 0,
      resumeDownloads:  portfolio?.resumeDownloads  ?? 0,
      projectClicks:    projectAgg[0]?.totalClicks  ?? 0,
      certificateViews: certAgg[0]?.totalViews      ?? 0,
      unreadMessages,
    };
  },
};

import { asyncHandler } from "../../utils/asyncHandler.js";
import { portfolioService } from "./portfolio.service.js";

export const listPortfolios = asyncHandler(async (_req, res) => {
  const portfolios = await portfolioService.listPublic();
  res.status(200).json({ success: true, portfolios });
});

export const getPortfolioBySlug = asyncHandler(async (req, res) => {
  const requesterId = req.user?.id ?? null;
  const portfolio = await portfolioService.getBySlug(req.params.slug, requesterId);
  res.status(200).json({ success: true, portfolio });
});

export const createPortfolio = asyncHandler(async (req, res) => {
  const portfolio = await portfolioService.create(req.user.id, req.body);
  res.status(201).json({ success: true, portfolio });
});

export const updatePortfolio = asyncHandler(async (req, res) => {
  const portfolio = await portfolioService.update(req.user.id, req.body);
  res.status(200).json({ success: true, portfolio });
});

export const deletePortfolio = asyncHandler(async (req, res) => {
  await portfolioService.remove(req.user.id);
  res.status(200).json({ success: true, message: "Portfolio deleted" });
});

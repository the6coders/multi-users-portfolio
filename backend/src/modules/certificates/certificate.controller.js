import { asyncHandler } from "../../utils/asyncHandler.js";
import { certificateService } from "./certificate.service.js";

export const listCertificates = asyncHandler(async (req, res) => {
  const certs = await certificateService.listBySlug(req.params.portfolioSlug);
  res.json({ success: true, certificates: certs });
});

export const createCertificate = asyncHandler(async (req, res) => {
  const cert = await certificateService.create(req.user.id, req.body);
  res.status(201).json({ success: true, certificate: cert });
});

export const updateCertificate = asyncHandler(async (req, res) => {
  const cert = await certificateService.update(req.params.id, req.user.id, req.body);
  res.json({ success: true, certificate: cert });
});

export const deleteCertificate = asyncHandler(async (req, res) => {
  await certificateService.remove(req.params.id, req.user.id);
  res.json({ success: true, message: "Certificate deleted" });
});

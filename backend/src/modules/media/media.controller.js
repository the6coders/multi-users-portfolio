import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { uploadBuffer, deleteAsset } from "../../utils/cloudinaryUpload.js";
import { Portfolio } from "../portfolios/portfolio.model.js";
import { Project } from "../projects/project.model.js";
import { Certificate } from "../certificates/certificate.model.js";
import https from "https";

// ─── Profile Image ──────────────────────────────────────────────────

export const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No file uploaded");

  const portfolio = await Portfolio.findOne({ userId: req.user.id });
  if (!portfolio) throw new ApiError(404, "Portfolio not found — create one first");

  // Remove old asset from Cloudinary (non-blocking on failure)
  if (portfolio.profileImagePublicId) {
    await deleteAsset(portfolio.profileImagePublicId);
  }

  const result = await uploadBuffer(
    req.file.buffer,
    "portfolio-platform/profile-images",
    {
      transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
    }
  );

  portfolio.profileImage = result.secure_url;
  portfolio.profileImagePublicId = result.public_id;
  await portfolio.save();

  res.json({ success: true, url: result.secure_url });
});

export const deleteProfileImage = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findOne({ userId: req.user.id });
  if (!portfolio) throw new ApiError(404, "Portfolio not found");

  await deleteAsset(portfolio.profileImagePublicId);
  portfolio.profileImage = "";
  portfolio.profileImagePublicId = "";
  await portfolio.save();

  res.json({ success: true, message: "Profile image removed" });
});

// ─── Resume ─────────────────────────────────────────────────────────

export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No file uploaded");

  const portfolio = await Portfolio.findOne({ userId: req.user.id });
  if (!portfolio) throw new ApiError(404, "Portfolio not found — create one first");

  if (portfolio.resumePublicId) {
    await deleteAsset(portfolio.resumePublicId, "raw");
  }

  const result = await uploadBuffer(
    req.file.buffer,
    "portfolio-platform/resumes",
    {
      resource_type: "raw",
      format: "pdf",
    }
  );

  portfolio.resumeUrl = result.secure_url;
  portfolio.resumePublicId = result.public_id;
  await portfolio.save();

  res.json({ success: true, url: result.secure_url });
});

export const deleteResume = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findOne({ userId: req.user.id });
  if (!portfolio) throw new ApiError(404, "Portfolio not found");

  await deleteAsset(portfolio.resumePublicId, "raw");
  portfolio.resumeUrl = "";
  portfolio.resumePublicId = "";
  await portfolio.save();

  res.json({ success: true, message: "Resume removed" });
});

// ─── Project Image ───────────────────────────────────────────────────

export const uploadProjectImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No file uploaded");

  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, "Project not found");
  if (project.userId.toString() !== req.user.id) throw new ApiError(403, "Forbidden");

  if (project.imagePublicId) {
    await deleteAsset(project.imagePublicId);
  }

  const result = await uploadBuffer(
    req.file.buffer,
    "portfolio-platform/project-images",
    {
      transformation: [{ width: 1200, height: 630, crop: "fill" }],
    }
  );

  project.imageUrl = result.secure_url;
  project.imagePublicId = result.public_id;
  await project.save();

  res.json({ success: true, url: result.secure_url });
});

export const deleteProjectImage = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, "Project not found");
  if (project.userId.toString() !== req.user.id) throw new ApiError(403, "Forbidden");

  await deleteAsset(project.imagePublicId);
  project.imageUrl = "";
  project.imagePublicId = "";
  await project.save();

  res.json({ success: true, message: "Project image removed" });
});

// ─── Certificate Image ───────────────────────────────────────────────

export const uploadCertificateImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No file uploaded");

  const cert = await Certificate.findById(req.params.id);
  if (!cert) throw new ApiError(404, "Certificate not found");
  if (cert.userId.toString() !== req.user.id) throw new ApiError(403, "Forbidden");

  if (cert.imagePublicId) {
    await deleteAsset(cert.imagePublicId);
  }

  const result = await uploadBuffer(
    req.file.buffer,
    "portfolio-platform/certificate-images",
    {
      transformation: [{ width: 800, height: 600, crop: "limit" }],
    }
  );

  cert.imageUrl = result.secure_url;
  cert.imagePublicId = result.public_id;
  await cert.save();

  res.json({ success: true, url: result.secure_url });
});

// ─── Resume Proxy ────────────────────────────────────────────────────
// Public endpoints — no auth required.
// Fetches the PDF server-side from Cloudinary (bypassing Cloudinary's
// Strict Delivery Mode which blocks direct browser access on the Free plan)
// and streams it to the client.

/**
 * Shared internal helper — streams the resume from Cloudinary to the client.
 * @param {"view"|"download"} mode
 */
function proxyResume(mode) {
  return asyncHandler(async (req, res) => {
    const { portfolioSlug } = req.params;

    const portfolio = await Portfolio.findOne({ portfolioSlug }).select(
      "resumeUrl portfolioSlug"
    );
    if (!portfolio) throw new ApiError(404, "Portfolio not found");
    if (!portfolio.resumeUrl) throw new ApiError(404, "No resume uploaded for this portfolio");

    // Validate the stored URL is a Cloudinary URL (prevent SSRF)
    const url = portfolio.resumeUrl;
    if (!url.startsWith("https://res.cloudinary.com/")) {
      throw new ApiError(500, "Invalid resume URL configuration");
    }

    await new Promise((resolve, reject) => {
      https.get(url, (cloudinaryRes) => {
        if (cloudinaryRes.statusCode !== 200) {
          reject(new ApiError(502, `Cloudinary returned ${cloudinaryRes.statusCode}`));
          cloudinaryRes.resume();
          return;
        }

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Cache-Control", "private, max-age=300");

        if (mode === "download") {
          const filename = `resume-${portfolioSlug}.pdf`;
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
          );
        } else {
          res.setHeader("Content-Disposition", "inline");
        }

        if (cloudinaryRes.headers["content-length"]) {
          res.setHeader("Content-Length", cloudinaryRes.headers["content-length"]);
        }

        cloudinaryRes.pipe(res);
        cloudinaryRes.on("end", resolve);
        cloudinaryRes.on("error", reject);
      }).on("error", (err) => {
        reject(new ApiError(502, `Failed to reach Cloudinary: ${err.message}`));
      });
    });
  });
}

export const viewResume = proxyResume("view");
export const downloadResume = proxyResume("download");

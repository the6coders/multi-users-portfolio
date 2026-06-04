import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { uploadBuffer, deleteAsset } from "../../utils/cloudinaryUpload.js";
import { cloudinary } from "../../config/cloudinary.js";
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
/**
 * Fetch a URL via HTTPS, following up to maxRedirects redirects.
 * Returns a promise that resolves with the final IncomingMessage stream.
 */
function httpsGetFollowRedirects(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const request = (targetUrl, remaining) => {
      https.get(targetUrl, (res) => {
        const { statusCode, headers } = res;
        if ([301, 302, 303, 307, 308].includes(statusCode) && headers.location) {
          if (remaining === 0) {
            reject(new Error("Too many redirects"));
            res.resume();
            return;
          }
          res.resume(); // drain and discard
          request(headers.location, remaining - 1);
        } else {
          resolve(res);
        }
      }).on("error", reject);
    };
    request(url, maxRedirects);
  });
}

function proxyResume(mode) {
  return asyncHandler(async (req, res) => {
    const { portfolioSlug } = req.params;

    const portfolio = await Portfolio.findOne({ portfolioSlug }).select(
      "resumePublicId portfolioSlug"
    );
    if (!portfolio) throw new ApiError(404, "Portfolio not found");
    if (!portfolio.resumePublicId)
      throw new ApiError(404, "No resume uploaded for this portfolio");

    // Cloudinary Free plan blocks ALL CDN delivery (res.cloudinary.com) with HTTP 401.
    // private_download_url generates a time-limited signed URL to
    // api.cloudinary.com — the Admin API endpoint — which uses
    // API key/secret auth and is NOT subject to CDN Strict Delivery Mode.
    //
    // For raw resources the public_id stored in DB includes the file
    // extension (e.g. "path/file.pdf"). Pass it as-is with format=""
    // so the SDK doesn't append a second ".pdf" suffix.
    const signedUrl = cloudinary.utils.private_download_url(
      portfolio.resumePublicId,
      "",                // extension already in publicId for raw uploads
      {
        resource_type: "raw",
        type: "upload",
        expires_at: Math.floor(Date.now() / 1000) + 300, // 5-minute window
      }
    );

    let upstream;
    try {
      upstream = await httpsGetFollowRedirects(signedUrl);
    } catch (err) {
      throw new ApiError(502, `Storage fetch failed: ${err.message}`);
    }

    if (upstream.statusCode !== 200) {
      upstream.resume();
      throw new ApiError(502, `Storage returned ${upstream.statusCode}`);
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Cache-Control", "private, max-age=0");

    if (mode === "download") {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="resume-${portfolioSlug}.pdf"`
      );
    } else {
      res.setHeader("Content-Disposition", "inline");
    }

    if (upstream.headers["content-length"]) {
      res.setHeader("Content-Length", upstream.headers["content-length"]);
    }

    upstream.pipe(res);
    await new Promise((resolve, reject) => {
      upstream.on("end", resolve);
      upstream.on("error", reject);
      res.on("error", reject);
    });
  });
}

export const viewResume = proxyResume("view");
export const downloadResume = proxyResume("download");

import { useRef, useState } from "react";
import apiClient from "../../services/apiClient";

/**
 * Dashboard Media Section — handles profile image and resume uploads.
 * Upload logic lives here (smart component). Progress indicators included.
 *
 * Props:
 *   portfolio         object — current portfolio document
 *   onPortfolioChange (updater: fn) => void — called with a portfolio patch object
 *   showToast         (message, type?) => void
 */
export default function MediaSection({ portfolio, onPortfolioChange, showToast }) {
  const imageInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  const [imgUploading, setImgUploading] = useState(false);
  const [imgProgress, setImgProgress] = useState(0);
  const [imgError, setImgError] = useState(null);

  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfError, setPdfError] = useState(null);

  // ─── Image validation ───────────────────────────────────────────
  const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const validateImage = (file) => {
    if (!IMAGE_TYPES.includes(file.type)) return "Only JPG, PNG, WEBP images are allowed.";
    if (file.size > 5 * 1024 * 1024) return "Image must be under 5 MB.";
    return null;
  };

  const validatePdf = (file) => {
    if (file.type !== "application/pdf") return "Only PDF files are allowed.";
    if (file.size > 10 * 1024 * 1024) return "PDF must be under 10 MB.";
    return null;
  };

  // ─── Profile image handlers ──────────────────────────────────────
  const handleImagePick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const err = validateImage(file);
    if (err) { setImgError(err); return; }
    setImgError(null);
    setImgUploading(true);
    setImgProgress(0);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await apiClient.post("/media/profile-image", fd, {
        onUploadProgress: (ev) =>
          setImgProgress(Math.round((ev.loaded * 100) / ev.total)),
      });
      onPortfolioChange({ profileImage: res.data.url });
      showToast("Profile image updated!");
    } catch (err) {
      setImgError(err.response?.data?.message || "Upload failed.");
    } finally {
      setImgUploading(false);
      setImgProgress(0);
    }
  };

  const handleImageDelete = async () => {
    setImgUploading(true);
    setImgError(null);
    try {
      await apiClient.delete("/media/profile-image");
      onPortfolioChange({ profileImage: "" });
      showToast("Profile image removed.");
    } catch (err) {
      setImgError(err.response?.data?.message || "Failed to remove image.");
    } finally {
      setImgUploading(false);
    }
  };

  // ─── Resume handlers ─────────────────────────────────────────────
  const handlePdfPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const err = validatePdf(file);
    if (err) { setPdfError(err); return; }
    setPdfError(null);
    setPdfUploading(true);
    setPdfProgress(0);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await apiClient.post("/media/resume", fd, {
        onUploadProgress: (ev) =>
          setPdfProgress(Math.round((ev.loaded * 100) / ev.total)),
      });
      onPortfolioChange({ resumeUrl: res.data.url });
      showToast("Resume uploaded!");
    } catch (err) {
      setPdfError(err.response?.data?.message || "Upload failed.");
    } finally {
      setPdfUploading(false);
      setPdfProgress(0);
    }
  };

  const handlePdfDelete = async () => {
    setPdfUploading(true);
    setPdfError(null);
    try {
      await apiClient.delete("/media/resume");
      onPortfolioChange({ resumeUrl: "" });
      showToast("Resume removed.");
    } catch (err) {
      setPdfError(err.response?.data?.message || "Failed to remove resume.");
    } finally {
      setPdfUploading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-5 text-lg font-semibold">Media</h2>

      <div className="grid gap-8 sm:grid-cols-2">
        {/* ── Profile Photo ─────────────────────────────────────── */}
        <div>
          <p className="mb-3 text-sm font-medium text-slate-300">Profile Photo</p>
          <div className="flex items-center gap-4">
            {/* Preview */}
            {portfolio.profileImage ? (
              <img
                src={portfolio.profileImage}
                alt="Profile"
                className="h-20 w-20 shrink-0 rounded-full object-cover ring-2 ring-slate-700"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-slate-800 text-2xl font-bold text-slate-400">
                {portfolio.userId?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}

            {/* Controls */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={imgUploading}
                className="block rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:border-teal-500 hover:text-teal-400 disabled:opacity-50"
              >
                {portfolio.profileImage ? "Change Photo" : "Upload Photo"}
              </button>
              {portfolio.profileImage && (
                <button
                  type="button"
                  onClick={handleImageDelete}
                  disabled={imgUploading}
                  className="block rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:border-red-500 hover:text-red-400 disabled:opacity-50"
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>

          {/* Progress */}
          {imgUploading && (
            <ProgressBar progress={imgProgress} />
          )}
          <p className="mt-1.5 text-[11px] text-slate-600">JPG, PNG, WEBP · max 5 MB</p>
          {imgError && <p className="mt-1 text-xs text-red-400">{imgError}</p>}

          <input
            ref={imageInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={handleImagePick}
          />
        </div>

        {/* ── Resume ────────────────────────────────────────────── */}
        <div>
          <p className="mb-3 text-sm font-medium text-slate-300">Resume / CV</p>

          {portfolio.resumeUrl ? (
            <div className="mb-3 flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2">
              <span className="text-lg">📄</span>
              <a
                href={portfolio.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 truncate text-sm text-teal-400 hover:underline"
              >
                View resume ↗
              </a>
            </div>
          ) : (
            <div className="mb-3 rounded-lg border border-dashed border-slate-700 px-3 py-4 text-center">
              <p className="text-sm text-slate-500">No resume uploaded</p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => pdfInputRef.current?.click()}
              disabled={pdfUploading}
              className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:border-teal-500 hover:text-teal-400 disabled:opacity-50"
            >
              {portfolio.resumeUrl ? "Replace PDF" : "Upload PDF"}
            </button>
            {portfolio.resumeUrl && (
              <button
                type="button"
                onClick={handlePdfDelete}
                disabled={pdfUploading}
                className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:border-red-500 hover:text-red-400 disabled:opacity-50"
              >
                Remove
              </button>
            )}
          </div>

          {/* Progress */}
          {pdfUploading && (
            <ProgressBar progress={pdfProgress} />
          )}
          <p className="mt-1.5 text-[11px] text-slate-600">PDF only · max 10 MB</p>
          {pdfError && <p className="mt-1 text-xs text-red-400">{pdfError}</p>}

          <input
            ref={pdfInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handlePdfPick}
          />
        </div>
      </div>
    </section>
  );
}

function ProgressBar({ progress }) {
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
      <div
        className="h-full rounded-full bg-teal-500 transition-all duration-200"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

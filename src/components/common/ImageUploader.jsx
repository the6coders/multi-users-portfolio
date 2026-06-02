import { useRef, useState } from "react";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ACCEPTED_ATTR = ".jpg,.jpeg,.png,.webp";

/**
 * Dumb image uploader — validates locally, shows preview, emits File to parent.
 * No API calls. Parent is responsible for uploading.
 *
 * Props:
 *   initialUrl    string  — existing image URL to pre-fill the preview
 *   onFileSelect  (file: File) => void — called when a valid file is picked
 *   onRemove      () => void — called when user clicks ✕ (clear image)
 *   disabled      boolean
 *   shape         "square" | "round"
 *   maxMB         number (default 5)
 *   label         string | null
 */
export default function ImageUploader({
  initialUrl = "",
  onFileSelect,
  onRemove,
  disabled = false,
  shape = "square",
  maxMB = 5,
  label,
}) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(initialUrl || null);
  const [error, setError] = useState(null);

  const validate = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `Only JPG, PNG, WEBP images are allowed.`;
    }
    if (file.size > maxMB * 1024 * 1024) {
      return `File must be under ${maxMB} MB.`;
    }
    return null;
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validate(file);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
    onFileSelect?.(file);
    // Allow same file to be re-selected
    e.target.value = "";
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    setError(null);
    onRemove?.();
  };

  const roundCls = shape === "round" ? "rounded-full" : "rounded-xl";

  return (
    <div>
      {label && (
        <p className="mb-1.5 text-xs font-medium text-slate-400">{label}</p>
      )}

      {preview ? (
        <div className="group relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className={`h-24 w-24 object-cover ${roundCls} border border-slate-700`}
          />
          {!disabled && (
            <div
              className={`absolute inset-0 flex items-center justify-center gap-3 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 ${roundCls}`}
            >
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-base text-white transition hover:text-teal-400"
                title="Change image"
              >
                ✏
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="text-base text-white transition hover:text-red-400"
                title="Remove image"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className={`flex h-24 w-24 flex-col items-center justify-center gap-1 border-2 border-dashed border-slate-700 text-slate-500 transition hover:border-teal-500 hover:text-teal-400 disabled:pointer-events-none disabled:opacity-50 ${roundCls}`}
        >
          <span className="text-lg">📷</span>
          <span className="text-[10px] font-medium tracking-wide">Upload</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_ATTR}
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />

      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

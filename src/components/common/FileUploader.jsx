import { useRef, useState } from "react";

const MAX_PDF_MB = 10;

/**
 * Dumb PDF file picker — validates locally, emits File to parent.
 * No API calls. Parent is responsible for uploading.
 *
 * Props:
 *   currentUrl    string  — URL of existing file (shows a preview link)
 *   onFileSelect  (file: File) => void
 *   disabled      boolean
 *   label         string
 */
export default function FileUploader({
  currentUrl = "",
  onFileSelect,
  disabled = false,
  label = "Resume / CV",
}) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState(null);
  const [error, setError] = useState(null);

  const validate = (file) => {
    if (file.type !== "application/pdf") return "Only PDF files are allowed.";
    if (file.size > MAX_PDF_MB * 1024 * 1024) return `File must be under ${MAX_PDF_MB} MB.`;
    return null;
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validate(file);
    if (err) {
      setError(err);
      onFileSelect?.(null);
      return;
    }
    setError(null);
    setFileName(file.name);
    onFileSelect?.(file);
    e.target.value = "";
  };

  return (
    <div>
      {label && (
        <p className="mb-1.5 text-xs font-medium text-slate-400">{label}</p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {currentUrl && (
          <a
            href={currentUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-teal-400 hover:underline"
          >
            📄 View current resume ↗
          </a>
        )}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:border-teal-500 hover:text-teal-400 disabled:opacity-50"
        >
          {currentUrl ? "Replace PDF" : "Upload PDF"}
        </button>

        {fileName && (
          <span className="text-xs text-teal-400">✓ {fileName} selected</span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />

      <p className="mt-1 text-[11px] text-slate-600">PDF only · max {MAX_PDF_MB} MB</p>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

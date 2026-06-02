export default function Toast({ message, type = "success", onClose }) {
  return (
    <div
      role="alert"
      className={`fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-sm ${
        type === "success"
          ? "border-teal-700 bg-slate-900/95 text-teal-300"
          : "border-red-700 bg-slate-900/95 text-red-400"
      }`}
    >
      <span className="flex-1 leading-relaxed">{message}</span>
      <button
        onClick={onClose}
        aria-label="Close"
        className="shrink-0 opacity-60 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}

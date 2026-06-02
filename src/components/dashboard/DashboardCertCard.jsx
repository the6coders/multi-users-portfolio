/**
 * Dashboard certificate card — shows cert info with Edit / Delete controls.
 * Different from the public CertificateCard in src/components/portfolio/.
 */
export default function DashboardCertCard({ cert, onEdit, onDelete }) {
  const formattedDate = cert.issueDate
    ? new Date(cert.issueDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      })
    : null;

  return (
    <li className="flex items-start gap-4 rounded-xl border border-slate-800 bg-slate-800/30 p-4 transition hover:border-slate-700">
      {/* Thumbnail */}
      {cert.imageUrl ? (
        <img
          src={cert.imageUrl}
          alt={cert.title}
          className="h-14 w-14 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-2xl">
          🏆
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="truncate font-medium text-slate-100">{cert.title}</p>
        <p className="mt-0.5 text-sm text-slate-400">{cert.issuer}</p>
        {formattedDate && (
          <p className="mt-0.5 text-xs text-slate-500">{formattedDate}</p>
        )}
        {cert.credentialUrl && (
          <a
            href={cert.credentialUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-block text-xs text-teal-400 hover:underline"
          >
            View Credential ↗
          </a>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 flex-col gap-1.5">
        <button
          onClick={onEdit}
          className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-teal-500 hover:text-teal-400"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-red-500 hover:text-red-400"
        >
          Delete
        </button>
      </div>
    </li>
  );
}

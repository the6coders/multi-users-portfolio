export default function CertificateCard({ cert }) {
  return (
    <article className="flex items-start gap-4 rounded-xl border border-slate-700 bg-slate-900 p-4 transition hover:border-slate-600">
      {cert.imageUrl ? (
        <img
          src={cert.imageUrl}
          alt={cert.title}
          className="h-16 w-16 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-2xl">
          🏆
        </div>
      )}
      <div>
        <h3 className="font-semibold text-slate-100">{cert.title}</h3>
        <p className="text-sm text-slate-400">{cert.issuer}</p>
        {cert.issueDate && (
          <p className="text-xs text-slate-500 mt-0.5">
            {new Date(cert.issueDate).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
          </p>
        )}
        {cert.credentialUrl && (
          <a
            href={cert.credentialUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-xs text-teal-400 hover:underline"
          >
            View Credential ↗
          </a>
        )}
      </div>
    </article>
  );
}

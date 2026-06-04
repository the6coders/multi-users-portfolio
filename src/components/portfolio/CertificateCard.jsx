// Inline SVG icons — no external icon library needed

function AwardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

export default function CertificateCard({ cert }) {
  return (
    <article
      className="
        group relative overflow-hidden
        rounded-2xl border border-slate-800
        bg-linear-to-br from-slate-900 via-slate-900 to-slate-950
        p-5
        shadow-lg shadow-black/20
        transition-all duration-500
        hover:-translate-y-2
        hover:border-teal-500/40
        hover:shadow-teal-500/10
      "
    >
      {/* Glow Effect */}
      <div
        className="
          absolute inset-0 opacity-0
          bg-linear-to-r from-teal-500/5 via-cyan-500/5 to-blue-500/5
          transition-opacity duration-500
          group-hover:opacity-100
        "
      />

      <div className="relative flex gap-4">
        {/* Certificate Image */}
        <div className="shrink-0">
          {cert.imageUrl ? (
            <img
              src={cert.imageUrl}
              alt={cert.title}
              className="
                h-20 w-20 rounded-xl object-cover
                border border-slate-700
                transition-transform duration-500
                group-hover:scale-105
              "
            />
          ) : (
            <div
              className="
                flex h-20 w-20 items-center justify-center
                rounded-xl
                bg-linear-to-br
                from-teal-500/20
                to-cyan-500/20
                text-teal-400
              "
            >
              <AwardIcon />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3
            className="
              text-lg font-bold
              text-white
              transition-colors
              group-hover:text-teal-300
            "
          >
            {cert.title}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className="
                rounded-full
                bg-teal-500/10
                px-3 py-1
                text-xs font-medium
                text-teal-300
                border border-teal-500/20
              "
            >
              {cert.issuer}
            </span>

            {cert.issueDate && (
              <span className="text-xs text-slate-400">
                {new Date(cert.issueDate).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                  }
                )}
              </span>
            )}
          </div>

          {cert.credentialUrl && (
            <a
              href={cert.credentialUrl}
              target="_blank"
              rel="noreferrer"
              className="
                mt-4 inline-flex items-center gap-2
                rounded-lg
                bg-teal-500 px-4 py-2
                text-sm font-medium text-white
                transition-all duration-300
                hover:bg-teal-400
                hover:shadow-lg hover:shadow-teal-500/30
              "
            >
              View Credential
              <ExternalLinkIcon />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

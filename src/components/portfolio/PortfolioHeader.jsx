export default function PortfolioHeader({ portfolio, owner }) {
  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-slate-800 p-8 md:p-14"
      style={{ borderTopColor: portfolio.themeColor, borderTopWidth: "3px" }}
    >
      {/* Decorative blob */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-10 blur-3xl"
        style={{ backgroundColor: portfolio.themeColor }}
      />

      <div className="relative flex flex-col gap-8 md:flex-row md:items-center">
        {/* Avatar */}
        {portfolio.profileImage ? (
          <img
            src={portfolio.profileImage}
            alt={owner?.name}
            className="h-32 w-32 shrink-0 rounded-full object-cover"
            style={{ boxShadow: `0 0 0 4px ${portfolio.themeColor}55` }}
          />
        ) : (
          <div
            className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full text-5xl font-bold text-white"
            style={{
              backgroundColor: `${portfolio.themeColor}22`,
              border: `2px solid ${portfolio.themeColor}55`,
            }}
          >
            {owner?.name?.[0]?.toUpperCase()}
          </div>
        )}

        {/* Info */}
        <div className="flex-1">
          <p
            className="text-sm font-medium uppercase tracking-widest"
            style={{ color: portfolio.themeColor }}
          >
            {portfolio.role}
          </p>
          <h1 className="mt-1 text-4xl font-bold text-white md:text-5xl">
            {owner?.name}
          </h1>
          <p className="mt-3 max-w-xl text-lg leading-relaxed text-slate-300">
            {portfolio.headline}
          </p>

          {/* Social Links */}
          <div className="mt-6 flex flex-wrap gap-3">
            {portfolio.github && (
              <SocialLink href={portfolio.github} label="GitHub" />
            )}
            {portfolio.linkedin && (
              <SocialLink href={portfolio.linkedin} label="LinkedIn" />
            )}
            {portfolio.website && (
              <SocialLink href={portfolio.website} label="Website" />
            )}
            {owner?.email && (
              <SocialLink href={`mailto:${owner.email}`} label="Email" />
            )}
            {portfolio.resumeUrl && (
              <>
                <a
                  href={`/api/media/resume/view/${portfolio.portfolioSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-600 bg-slate-800/60 px-4 py-1.5 text-sm text-slate-200 transition hover:border-teal-500 hover:text-teal-400"
                >
                  👁 View Resume
                </a>

                <a
                  href={`/api/media/resume/download/${portfolio.portfolioSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-teal-600 bg-teal-600/10 px-4 py-1.5 text-sm text-teal-300 transition hover:border-teal-400 hover:text-teal-200"
                >
                  📥 Download Resume
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialLink({ href, label }) {
  return (
    <a
      href={href}
      target={href.startsWith("mailto") ? undefined : "_blank"}
      rel="noreferrer"
      className="rounded-full border border-slate-600 px-5 py-2 text-sm text-slate-300 transition hover:border-teal-500 hover:text-teal-400"
    >
      {label}
    </a>
  );
}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../services/apiClient";
import { SkeletonCard } from "../components/common/Skeleton";

// ── Skeleton grid shown while loading ─────────────────────────
function PortfolioGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading portfolios">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// ── Individual portfolio card ──────────────────────────────────
function PortfolioCard({ portfolio: p }) {
  return (
    <article className="group flex flex-col rounded-xl border border-slate-800 bg-slate-900 p-4 transition-all duration-200 hover:border-teal-700 hover:bg-slate-800/60 hover:shadow-lg hover:shadow-teal-900/10">
      {p.profileImage ? (
        <img
          src={p.profileImage}
          alt={`${p.userId?.name ?? "Portfolio"} profile`}
          className="mb-3 h-40 w-full rounded-lg object-cover transition-transform duration-200 group-hover:scale-[1.01]"
        />
      ) : (
        <div
          className="mb-3 flex h-40 items-center justify-center rounded-lg bg-slate-800 text-4xl"
          aria-hidden="true"
        >
          👤
        </div>
      )}

      <div className="flex-1">
        <h2 className="text-lg font-semibold text-slate-100">{p.userId?.name ?? "Anonymous"}</h2>
        {(p.role || p.headline) && (
          <p className="mt-0.5 text-sm text-slate-400">{p.role || p.headline}</p>
        )}
        {p.skills?.length > 0 && (
          <p className="mt-2 text-xs text-slate-500">{p.skills.slice(0, 4).join(" · ")}</p>
        )}
      </div>

      <Link
        to={`/portfolio/${p.portfolioSlug}`}
        className="mt-4 inline-block self-start rounded-md bg-teal-500 px-3 py-1.5 text-sm font-medium text-slate-950 transition hover:bg-teal-400 focus-visible:outline-2 focus-visible:outline-teal-400"
        aria-label={`View ${p.userId?.name ?? "this"} portfolio`}
      >
        View Portfolio →
      </Link>
    </article>
  );
}

export default function Home() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient
      .get("/portfolios")
      .then((res) => setPortfolios(res.data.portfolios))
      .catch(() => setError("Failed to load portfolios."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <header className="mb-8">
        <h1 className="text-3xl font-bold sm:text-4xl">Discover Portfolios</h1>
        <p className="mt-2 text-slate-400">Browse public profiles and explore projects.</p>
      </header>

      {loading && <PortfolioGridSkeleton />}

      {error && !loading && (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-xl border border-red-900/40 bg-red-900/10 py-12 text-center"
        >
          <p className="text-2xl" aria-hidden="true">⚠️</p>
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              apiClient
                .get("/portfolios")
                .then((res) => setPortfolios(res.data.portfolios))
                .catch(() => setError("Failed to load portfolios."))
                .finally(() => setLoading(false));
            }}
            className="rounded-md border border-red-800 px-4 py-1.5 text-sm text-red-400 transition hover:bg-red-900/30 focus-visible:outline-2 focus-visible:outline-red-400"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && portfolios.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-700 py-16 text-center">
          <p className="text-4xl" aria-hidden="true">🚀</p>
          <p className="text-lg font-medium text-slate-300">No portfolios yet</p>
          <p className="text-sm text-slate-500">Be the first to create one!</p>
          <Link
            to="/register"
            className="mt-2 rounded-md bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-400 focus-visible:outline-2 focus-visible:outline-teal-400"
          >
            Get Started
          </Link>
        </div>
      )}

      {!loading && !error && portfolios.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {portfolios.map((p) => (
            <PortfolioCard key={p._id} portfolio={p} />
          ))}
        </div>
      )}
    </section>
  );
}

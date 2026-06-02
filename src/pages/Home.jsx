import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../services/apiClient";

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
        <h1 className="text-3xl font-bold sm:text-4xl">Discover Portfolio Members</h1>
        <p className="mt-2 text-slate-300">Browse public profiles and explore projects.</p>
      </header>

      {loading && (
        <p className="text-slate-400">Loading portfolios...</p>
      )}

      {error && (
        <p className="text-red-400">{error}</p>
      )}

      {!loading && !error && portfolios.length === 0 && (
        <p className="text-slate-400">No portfolios yet. Be the first to create one!</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {portfolios.map((p) => (
          <article key={p._id} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            {p.profileImage ? (
              <img
                src={p.profileImage}
                alt={p.userId?.name}
                className="mb-3 h-40 w-full rounded-lg object-cover"
              />
            ) : (
              <div className="mb-3 h-40 rounded-lg bg-slate-800" />
            )}
            <h2 className="text-lg font-semibold">{p.userId?.name}</h2>
            <p className="text-slate-300">{p.role || p.headline}</p>
            {p.skills?.length > 0 && (
              <p className="mt-2 text-sm text-slate-400">{p.skills.slice(0, 4).join(" • ")}</p>
            )}
            <Link
              to={`/portfolio/${p.portfolioSlug}`}
              className="mt-4 inline-block rounded-md bg-teal-500 px-3 py-1.5 font-medium text-slate-950 hover:bg-teal-400"
            >
              View Portfolio
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

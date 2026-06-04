import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import apiClient from "../services/apiClient";
import { SkeletonCard } from "../components/common/Skeleton";

// ── Constants ─────────────────────────────────────────────────
const SKILLS = [
  "React", "Vue.js", "Angular", "Next.js",
  "Node.js", "Express", "MongoDB", "PostgreSQL",
  "JavaScript", "TypeScript", "Python",
];

const ROLES = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "UI/UX Designer",
  "Data Scientist",
  "DevOps Engineer",
];

const SELECT_CLS =
  "rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 " +
  "transition focus:border-teal-500 focus:outline-none cursor-pointer";

// ── Sub-components ────────────────────────────────────────────

function PortfolioGridSkeleton({ count = 9 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading portfolios">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

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
          <div className="mt-2 flex flex-wrap gap-1">
            {p.skills.slice(0, 4).map((s) => (
              <span key={s} className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-500">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      <Link
        to={`/portfolio/${p.portfolioSlug}`}
        className="mt-4 inline-block self-start rounded-md bg-teal-500 px-3 py-1.5 text-sm font-medium text-slate-950 transition hover:bg-teal-400"
        aria-label={`View ${p.userId?.name ?? "this"} portfolio`}
      >
        View Portfolio →
      </Link>
    </article>
  );
}

function PaginationBar({ pagination, onPageChange }) {
  const { page, totalPages } = pagination;
  return (
    <nav
      className="mt-8 flex items-center justify-center gap-3"
      aria-label="Page navigation"
    >
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Previous page"
      >
        ← Previous
      </button>

      <span className="text-sm text-slate-400" aria-live="polite">
        Page{" "}
        <span className="font-semibold text-slate-200">{page}</span>
        {" "}of{" "}
        <span className="font-semibold text-slate-200">{totalPages}</span>
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Next page"
      >
        Next →
      </button>
    </nav>
  );
}

// ── Main component ────────────────────────────────────────────
export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive current values from URL (source of truth)
  const currentSearch = searchParams.get("search") || "";
  const currentSkill  = searchParams.get("skill")  || "";
  const currentRole   = searchParams.get("role")   || "";
  const currentSort   = searchParams.get("sort")   || "newest";
  const currentPage   = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  // Local search input (decoupled for debounce)
  const [searchInput, setSearchInput] = useState(currentSearch);
  const debounceRef = useRef(null);

  // Data state
  const [portfolios, setPortfolios] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1, limit: 9, totalItems: 0, totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [fetchKey, setFetchKey] = useState(0); // bump to force retry

  // Keep local search input in sync with URL (back/forward navigation)
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  // Fetch whenever URL params or fetchKey changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = { limit: 9, sort: currentSort };
    if (currentSearch) params.search = currentSearch;
    if (currentSkill)  params.skill  = currentSkill;
    if (currentRole)   params.role   = currentRole;
    if (currentPage > 1) params.page = currentPage;

    apiClient
      .get("/portfolios", { params })
      .then((res) => {
        if (cancelled) return;
        setPortfolios(res.data.portfolios ?? []);
        setPagination(
          res.data.pagination ?? { page: 1, limit: 9, totalItems: 0, totalPages: 1 }
        );
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load portfolios. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSearch, currentSkill, currentRole, currentSort, currentPage, fetchKey]);

  // ── Handlers ──────────────────────────────────────────────

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          val.trim() ? next.set("search", val.trim()) : next.delete("search");
          next.set("page", "1");
          return next;
        },
        { replace: true }
      );
    }, 350);
  };

  const setFilter = (key, val) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      val ? next.set(key, val) : next.delete(key);
      next.set("page", "1");
      return next;
    });
  };

  const handlePageChange = (newPage) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(newPage));
      return next;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearAll = () => {
    setSearchInput("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchParams({});
  };

  const hasFilters =
    Boolean(currentSearch || currentSkill || currentRole) ||
    currentSort !== "newest";

  // ── Render ────────────────────────────────────────────────

  return (
    <section>
      {/* ── Page header ───────────────────────── */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold sm:text-4xl">Discover Portfolios</h1>
        <p className="mt-2 text-slate-400">
          Browse talented professionals and explore their projects.
        </p>
      </header>

      {/* ── Search + Filters panel ────────────── */}
      <div className="mb-6 space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
        {/* Search input */}
        <div className="relative">
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm"
            aria-hidden="true"
          >
            🔍
          </span>
          <input
            type="search"
            placeholder="Search by name, role, or headline…"
            value={searchInput}
            onChange={handleSearchChange}
            className="w-full rounded-md border border-slate-700 bg-slate-800 py-2 pl-9 pr-4 text-slate-100 placeholder-slate-500 transition focus:border-teal-500 focus:outline-none"
            aria-label="Search portfolios"
          />
        </div>

        {/* Dropdowns row */}
        <div className="flex flex-wrap gap-2">
          <label className="sr-only" htmlFor="filter-skill">Filter by skill</label>
          <select
            id="filter-skill"
            value={currentSkill}
            onChange={(e) => setFilter("skill", e.target.value)}
            className={SELECT_CLS}
          >
            <option value="">All Skills</option>
            {SKILLS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <label className="sr-only" htmlFor="filter-role">Filter by role</label>
          <select
            id="filter-role"
            value={currentRole}
            onChange={(e) => setFilter("role", e.target.value)}
            className={SELECT_CLS}
          >
            <option value="">All Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <label className="sr-only" htmlFor="filter-sort">Sort by</label>
          <select
            id="filter-sort"
            value={currentSort}
            onChange={(e) => {
              const val = e.target.value;
              setFilter("sort", val === "newest" ? "" : val);
            }}
            className={SELECT_CLS}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="alphabetical">A–Z</option>
          </select>

          {hasFilters && (
            <button
              onClick={clearAll}
              className="rounded-md border border-slate-600 px-3 py-2 text-xs text-slate-400 transition hover:border-slate-400 hover:text-slate-200"
              aria-label="Clear all filters"
            >
              ✕ Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Results count bar ─────────────────── */}
      {!loading && !error && (
        <p className="mb-4 text-sm text-slate-500" aria-live="polite">
          {pagination.totalItems === 0 ? (
            "No portfolios found"
          ) : (
            <>
              {pagination.totalItems.toLocaleString()}{" "}
              portfolio{pagination.totalItems !== 1 ? "s" : ""} found
              {hasFilters && (
                <button
                  onClick={clearAll}
                  className="ml-2 text-teal-500 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </>
          )}
        </p>
      )}

      {/* ── Loading skeleton ──────────────────── */}
      {loading && <PortfolioGridSkeleton count={9} />}

      {/* ── Error state ───────────────────────── */}
      {!loading && error && (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-xl border border-red-900/40 bg-red-900/10 py-12 text-center"
        >
          <p className="text-2xl" aria-hidden="true">⚠️</p>
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => setFetchKey((k) => k + 1)}
            className="rounded-md border border-red-800 px-4 py-1.5 text-sm text-red-400 transition hover:bg-red-900/30"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Empty state ───────────────────────── */}
      {!loading && !error && portfolios.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-700 py-16 text-center">
          <p className="text-4xl" aria-hidden="true">
            {hasFilters ? "🔍" : "🚀"}
          </p>
          <p className="text-lg font-medium text-slate-300">
            {hasFilters
              ? "No portfolios match your search"
              : "No portfolios yet"}
          </p>
          {hasFilters ? (
            <>
              <p className="text-sm text-slate-500">
                Try adjusting your filters or search terms.
              </p>
              <button
                onClick={clearAll}
                className="mt-2 rounded-md border border-slate-600 px-4 py-2 text-sm text-slate-400 transition hover:border-slate-400 hover:text-slate-200"
              >
                Clear All Filters
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-500">Be the first to create one!</p>
              <Link
                to="/register"
                className="mt-2 rounded-md bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-400"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}

      {/* ── Portfolio grid ────────────────────── */}
      {!loading && !error && portfolios.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {portfolios.map((p) => (
              <PortfolioCard key={p._id} portfolio={p} />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <PaginationBar
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </section>
  );
}


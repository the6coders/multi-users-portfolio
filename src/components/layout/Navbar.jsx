import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <Link to="/" className="shrink-0 text-base font-bold tracking-wide text-teal-300 sm:text-lg">
          PortfolioHub
        </Link>

        <nav aria-label="Main navigation" className="flex min-w-0 items-center gap-2 text-sm sm:gap-4">
          {/* Home link */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "text-teal-300" : "text-slate-300 hover:text-white"
            }
          >
            Home
          </NavLink>

          {user ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  isActive ? "text-teal-300" : "text-slate-300 hover:text-white"
                }
              >
                Dashboard
              </NavLink>
              <button
                type="button"
                onClick={logout}
                className="rounded-md border border-slate-700 px-2.5 py-1.5 text-xs text-slate-200 transition hover:border-slate-500 hover:text-white focus-visible:ring-2 focus-visible:ring-teal-400 sm:px-3 sm:text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive ? "text-teal-300" : "text-slate-300 hover:text-white"
                }
              >
                Login
              </NavLink>
              <Link
                to="/register"
                className="rounded-md bg-teal-500 px-2.5 py-1.5 text-xs font-medium text-slate-950 transition hover:bg-teal-400 focus-visible:ring-2 focus-visible:ring-teal-400 sm:px-3 sm:text-sm"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

import { NavLink, Outlet } from "react-router-dom";

export default function DashboardLayout() {
  const links = [
    { to: "/dashboard", label: "Overview" },
    { to: "/", label: "Public Site" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Mobile: horizontal top nav bar */}
        <nav className="mb-4 flex gap-2 rounded-xl border border-slate-800 bg-slate-900 p-2 lg:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/dashboard"}
              className={({ isActive }) =>
                `flex-1 rounded-lg px-3 py-2 text-center text-sm transition ${
                  isActive
                    ? "bg-teal-500/20 text-teal-300"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop: sidebar + content grid */}
        <div className="grid min-h-[calc(100vh-8rem)] gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="hidden rounded-2xl border border-slate-800 bg-slate-900 p-4 lg:block">
            <h2 className="mb-4 text-lg font-semibold">Dashboard</h2>
            <nav className="space-y-2">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/dashboard"}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 text-sm transition ${
                      isActive
                        ? "bg-teal-500/20 text-teal-300"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <main className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

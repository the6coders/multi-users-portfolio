import { NavLink, Outlet } from "react-router-dom";

export default function DashboardLayout() {
  const links = [
    { to: "/dashboard", label: "Overview" },
    { to: "/", label: "Public Site" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
        <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
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

        <main className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

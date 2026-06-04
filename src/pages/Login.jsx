import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import apiClient from "../services/apiClient";

function Spinner() {
  return (
    <svg
      className="mr-2 inline h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post("/auth/login", form);
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h1 className="text-2xl font-bold">Login</h1>
      <p className="mt-1 text-sm text-slate-400">Sign in to manage your portfolio.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-300">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 transition focus:border-teal-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-300">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 transition focus:border-teal-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          />
        </div>

        {error && (
          <p className="rounded-md bg-red-900/40 px-3 py-2 text-sm text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="w-full rounded-md bg-teal-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-teal-400 focus-visible:ring-2 focus-visible:ring-teal-400 disabled:opacity-60"
        >
          {loading && <Spinner />}
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="text-teal-400 hover:underline focus-visible:ring-1 focus-visible:ring-teal-400 rounded-sm">
          Register
        </Link>
      </p>
    </section>
  );
}

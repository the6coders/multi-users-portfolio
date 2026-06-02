import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import apiClient from "../services/apiClient";

// ─── Validation helpers ───────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PW_LEN = 8;

function validate({ name, username, email, password, confirmPassword }) {
  if (!name.trim()) return "Full name is required.";
  if (!username.trim()) return "Username is required.";
  if (!email.trim()) return "Email is required.";
  if (!EMAIL_RE.test(email)) return "Please enter a valid email address.";
  if (!password) return "Password is required.";
  if (password.length < MIN_PW_LEN)
    return `Password must be at least ${MIN_PW_LEN} characters.`;
  if (password !== confirmPassword) return "Passwords do not match.";
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { name, username, email, password } = form;
      const res = await apiClient.post("/auth/register", {
        name,
        username,
        email,
        password,
      });

      // Auto-login using the token returned by the register endpoint
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h1 className="text-2xl font-bold">Create Account</h1>
      <p className="mt-1 text-sm text-slate-400">
        Join PortfolioHub and build your public portfolio.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        {/* Full Name */}
        <div>
          <label
            htmlFor="fullName"
            className="mb-1 block text-sm font-medium text-slate-300"
          >
            Full Name
          </label>
          <input
            id="fullName"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={form.fullName}
            onChange={handleChange}
            placeholder="Jane Doe"
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
          />
        </div>

        {/* Username */}
        <div>
          <label
            htmlFor="username"
            className="mb-1 block text-sm font-medium text-slate-300"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            value={form.username}
            onChange={handleChange}
            placeholder="janedoe"
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-slate-300"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-slate-300"
          >
            Password
            <span className="ml-1 text-slate-500">(min. 8 characters)</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1 block text-sm font-medium text-slate-300"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="rounded-md bg-red-900/40 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-teal-500 px-4 py-2 font-semibold text-slate-950 hover:bg-teal-400 disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link to="/login" className="text-teal-400 hover:underline">
          Log in
        </Link>
      </p>
    </section>
  );
}

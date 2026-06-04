import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import apiClient from "../services/apiClient";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ name, username, email, password, confirmPassword }) {
  if (!name.trim())          return "Full name is required.";
  if (!username.trim())      return "Username is required.";
  if (!email.trim())         return "Email is required.";
  if (!EMAIL_RE.test(email)) return "Please enter a valid email address.";
  if (!password)             return "Password is required.";
  if (password.length < 8)   return "Password must be at least 8 characters.";
  if (password !== confirmPassword) return "Passwords do not match.";
  return null;
}

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
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error on change
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setServerError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run all validations and collect per-field errors
    const fieldErrors = {};
    if (!form.name.trim())          fieldErrors.name = "Full name is required.";
    if (!form.username.trim())      fieldErrors.username = "Username is required.";
    if (!form.email.trim())         fieldErrors.email = "Email is required.";
    else if (!EMAIL_RE.test(form.email)) fieldErrors.email = "Please enter a valid email address.";
    if (!form.password)             fieldErrors.password = "Password is required.";
    else if (form.password.length < 8)  fieldErrors.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword)
      fieldErrors.confirmPassword = "Passwords do not match.";

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    setServerError(null);
    try {
      const { name, username, email, password } = form;
      const res = await apiClient.post("/auth/register", { name, username, email, password });
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message;
      setServerError(
        msg === "Email already in use"
          ? "An account with that email already exists."
          : msg === "Username already taken"
          ? "That username is taken. Please choose another."
          : msg || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="mx-auto w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8"
      aria-labelledby="register-heading"
    >
      <h1 id="register-heading" className="text-2xl font-bold text-slate-100">
        Create Account
      </h1>
      <p className="mt-1 text-sm text-slate-400">
        Join PortfolioHub and build your public portfolio.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        {/* Full Name */}
        <Field
          id="name"
          label="Full Name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Jane Doe"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
        />

        {/* Username */}
        <Field
          id="username"
          label="Username"
          name="username"
          type="text"
          autoComplete="username"
          placeholder="janedoe"
          value={form.username}
          onChange={handleChange}
          error={errors.username}
        />

        {/* Email */}
        <Field
          id="email"
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />

        {/* Password */}
        <Field
          id="password"
          label={
            <>
              Password{" "}
              <span className="font-normal text-slate-500">(min. 8 characters)</span>
            </>
          }
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />

        {/* Confirm Password */}
        <Field
          id="confirmPassword"
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        {/* Server error */}
        {serverError && (
          <p role="alert" className="rounded-md bg-red-900/40 px-3 py-2 text-sm text-red-400">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="w-full rounded-md bg-teal-500 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-teal-400 focus-visible:ring-2 focus-visible:ring-teal-400 disabled:opacity-60"
        >
          {loading && <Spinner />}
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link to="/login" className="text-teal-400 hover:underline focus-visible:ring-1 focus-visible:ring-teal-400 rounded-sm">
          Log in
        </Link>
      </p>
    </section>
  );
}

function Field({ id, label, name, type, autoComplete, placeholder, value, onChange, error }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-300">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded-md border bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
          error ? "border-red-500" : "border-slate-700 focus:border-teal-500"
        }`}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

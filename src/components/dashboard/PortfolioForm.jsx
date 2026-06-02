import { useState } from "react";

const EMPTY = {
  headline: "",
  role: "",
  bio: "",
  skills: "",
  github: "",
  linkedin: "",
  website: "",
  themeColor: "#14b8a6",
  isPublic: true,
};

function toFormState(portfolio) {
  if (!portfolio) return EMPTY;
  return {
    headline: portfolio.headline || "",
    role: portfolio.role || "",
    bio: portfolio.bio || "",
    skills: (portfolio.skills || []).join(", "),
    github: portfolio.github || "",
    linkedin: portfolio.linkedin || "",
    website: portfolio.website || "",
    themeColor: portfolio.themeColor || "#14b8a6",
    isPublic: portfolio.isPublic !== false,
  };
}

export default function PortfolioForm({
  initialData = null,
  onSubmit,
  onCancel,
  loading,
  submitLabel = "Save",
}) {
  const [form, setForm] = useState(() => toFormState(initialData));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      skills: form.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Headline"
          name="headline"
          value={form.headline}
          onChange={handleChange}
          placeholder="e.g. Full-Stack Developer & UI Enthusiast"
        />
        <Field
          label="Role"
          name="role"
          value={form.role}
          onChange={handleChange}
          placeholder="e.g. Full-Stack Engineer"
        />
      </div>
      <Field
        label="Bio"
        name="bio"
        value={form.bio}
        onChange={handleChange}
        placeholder="Write a short bio about yourself..."
        multiline
      />
      <Field
        label="Skills (comma-separated)"
        name="skills"
        value={form.skills}
        onChange={handleChange}
        placeholder="React, Node.js, TypeScript, Docker"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="GitHub URL"
          name="github"
          value={form.github}
          onChange={handleChange}
          placeholder="https://github.com/username"
        />
        <Field
          label="LinkedIn URL"
          name="linkedin"
          value={form.linkedin}
          onChange={handleChange}
          placeholder="https://linkedin.com/in/username"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Website"
          name="website"
          value={form.website}
          onChange={handleChange}
          placeholder="https://yoursite.com"
        />
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">
            Theme Color
          </label>
          <input
            type="color"
            name="themeColor"
            value={form.themeColor}
            onChange={handleChange}
            className="h-10 w-16 cursor-pointer rounded border border-slate-700 bg-slate-800 p-1"
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            name="isPublic"
            checked={form.isPublic}
            onChange={handleChange}
            className="h-4 w-4 accent-teal-500"
          />
          Public portfolio
        </label>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-teal-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-teal-400 disabled:opacity-60"
        >
          {loading ? "Saving..." : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-md border border-slate-700 px-5 py-2 text-sm text-slate-300 hover:border-slate-500 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function Field({ label, name, value, onChange, placeholder, multiline }) {
  const cls =
    "w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none";
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-xs font-medium text-slate-400">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={name}
          name={name}
          rows={4}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={cls}
        />
      ) : (
        <input
          id={name}
          name={name}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}

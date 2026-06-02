import { useState } from "react";
import ImageUploader from "../common/ImageUploader";

const EMPTY = {
  title: "",
  description: "",
  techStack: "",
  imageUrl: "",
  liveUrl: "",
  githubUrl: "",
  featured: false,
};

function toFormState(project) {
  if (!project) return EMPTY;
  return {
    title: project.title || "",
    description: project.description || "",
    techStack: (project.techStack || []).join(", "),
    imageUrl: project.imageUrl || "",
    liveUrl: project.liveUrl || "",
    githubUrl: project.githubUrl || "",
    featured: project.featured || false,
  };
}

export default function ProjectForm({
  initialData = null,
  onSubmit,
  onCancel,
  loading,
  submitLabel = "Save Project",
}) {
  const [form, setForm] = useState(() => toFormState(initialData));
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(
      {
        ...form,
        techStack: form.techStack
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      },
      imageFile
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-slate-700 bg-slate-800/40 p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Title *"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. PortfolioHub"
          required
        />
        <Field
          label="Tech Stack (comma-separated)"
          name="techStack"
          value={form.techStack}
          onChange={handleChange}
          placeholder="React, Node.js, MongoDB"
        />
      </div>
      <Field
        label="Description *"
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="What does this project do and what problem does it solve?"
        multiline
        required
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Live URL"
          name="liveUrl"
          value={form.liveUrl}
          onChange={handleChange}
          placeholder="https://myproject.com"
        />
        <Field
          label="GitHub URL"
          name="githubUrl"
          value={form.githubUrl}
          onChange={handleChange}
          placeholder="https://github.com/user/repo"
        />
      </div>
      {/* Image upload — replaces the old URL field */}
      <ImageUploader
        initialUrl={form.imageUrl}
        label="Project Image (JPG/PNG/WEBP · max 5 MB)"
        shape="square"
        onFileSelect={(file) => setImageFile(file)}
        onRemove={() => {
          setImageFile(null);
          setForm((prev) => ({ ...prev, imageUrl: "" }));
        }}
        disabled={loading}
      />
      <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          name="featured"
          checked={form.featured}
          onChange={handleChange}
          className="h-4 w-4 accent-teal-500"
        />
        Mark as featured project
      </label>
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-teal-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-teal-400 disabled:opacity-60"
        >
          {loading ? "Saving..." : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-md border border-slate-700 px-5 py-2 text-sm text-slate-300 hover:border-slate-500 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({ label, name, value, onChange, placeholder, multiline, required }) {
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
          rows={3}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
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
          required={required}
          className={cls}
        />
      )}
    </div>
  );
}

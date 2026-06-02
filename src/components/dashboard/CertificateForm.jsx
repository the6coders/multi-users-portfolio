import { useState } from "react";
import ImageUploader from "../common/ImageUploader";

const EMPTY = {
  title: "",
  issuer: "",
  issueDate: "",
  credentialUrl: "",
};

function toFormState(cert) {
  if (!cert) return EMPTY;
  return {
    title: cert.title || "",
    issuer: cert.issuer || "",
    issueDate: cert.issueDate
      ? new Date(cert.issueDate).toISOString().split("T")[0]
      : "",
    credentialUrl: cert.credentialUrl || "",
  };
}

/**
 * Form for creating/editing a certificate.
 * Calls onSubmit(data, imageFile) on submit.
 */
export default function CertificateForm({
  initialData = null,
  onSubmit,
  onCancel,
  loading,
  submitLabel = "Save Certificate",
}) {
  const [form, setForm] = useState(() => toFormState(initialData));
  const [imageFile, setImageFile] = useState(null);
  const [clearImage, setClearImage] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(
      {
        ...form,
        issueDate: form.issueDate ? new Date(form.issueDate) : null,
        // If user explicitly removed the image without picking a new one, clear it
        ...(clearImage && !imageFile ? { imageUrl: "" } : {}),
      },
      imageFile
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-slate-700 bg-slate-800/40 p-5"
    >
      {/* Image upload */}
      <ImageUploader
        initialUrl={initialData?.imageUrl || ""}
        label="Certificate Image (optional)"
        shape="square"
        maxMB={5}
        onFileSelect={(file) => {
          setImageFile(file);
          setClearImage(false);
        }}
        onRemove={() => {
          setImageFile(null);
          setClearImage(true);
        }}
        disabled={loading}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Title *"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. AWS Certified Solutions Architect"
          required
        />
        <Field
          label="Issuer *"
          name="issuer"
          value={form.issuer}
          onChange={handleChange}
          placeholder="e.g. Amazon Web Services"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">
            Issue Date
          </label>
          <input
            type="date"
            name="issueDate"
            value={form.issueDate}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-teal-500 focus:outline-none"
          />
        </div>
        <Field
          label="Credential URL"
          name="credentialUrl"
          value={form.credentialUrl}
          onChange={handleChange}
          placeholder="https://credential.link"
        />
      </div>

      <div className="flex gap-3 pt-1">
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

function Field({ label, name, value, onChange, placeholder, required }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-xs font-medium text-slate-400">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
      />
    </div>
  );
}

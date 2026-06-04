import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import apiClient from "../services/apiClient";
import PortfolioForm from "../components/dashboard/PortfolioForm";
import ProjectForm from "../components/dashboard/ProjectForm";
import ProjectCard from "../components/dashboard/ProjectCard";
import DeleteModal from "../components/dashboard/DeleteModal";
import CertificateForm from "../components/dashboard/CertificateForm";
import DashboardCertCard from "../components/dashboard/DashboardCertCard";
import MediaSection from "../components/dashboard/MediaSection";
import Toast from "../components/common/Toast";
import { SkeletonCard } from "../components/common/Skeleton";

export default function Dashboard() {
  const { user } = useAuth();

  // Data
  const [portfolio, setPortfolio] = useState(null);
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [editingPortfolio, setEditingPortfolio] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showAddProject, setShowAddProject] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [showAddCert, setShowAddCert] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type, id? }
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Analytics
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = useCallback(async () => {
    if (!user?.portfolioSlug) { setLoading(false); return; }
    try {
      const [pRes, prRes, certRes] = await Promise.all([
        apiClient.get(`/portfolios/${user.portfolioSlug}`),
        apiClient.get(`/projects/${user.portfolioSlug}`),
        apiClient.get(`/certificates/${user.portfolioSlug}`),
      ]);
      setPortfolio(pRes.data.portfolio);
      setProjects(prRes.data.projects);
      setCertificates(certRes.data.certificates);
    } catch {
      // 404 = no portfolio yet, that's fine
      setPortfolio(null);
      setProjects([]);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  }, [user?.portfolioSlug]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Fetch analytics summary whenever the portfolio slug is available
  useEffect(() => {
    if (!user?.portfolioSlug) { setAnalyticsLoading(false); return; }
    setAnalyticsLoading(true);
    apiClient.get("/analytics/summary")
      .then((res) => setAnalytics(res.data))
      .catch(() => setAnalytics(null))
      .finally(() => setAnalyticsLoading(false));
  }, [user?.portfolioSlug]);

  // ── Portfolio CRUD ───────────────────────────────────────────────
  const handleCreatePortfolio = async (data) => {
    setActionLoading(true);
    try {
      const res = await apiClient.post("/portfolios", data);
      setPortfolio(res.data.portfolio);
      showToast("Portfolio created successfully!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create portfolio.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePortfolio = async (data) => {
    setActionLoading(true);
    try {
      const res = await apiClient.patch("/portfolios", data);
      setPortfolio(res.data.portfolio);
      setEditingPortfolio(false);
      showToast("Portfolio updated!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update portfolio.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePortfolio = async () => {
    setActionLoading(true);
    try {
      await apiClient.delete("/portfolios");
      setPortfolio(null);
      setProjects([]);
      setCertificates([]);
      setDeleteTarget(null);
      setEditingPortfolio(false);
      showToast("Portfolio deleted.");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Project CRUD ─────────────────────────────────────────────────
  const handleCreateProject = async (data, imageFile) => {
    setActionLoading(true);
    try {
      const res = await apiClient.post("/projects", { ...data, portfolioId: portfolio._id });
      let project = res.data.project;
      if (imageFile) {
        try {
          const fd = new FormData();
          fd.append("file", imageFile);
          const imgRes = await apiClient.post(`/media/project-image/${project._id}`, fd);
          project = { ...project, imageUrl: imgRes.data.url };
        } catch {
          showToast("Project created but image upload failed.", "error");
        }
      }
      setProjects((prev) => [project, ...prev]);
      setShowAddProject(false);
      showToast("Project added!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add project.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateProject = async (data, imageFile) => {
    setActionLoading(true);
    try {
      const res = await apiClient.patch(`/projects/${editingProject._id}`, data);
      let project = res.data.project;
      if (imageFile) {
        try {
          const fd = new FormData();
          fd.append("file", imageFile);
          const imgRes = await apiClient.post(`/media/project-image/${project._id}`, fd);
          project = { ...project, imageUrl: imgRes.data.url };
        } catch {
          showToast("Project updated but image upload failed.", "error");
        }
      }
      setProjects((prev) =>
        prev.map((p) => (p._id === editingProject._id ? project : p))
      );
      setEditingProject(null);
      showToast("Project updated!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update project.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    setActionLoading(true);
    try {
      await apiClient.delete(`/projects/${deleteTarget.id}`);
      setProjects((prev) => prev.filter((p) => p._id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast("Project deleted.");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Certificate CRUD ─────────────────────────────────────────────
  const handleCreateCertificate = async (data, imageFile) => {
    setActionLoading(true);
    try {
      const res = await apiClient.post("/certificates", data);
      let cert = res.data.certificate;
      if (imageFile) {
        try {
          const fd = new FormData();
          fd.append("file", imageFile);
          const imgRes = await apiClient.post(`/media/certificate-image/${cert._id}`, fd);
          cert = { ...cert, imageUrl: imgRes.data.url };
        } catch {
          showToast("Certificate created but image upload failed.", "error");
        }
      }
      setCertificates((prev) => [cert, ...prev]);
      setShowAddCert(false);
      showToast("Certificate added!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add certificate.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCertificate = async (data, imageFile) => {
    setActionLoading(true);
    try {
      const res = await apiClient.patch(`/certificates/${editingCert._id}`, data);
      let cert = res.data.certificate;
      if (imageFile) {
        try {
          const fd = new FormData();
          fd.append("file", imageFile);
          const imgRes = await apiClient.post(`/media/certificate-image/${cert._id}`, fd);
          cert = { ...cert, imageUrl: imgRes.data.url };
        } catch {
          showToast("Certificate updated but image upload failed.", "error");
        }
      }
      setCertificates((prev) =>
        prev.map((c) => (c._id === editingCert._id ? cert : c))
      );
      setEditingCert(null);
      showToast("Certificate updated!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update certificate.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCertificate = async () => {
    setActionLoading(true);
    try {
      await apiClient.delete(`/certificates/${deleteTarget.id}`);
      setCertificates((prev) => prev.filter((c) => c._id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast("Certificate deleted.");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <section className="space-y-8">
      {/* ── Welcome ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name} 👋</h1>
          <p className="mt-1 text-sm text-slate-400">{user?.email}</p>
        </div>
        {portfolio && (
          <Link
            to={`/portfolio/${portfolio.portfolioSlug}`}
            className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-teal-500 hover:text-teal-400"
          >
            View Public Page →
          </Link>
        )}
      </div>

      {/* ── Analytics ────────────────────────────────────────────── */}
      {portfolio && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 text-lg font-semibold">Analytics</h2>
          {analyticsLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-slate-800 bg-slate-800/50 p-5 h-24" />
              ))}
            </div>
          ) : analytics ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon="👁" label="Portfolio Views"    value={analytics.portfolioViews   ?? 0} />
              <StatCard icon="📄" label="Resume Downloads"  value={analytics.resumeDownloads  ?? 0} />
              <StatCard icon="🚀" label="Project Clicks"    value={analytics.projectClicks    ?? 0} />
              <StatCard icon="🏆" label="Certificate Views" value={analytics.certificateViews ?? 0} />
            </div>
          ) : (
            <p className="text-sm text-slate-500">Analytics unavailable.</p>
          )}
        </section>
      )}

      {/* ── Portfolio Section ─────────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Portfolio</h2>
          {portfolio && !editingPortfolio && (
            <div className="flex gap-2">
              <button
                onClick={() => setEditingPortfolio(true)}
                className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:border-teal-500 hover:text-teal-400"
              >
                Edit
              </button>
              <button
                onClick={() => setDeleteTarget({ type: "portfolio" })}
                className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:border-red-500 hover:text-red-400"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {!portfolio ? (
          /* Create mode */
          <>
            <p className="mb-5 text-sm text-slate-400">
              You don&apos;t have a portfolio yet. Fill in the details below to create one.
            </p>
            <PortfolioForm
              onSubmit={handleCreatePortfolio}
              loading={actionLoading}
              submitLabel="Create Portfolio"
            />
          </>
        ) : editingPortfolio ? (
          /* Edit mode */
          <PortfolioForm
            initialData={portfolio}
            onSubmit={handleUpdatePortfolio}
            onCancel={() => setEditingPortfolio(false)}
            loading={actionLoading}
            submitLabel="Save Changes"
          />
        ) : (
          /* Summary view */
          <div className="space-y-4">
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <InfoRow label="Headline" value={portfolio.headline} />
              <InfoRow label="Role" value={portfolio.role} />
              <InfoRow label="Slug" value={`/${portfolio.portfolioSlug}`} />
              <InfoRow
                label="Visibility"
                value={portfolio.isPublic ? "Public" : "Private"}
                valueClass={portfolio.isPublic ? "text-teal-400" : "text-yellow-400"}
              />
              {portfolio.bio && (
                <div className="sm:col-span-2">
                  <InfoRow label="Bio" value={portfolio.bio} />
                </div>
              )}
            </div>
            {portfolio.skills?.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {portfolio.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-3 pt-1 text-xs">
              {portfolio.github && (
                <a href={portfolio.github} target="_blank" rel="noreferrer" className="text-teal-400 hover:underline">GitHub ↗</a>
              )}
              {portfolio.linkedin && (
                <a href={portfolio.linkedin} target="_blank" rel="noreferrer" className="text-teal-400 hover:underline">LinkedIn ↗</a>
              )}
              {portfolio.website && (
                <a href={portfolio.website} target="_blank" rel="noreferrer" className="text-teal-400 hover:underline">Website ↗</a>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── Media Section (profile image + resume) ─────────────────── */}
      {portfolio && (
        <MediaSection
          portfolio={portfolio}
          onPortfolioChange={(patch) =>
            setPortfolio((prev) => ({ ...prev, ...patch }))
          }
          showToast={showToast}
        />
      )}

      {/* ── Projects Section ──────────────────────────────────────── */}
      {portfolio && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Projects</h2>
              <p className="text-xs text-slate-500 mt-0.5">{projects.length} total</p>
            </div>
            {!showAddProject && !editingProject && (
              <button
                onClick={() => setShowAddProject(true)}
                className="rounded-md bg-teal-500 px-4 py-1.5 text-xs font-semibold text-slate-950 hover:bg-teal-400"
              >
                + Add Project
              </button>
            )}
          </div>

          {/* Add project form */}
          {showAddProject && (
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-medium text-slate-300">New Project</h3>
              <ProjectForm
                onSubmit={handleCreateProject}
                onCancel={() => setShowAddProject(false)}
                loading={actionLoading}
                submitLabel="Add Project"
              />
            </div>
          )}

          {/* Project list */}
          {projects.length === 0 && !showAddProject ? (
            <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center">
              <p className="text-2xl">💡</p>
              <p className="mt-2 text-sm text-slate-400">No projects yet. Add your first one!</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {projects.map((project) =>
                editingProject?._id === project._id ? (
                  <li key={project._id}>
                    <p className="mb-3 text-sm font-medium text-slate-300">
                      Editing: <span className="text-teal-400">{project.title}</span>
                    </p>
                    <ProjectForm
                      initialData={editingProject}
                      onSubmit={handleUpdateProject}
                      onCancel={() => setEditingProject(null)}
                      loading={actionLoading}
                      submitLabel="Save Changes"
                    />
                  </li>
                ) : (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    onEdit={() => {
                      setShowAddProject(false);
                      setEditingProject(project);
                    }}
                    onDelete={() => setDeleteTarget({ type: "project", id: project._id })}
                  />
                )
              )}
            </ul>
          )}
        </section>
      )}

      {/* ── Certificates Section ────────────────────────────────────── */}
      {portfolio && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Certificates</h2>
              <p className="text-xs text-slate-500 mt-0.5">{certificates.length} total</p>
            </div>
            {!showAddCert && !editingCert && (
              <button
                onClick={() => setShowAddCert(true)}
                className="rounded-md bg-teal-500 px-4 py-1.5 text-xs font-semibold text-slate-950 hover:bg-teal-400"
              >
                + Add Certificate
              </button>
            )}
          </div>

          {showAddCert && (
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-medium text-slate-300">New Certificate</h3>
              <CertificateForm
                onSubmit={handleCreateCertificate}
                onCancel={() => setShowAddCert(false)}
                loading={actionLoading}
                submitLabel="Add Certificate"
              />
            </div>
          )}

          {certificates.length === 0 && !showAddCert ? (
            <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center">
              <p className="text-2xl">🏅</p>
              <p className="mt-2 text-sm text-slate-400">
                No certificates yet. Add your first achievement!
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {certificates.map((cert) =>
                editingCert?._id === cert._id ? (
                  <li key={cert._id}>
                    <p className="mb-3 text-sm font-medium text-slate-300">
                      Editing: <span className="text-teal-400">{cert.title}</span>
                    </p>
                    <CertificateForm
                      initialData={editingCert}
                      onSubmit={handleUpdateCertificate}
                      onCancel={() => setEditingCert(null)}
                      loading={actionLoading}
                      submitLabel="Save Changes"
                    />
                  </li>
                ) : (
                  <DashboardCertCard
                    key={cert._id}
                    cert={cert}
                    onEdit={() => {
                      setShowAddCert(false);
                      setEditingCert(cert);
                    }}
                    onDelete={() =>
                      setDeleteTarget({ type: "certificate", id: cert._id })
                    }
                  />
                )
              )}
            </ul>
          )}
        </section>
      )}

      {/* ── Delete Modal ──────────────────────────────────────────── */}
      {deleteTarget && (
        <DeleteModal
          title={
            deleteTarget.type === "portfolio"
              ? "Delete Portfolio?"
              : deleteTarget.type === "project"
              ? "Delete Project?"
              : "Delete Certificate?"
          }
          message={
            deleteTarget.type === "portfolio"
              ? "This will permanently delete your portfolio and all associated projects."
              : deleteTarget.type === "project"
              ? "This project will be permanently removed."
              : "This certificate will be permanently removed."
          }
          loading={actionLoading}
          onConfirm={
            deleteTarget.type === "portfolio"
              ? handleDeletePortfolio
              : deleteTarget.type === "project"
              ? handleDeleteProject
              : handleDeleteCertificate
          }
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* ── Toast ─────────────────────────────────────────────────── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </section>
  );
}

function InfoRow({ label, value, valueClass = "text-slate-300" }) {
  return (
    <p>
      <span className="text-slate-500">{label}: </span>
      <span className={valueClass}>{value || "—"}</span>
    </p>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-5 text-center">
      <p className="text-3xl">{icon}</p>
      <p className="mt-2 text-2xl font-bold text-slate-100">{value.toLocaleString()}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
    </div>
  );
}

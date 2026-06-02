import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import apiClient from "../services/apiClient";
import PortfolioHeader from "../components/portfolio/PortfolioHeader";
import CertificateCard from "../components/portfolio/CertificateCard";

export default function Portfolio() {
  const { slug } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [pRes, prRes, certRes] = await Promise.all([
          apiClient.get(`/portfolios/${slug}`),
          apiClient.get(`/projects/${slug}`),
          apiClient.get(`/certificates/${slug}`),
        ]);
        setPortfolio(pRes.data.portfolio);
        setProjects(prRes.data.projects);
        setCertificates(certRes.data.certificates);
      } catch (err) {
        setError(err.response?.data?.message || "Portfolio not found.");
        setCertificates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [slug]);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-center">
        <div>
          <p className="text-6xl font-bold text-slate-700">404</p>
          <h1 className="mt-4 text-2xl font-bold text-slate-200">Portfolio not found</h1>
          <p className="mt-2 text-slate-400">{error}</p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-md bg-teal-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-teal-400"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const owner = portfolio.userId;
  const featured = projects.filter((p) => p.featured);
  const other = projects.filter((p) => !p.featured);
  // use fetched certificates state instead of portfolio.certificates
  const themeColor = portfolio.themeColor || "#14b8a6";

  return (
    <div className="space-y-20 pb-20">
      {/* ── 1. HERO ────────────────────────────────────────────────── */}
      <PortfolioHeader portfolio={portfolio} owner={owner} />

      {/* ── 2. ABOUT + SKILLS ────────────────────────────────────── */}
      <section id="about" className="grid gap-12 md:grid-cols-2">
        <div>
          <SectionTitle accent={themeColor}>About Me</SectionTitle>
          <p className="mt-4 leading-8 text-slate-300">
            {portfolio.bio || "No bio added yet."}
          </p>
        </div>
        <div>
          <SectionTitle accent={themeColor}>Skills & Technologies</SectionTitle>
          {portfolio.skills?.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {portfolio.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-slate-700 bg-slate-800/60 px-4 py-1.5 text-sm text-slate-200 transition hover:border-slate-500"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-slate-400">No skills listed.</p>
          )}
        </div>
      </section>

      {/* ── 3. PROJECTS ──────────────────────────────────────────── */}
      {projects.length > 0 && (
        <section id="projects">
          <SectionTitle accent={themeColor}>Projects</SectionTitle>

          {/* Featured */}
          {featured.length > 0 && (
            <>
              <p className="mt-1 text-sm text-slate-500">Featured work</p>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {featured.map((project) => (
                  <ProjectShowcaseCard
                    key={project._id}
                    project={project}
                    themeColor={themeColor}
                    featured
                  />
                ))}
              </div>
            </>
          )}

          {/* Other projects */}
          {other.length > 0 && (
            <>
              {featured.length > 0 && (
                <h3 className="mt-12 text-base font-semibold text-slate-400">
                  More Projects
                </h3>
              )}
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {other.map((project) => (
                  <ProjectShowcaseCard
                    key={project._id}
                    project={project}
                    themeColor={themeColor}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* ── 4. CERTIFICATES ──────────────────────────────────────── */}
      <section id="certificates">
        <SectionTitle accent={themeColor}>Certificates & Achievements</SectionTitle>
        {certificates.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {certificates.map((cert, i) => (
              <CertificateCard key={i} cert={cert} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-12 text-center">
            <p className="text-4xl">🏅</p>
            <p className="mt-3 text-slate-400">No certificates added yet.</p>
          </div>
        )}
      </section>

      {/* ── 5. CONTACT ───────────────────────────────────────────── */}
      <section id="contact">
        <SectionTitle accent={themeColor}>Get In Touch</SectionTitle>
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <p className="max-w-xl text-slate-300">
            I&apos;m always open to new opportunities, collaborations, and interesting
            conversations. Feel free to reach out through any of the channels below.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {owner?.email && (
              <ContactLink href={`mailto:${owner.email}`} label={`✉ ${owner.email}`} />
            )}
            {portfolio.github && (
              <ContactLink href={portfolio.github} label="GitHub" />
            )}
            {portfolio.linkedin && (
              <ContactLink href={portfolio.linkedin} label="LinkedIn" />
            )}
            {portfolio.website && (
              <ContactLink href={portfolio.website} label="Website" />
            )}
          </div>
        </div>
      </section>

      {/* ── 6. FOOTER ────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
        <p>
          © {new Date().getFullYear()}{" "}
          <span className="text-slate-300">{owner?.name}</span>
          {" · "}Built with{" "}
          <Link to="/" className="text-teal-500 hover:underline">
            PortfolioHub
          </Link>
        </p>
      </footer>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────

function SectionTitle({ children, accent }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-6 w-1 rounded-full" style={{ backgroundColor: accent }} />
      <h2 className="text-2xl font-bold text-slate-100">{children}</h2>
    </div>
  );
}

function ContactLink({ href, label }) {
  return (
    <a
      href={href}
      target={href.startsWith("mailto") ? undefined : "_blank"}
      rel="noreferrer"
      className="rounded-full border border-slate-700 px-5 py-2.5 text-sm text-slate-300 transition hover:border-teal-500 hover:text-teal-400"
    >
      {label}
    </a>
  );
}

function ProjectShowcaseCard({ project, themeColor, featured }) {
  return (
    <article
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition hover:border-slate-600 hover:shadow-xl hover:shadow-black/30"
      style={featured ? { borderTopColor: themeColor, borderTopWidth: "2px" } : {}}
    >
      {/* Image */}
      {project.imageUrl ? (
        <div className="h-48 overflow-hidden bg-slate-800">
          <img
            src={project.imageUrl}
            alt={project.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center bg-slate-800 text-5xl">
          💻
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold leading-snug text-slate-100">
            {project.title}
          </h3>
          {project.featured && (
            <span
              className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ backgroundColor: `${themeColor}25`, color: themeColor }}
            >
              Featured
            </span>
          )}
        </div>

        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
          {project.description}
        </p>

        {/* Tech stack badges */}
        {project.techStack?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-300"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Action links */}
        <div className="mt-4 flex gap-3">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-md px-4 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: themeColor }}
            >
              Live Demo ↗
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-slate-700 px-4 py-1.5 text-xs text-slate-300 transition hover:border-slate-500"
            >
              View Code ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-12">
      <div className="h-56 rounded-3xl bg-slate-800" />
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-3">
          <div className="h-6 w-32 rounded bg-slate-800" />
          <div className="h-4 w-full rounded bg-slate-800" />
          <div className="h-4 w-4/5 rounded bg-slate-800" />
        </div>
        <div className="space-y-3">
          <div className="h-6 w-48 rounded bg-slate-800" />
          <div className="flex flex-wrap gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 w-20 rounded-full bg-slate-800" />
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="h-72 rounded-2xl bg-slate-800" />
        <div className="h-72 rounded-2xl bg-slate-800" />
      </div>
    </div>
  );
}


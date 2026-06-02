export default function ProjectCard({ project, onEdit, onDelete }) {
  return (
    <li className="flex flex-col gap-4 rounded-xl border border-slate-700 bg-slate-800/30 p-4 sm:flex-row sm:items-start">
      {project.imageUrl && (
        <img
          src={project.imageUrl}
          alt={project.title}
          className="h-24 w-full shrink-0 rounded-lg object-cover sm:h-20 sm:w-32"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-slate-100 truncate">{project.title}</p>
          {project.featured && (
            <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-xs text-teal-400">
              Featured
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-400 line-clamp-2">{project.description}</p>
        {project.techStack?.length > 0 && (
          <p className="mt-1.5 text-xs text-slate-500">{project.techStack.join(" · ")}</p>
        )}
        <div className="mt-2 flex gap-3 text-xs">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="text-teal-400 hover:underline"
            >
              Live ↗
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:underline"
            >
              GitHub ↗
            </a>
          )}
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={onEdit}
          className="rounded-md border border-slate-600 px-3 py-1.5 text-xs text-slate-300 hover:border-teal-500 hover:text-teal-400 transition"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="rounded-md border border-slate-600 px-3 py-1.5 text-xs text-slate-300 hover:border-red-500 hover:text-red-400 transition"
        >
          Delete
        </button>
      </div>
    </li>
  );
}

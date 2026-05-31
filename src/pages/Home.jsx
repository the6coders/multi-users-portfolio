import { Link } from "react-router-dom";

const members = [
  {
    id: 1,
    name: "John Doe",
    role: "Full Stack Developer",
    stack: ["React", "Node", "MongoDB"],
    slug: "john-doe",
  },
  {
    id: 2,
    name: "Sara Ali",
    role: "UI Engineer",
    stack: ["React", "Tailwind", "Framer Motion"],
    slug: "sara-ali",
  },
];

export default function Home() {
  return (
    <section>
      <header className="mb-8">
        <h1 className="text-3xl font-bold sm:text-4xl">Discover Portfolio Members</h1>
        <p className="mt-2 text-slate-300">Browse public profiles and explore projects.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <article key={member.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="mb-3 h-40 rounded-lg bg-slate-800" />
            <h2 className="text-lg font-semibold">{member.name}</h2>
            <p className="text-slate-300">{member.role}</p>
            <p className="mt-2 text-sm text-slate-400">{member.stack.join(" • ")}</p>
            <Link
              to={`/portfolio/${member.slug}`}
              className="mt-4 inline-block rounded-md bg-teal-500 px-3 py-1.5 font-medium text-slate-950 hover:bg-teal-400"
            >
              View Portfolio
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

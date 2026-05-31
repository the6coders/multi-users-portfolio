import { useParams } from "react-router-dom";

export default function Portfolio() {
  const { slug } = useParams();

  return (
    <section className="space-y-8">
      <header className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h1 className="text-3xl font-bold">Portfolio: {slug}</h1>
        <p className="mt-2 text-slate-300">Public profile sections will be fetched from the API.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="text-xl font-semibold">About</h2>
          <p className="mt-2 text-slate-300">Starter about section.</p>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="text-xl font-semibold">Skills</h2>
          <p className="mt-2 text-slate-300">Starter skills section.</p>
        </section>
      </div>
    </section>
  );
}

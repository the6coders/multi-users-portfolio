export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 text-sm text-slate-400 sm:px-6 lg:px-8">
        <p>PortfolioHub © {new Date().getFullYear()} - Built for scalable multi-user portfolios.</p>
      </div>
    </footer>
  );
}

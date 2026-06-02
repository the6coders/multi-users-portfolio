export function SkeletonLine({ className = "" }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <SkeletonLine className="h-5 w-1/3" />
      <SkeletonLine className="h-4 w-full" />
      <SkeletonLine className="h-4 w-4/5" />
      <SkeletonLine className="h-4 w-2/3" />
    </div>
  );
}

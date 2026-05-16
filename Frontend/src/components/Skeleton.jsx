/**
 * Reusable shimmer skeleton components for loading states.
 */

export function SkeletonBlock({ className = "" }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function SkeletonText({ lines = 3, className = "" }) {
  return (
    <div className={`space-y-2.5 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-3.5"
          style={{ width: i === lines - 1 ? "65%" : "100%" }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }) {
  return (
    <div
      className={`card animate-fade-in ${className}`}
      aria-hidden="true"
    >
      <div className="skeleton h-4 w-2/5 mb-4" />
      <div className="space-y-2.5">
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-4/5" />
        <div className="skeleton h-3 w-3/5" />
      </div>
      <div className="flex gap-2 mt-4">
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="card animate-fade-in" aria-hidden="true">
      <div className="skeleton h-3 w-24 mb-3" />
      <div className="skeleton h-8 w-16" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="page-enter space-y-8" aria-label="Loading dashboard" role="status">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="lg:col-span-1">
          <SkeletonCard className="h-full" />
        </div>
        <div>
          <SkeletonCard className="h-full" />
        </div>
      </div>

      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center" role="status">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-2 border-brand-500/30" />
          <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-brand-400 border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

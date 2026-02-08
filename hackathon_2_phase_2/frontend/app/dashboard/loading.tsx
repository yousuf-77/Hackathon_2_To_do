export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-muted/50 animate-pulse rounded" />
        <div className="h-4 w-64 bg-muted/50 animate-pulse rounded" />
      </div>

      {/* Stats skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card p-6 space-y-2">
            <div className="h-4 w-24 bg-muted/50 animate-pulse rounded" />
            <div className="h-8 w-16 bg-muted/50 animate-pulse rounded" />
          </div>
        ))}
      </div>

      {/* Task skeleton */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="glass-card p-4 space-y-2 animate-pulse">
            <div className="h-4 w-3/4 bg-muted/50 rounded" />
            <div className="h-3 w-1/2 bg-muted/50 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-sm bg-gray-100", className)}
      {...props}
    />
  );
}

// ─── Stat card skeleton ───────────────────────────────────────────────────────

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-sm border border-gray-100 p-5 space-y-3">
          <div className="flex items-start justify-between">
            <Skeleton className="w-10 h-10 rounded-sm" />
            <Skeleton className="w-16 h-4 rounded-full" />
          </div>
          <Skeleton className="w-24 h-7 rounded-sm" />
          <Skeleton className="w-20 h-4 rounded-sm" />
        </div>
      ))}
    </div>
  );
}

// ─── Table skeleton ───────────────────────────────────────────────────────────

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-sm border border-gray-100 overflow-hidden">
      <div className="bg-primary-light px-4 py-3 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1 bg-primary-lighter" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-4 py-3.5 border-b border-gray-50 flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export { Skeleton };

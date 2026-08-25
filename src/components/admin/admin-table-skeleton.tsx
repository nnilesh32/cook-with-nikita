import { Skeleton } from "@/components/ui/skeleton";

export function AdminTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div>
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mt-2 h-4 w-72 max-w-full" />
      <div className="mt-8 flex flex-col gap-2 rounded-2xl border border-steel/50 bg-card p-4">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

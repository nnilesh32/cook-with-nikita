import { Section } from "@/components/layout/section";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountLoading() {
  return (
    <main id="main">
      <Section className="max-w-3xl">
        <div className="flex items-center justify-between border-b border-steel/40 pb-6">
          <div>
            <Skeleton className="h-4 w-16" />
            <Skeleton className="mt-2 h-8 w-40" />
            <Skeleton className="mt-1 h-4 w-32" />
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
        <div className="mt-6 flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      </Section>
    </main>
  );
}

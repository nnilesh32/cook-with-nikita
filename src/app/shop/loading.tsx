import { Section } from "@/components/layout/section";
import { Skeleton } from "@/components/ui/skeleton";

export default function ShopLoading() {
  return (
    <main id="main">
      <Section className="pb-0">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
      </Section>
      <Section className="pt-10">
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="mt-4 flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3 overflow-hidden rounded-2xl border border-steel/50">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="flex flex-col gap-2 p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}

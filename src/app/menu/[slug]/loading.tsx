import { Section } from "@/components/layout/section";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <main id="main">
      <Section className="pb-10">
        <Skeleton className="mb-6 h-4 w-48" />
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Skeleton className="aspect-[4/3] w-full rounded-3xl lg:aspect-square" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-9 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="mt-6 h-40 w-full rounded-xl" />
          </div>
        </div>
      </Section>
    </main>
  );
}

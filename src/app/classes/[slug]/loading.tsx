import { Section } from "@/components/layout/section";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClassDetailLoading() {
  return (
    <main id="main">
      <Section className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
          <Skeleton className="mt-6 h-4 w-20" />
          <Skeleton className="mt-2 h-8 w-2/3" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-1 h-4 w-3/4" />
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </Section>
    </main>
  );
}

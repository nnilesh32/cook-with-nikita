import { Section } from "@/components/layout/section";
import { Skeleton } from "@/components/ui/skeleton";

export default function TrackLoading() {
  return (
    <main id="main">
      <Section className="max-w-2xl">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="mt-2 h-9 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />
        <Skeleton className="mt-8 h-64 w-full rounded-2xl" />
        <Skeleton className="mt-6 h-24 w-full rounded-2xl" />
      </Section>
    </main>
  );
}

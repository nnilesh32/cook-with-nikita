import { Section } from "@/components/layout/section";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecipeDetailLoading() {
  return (
    <main id="main">
      <Section className="max-w-3xl">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="mt-2 h-9 w-2/3" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-8 aspect-[16/9] w-full rounded-2xl" />
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <Skeleton className="h-72 w-full rounded-2xl" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </Section>
    </main>
  );
}

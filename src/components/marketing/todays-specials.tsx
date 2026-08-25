import Link from "next/link";

import { Section, SectionHeading } from "@/components/layout/section";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { MotionGroup, MotionItem } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";
import { getTodaysSpecials } from "@/lib/data/menu";
import { cn } from "@/lib/utils";

export async function TodaysSpecials() {
  const specials = await getTodaysSpecials();
  if (specials.length === 0) return null;

  return (
    <Section className="border-t border-steel/40">
      <MotionGroup>
        <MotionItem className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Today"
            title="What's cooking today"
            description="Limited quantities — once a dish is gone for the day, it's gone."
          />
          <Link href="/menu" className={cn(buttonVariants({ variant: "outline" }))}>
            See full menu
          </Link>
        </MotionItem>

        <div className="mt-10 flex gap-5 overflow-x-auto pb-2">
          {specials.map((product) => (
            <MotionItem key={product.id} className="w-64 shrink-0">
              <MenuItemCard product={product} />
            </MotionItem>
          ))}
        </div>
      </MotionGroup>
    </Section>
  );
}

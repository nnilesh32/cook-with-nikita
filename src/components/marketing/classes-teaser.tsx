import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";

import { Section } from "@/components/layout/section";
import { MotionGroup, MotionItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { getUpcomingClassHighlight } from "@/lib/data/home";

export async function ClassesTeaser() {
  const session = await getUpcomingClassHighlight();
  if (!session) return null;

  const modeLabel = session.mode === "ONLINE" ? "Online" : "In-person";
  const seatsLabel =
    session.seatsLeft === 0
      ? "Fully booked"
      : `${session.seatsLeft} seat${session.seatsLeft === 1 ? "" : "s"} left`;

  return (
    <Section className="border-t border-steel/40">
      <MotionGroup className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <MotionItem className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-steel/50">
          <Image
            src={session.image}
            alt={session.title}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </MotionItem>

        <MotionItem>
          <p className="font-mono text-xs tracking-wide text-turmeric uppercase">
            Cooking classes
          </p>
          <h2 className="mt-2 text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            {session.title}
          </h2>
          <p className="mt-4 text-ink/65">{session.description}</p>
          <p className="mt-4 font-mono text-xs text-ink/50">
            {modeLabel} · {seatsLabel} · {format(session.dateTime, "EEEE, MMM d, h:mma")}
          </p>
          <Button size="lg" className="mt-6" render={<Link href="/classes" />}>
            See all classes
          </Button>
        </MotionItem>
      </MotionGroup>
    </Section>
  );
}

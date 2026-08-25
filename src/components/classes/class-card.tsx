import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/currency";

export type ClassCardData = {
  slug: string;
  title: string;
  description: string;
  mode: "ONLINE" | "IN_PERSON";
  dateTime: Date;
  durationMinutes: number;
  price: number;
  image: string;
  seatsRemaining: number;
};

export function ClassCard({ classSession }: { classSession: ClassCardData }) {
  const soldOut = classSession.seatsRemaining <= 0;
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-steel/50 bg-card">
      <Link href={`/classes/${classSession.slug}`} className="relative block aspect-[4/3] overflow-hidden">
        <Image
          src={classSession.image}
          alt={classSession.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 90vw"
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        />
        <span className="absolute top-2.5 left-2.5 rounded-full bg-bone/90 px-2 py-0.5 font-mono text-[0.6rem] tracking-wide text-ink uppercase">
          {classSession.mode === "ONLINE" ? "Online" : "In person"}
        </span>
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/65">
            <span className="rounded-full bg-bone px-3 py-1 text-xs font-medium text-ink">Fully booked</span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <Link href={`/classes/${classSession.slug}`} className="text-sm font-medium text-ink hover:underline">
          {classSession.title}
        </Link>
        <p className="line-clamp-2 text-xs text-ink/55">{classSession.description}</p>
        <p className="font-mono text-[0.65rem] text-ink/40">
          {classSession.dateTime.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} ·{" "}
          {classSession.durationMinutes} min
        </p>

        <div className="mt-auto flex items-center justify-between pt-3">
          <p className="font-mono text-sm text-ink">{formatINR(classSession.price)}</p>
          {soldOut ? (
            <Button size="sm" variant="outline" disabled>
              Fully booked
            </Button>
          ) : (
            <Button size="sm" variant="outline" render={<Link href={`/classes/${classSession.slug}`} />}>
              Reserve seat
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

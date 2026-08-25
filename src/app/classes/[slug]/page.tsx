import { CalendarPlus, Clock, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { ClassBookingForm } from "@/components/classes/class-booking-form";
import { Section } from "@/components/layout/section";
import { googleCalendarLink } from "@/lib/calendar-link";
import { formatINR } from "@/lib/currency";
import { getClassBySlug } from "@/lib/data/classes";
import { courseJsonLd } from "@/lib/structured-data";
import { cn } from "@/lib/utils";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const classSession = await getClassBySlug(slug);
  if (!classSession) return {};
  return { title: classSession.title, description: classSession.description };
}

export default async function ClassDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const classSession = await getClassBySlug(slug);
  if (!classSession) notFound();

  const dateTime = classSession.dateTime;
  const pad = (n: number) => n.toString().padStart(2, "0");
  const date = `${dateTime.getFullYear()}-${pad(dateTime.getMonth() + 1)}-${pad(dateTime.getDate())}`;
  const startTime = `${pad(dateTime.getHours())}:${pad(dateTime.getMinutes())}`;
  const endDateTime = new Date(dateTime.getTime() + classSession.durationMinutes * 60_000);
  const endTime = `${pad(endDateTime.getHours())}:${pad(endDateTime.getMinutes())}`;

  const calendarHref = googleCalendarLink({
    title: classSession.title,
    description: classSession.description,
    location: classSession.mode === "ONLINE" ? "Online" : "Andheri West, Mumbai",
    date,
    startTime,
    endTime,
  });

  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd(classSession)) }}
      />
      <Section className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image src={classSession.image} alt={classSession.title} fill className="object-cover" priority />
          </div>

          <p className="mt-6 font-mono text-xs tracking-wide text-turmeric uppercase">
            {classSession.mode === "ONLINE" ? "Online" : "In person"}
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight text-ink sm:text-4xl">{classSession.title}</h1>
          <p className="mt-3 text-ink/65">{classSession.description}</p>

          <div className="mt-6 flex flex-wrap gap-6 text-sm text-ink/70">
            <span className="flex items-center gap-1.5">
              <Clock className="size-4 text-ink/40" />
              {dateTime.toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })} ·{" "}
              {classSession.durationMinutes} min
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="size-4 text-ink/40" />
              {classSession.seatsRemaining} of {classSession.seatsTotal} seats left
            </span>
          </div>

          <a
            href={calendarHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "mt-6 inline-flex items-center gap-2 rounded-lg border border-steel/60 px-3 py-1.5 text-sm text-ink transition-colors hover:border-steel"
            )}
          >
            <CalendarPlus className="size-4" />
            Add to calendar
          </a>

          {classSession.reviews.length > 0 && (
            <div className="mt-10 border-t border-steel/40 pt-6">
              <p className="text-sm font-medium text-ink">From past students</p>
              <ul className="mt-4 flex flex-col gap-4">
                {classSession.reviews.map((review) => (
                  <li key={review.id} className="text-sm">
                    <p className="text-ink/80">&ldquo;{review.quote}&rdquo;</p>
                    <p className="mt-1 text-xs text-ink/45">
                      {review.customerName} · {review.rating}/5
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-2 text-2xl font-medium text-ink">{formatINR(classSession.price)}</p>
          <ClassBookingForm
            classSessionId={classSession.id}
            price={classSession.price}
            seatsRemaining={classSession.seatsRemaining}
          />
        </div>
      </Section>
    </main>
  );
}

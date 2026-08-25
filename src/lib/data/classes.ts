import "server-only";

import { db } from "@/lib/db";

async function seatsBookedMap(classSessionIds: string[]) {
  const rows = await db.booking.groupBy({
    by: ["classSessionId"],
    where: { classSessionId: { in: classSessionIds }, status: { not: "CANCELLED" } },
    _sum: { seats: true },
  });
  return new Map(rows.map((row) => [row.classSessionId, row._sum.seats ?? 0]));
}

export async function getUpcomingClasses() {
  const sessions = await db.classSession.findMany({
    where: { dateTime: { gte: new Date() } },
    orderBy: { dateTime: "asc" },
  });
  const booked = await seatsBookedMap(sessions.map((s) => s.id));
  return sessions.map((s) => ({
    ...s,
    seatsBooked: booked.get(s.id) ?? 0,
    seatsRemaining: Math.max(0, s.seatsTotal - (booked.get(s.id) ?? 0)),
  }));
}

export async function getClassBySlug(slug: string) {
  const session = await db.classSession.findUnique({
    where: { slug },
    include: { reviews: { where: { isPublished: true }, orderBy: { createdAt: "desc" } } },
  });
  if (!session) return null;

  const booked = await seatsBookedMap([session.id]);
  return {
    ...session,
    seatsBooked: booked.get(session.id) ?? 0,
    seatsRemaining: Math.max(0, session.seatsTotal - (booked.get(session.id) ?? 0)),
  };
}

export async function getAllClassSlugs() {
  const sessions = await db.classSession.findMany({ select: { slug: true } });
  return sessions.map((s) => s.slug);
}

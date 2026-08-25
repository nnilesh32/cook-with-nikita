import "server-only";

import { db } from "@/lib/db";

export async function getFeaturedReviews(limit = 3) {
  const reviews = await db.review.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { product: true, classSession: true },
  });

  return reviews.map((review) => ({
    id: review.id,
    customerName: review.customerName,
    rating: review.rating,
    quote: review.quote,
    detail:
      review.detail ??
      (review.product ? `Ordered: ${review.product.name}` : review.classSession ? `Attended: ${review.classSession.title}` : null),
  }));
}

/** The classes teaser on the homepage — whichever session is coming up
 * soonest, so the homepage never points at a class that's already run. */
export async function getUpcomingClassHighlight() {
  const session = await db.classSession.findFirst({
    where: { dateTime: { gte: new Date() } },
    orderBy: { dateTime: "asc" },
    include: { bookings: { where: { status: "CONFIRMED" }, select: { seats: true } } },
  });
  if (!session) return null;

  const seatsBooked = session.bookings.reduce((sum, b) => sum + b.seats, 0);
  const seatsLeft = Math.max(session.seatsTotal - seatsBooked, 0);
  return {
    slug: session.slug,
    title: session.title,
    description: session.description,
    image: session.image,
    mode: session.mode,
    dateTime: session.dateTime,
    seatsLeft,
  };
}

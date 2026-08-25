export function googleCalendarLink(input: {
  title: string;
  description: string;
  location?: string;
  date: string; // "2026-08-20"
  startTime: string; // "12:00"
  endTime: string; // "13:00"
}) {
  const start = `${input.date.replace(/-/g, "")}T${input.startTime.replace(":", "")}00`;
  const end = `${input.date.replace(/-/g, "")}T${input.endTime.replace(":", "")}00`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: input.title,
    dates: `${start}/${end}`,
    details: input.description,
    location: input.location ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

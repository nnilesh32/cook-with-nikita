import { formatINR } from "@/lib/currency";

export function RevenueChart({ data }: { data: { date: string; revenue: number; orders: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.revenue));

  return (
    <div className="flex items-end gap-2 overflow-x-auto pb-2">
      {data.map((d) => {
        const heightPct = Math.round((d.revenue / max) * 100);
        const day = new Date(d.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
        return (
          <div key={d.date} className="flex w-12 shrink-0 flex-col items-center gap-1.5" title={`${day}: ${formatINR(d.revenue)}`}>
            <div className="flex h-32 w-full items-end">
              <div
                className="w-full rounded-t bg-turmeric"
                style={{ height: `${Math.max(heightPct, d.revenue > 0 ? 4 : 0)}%` }}
              />
            </div>
            <span className="font-mono text-[0.6rem] text-ink/40">{day}</span>
          </div>
        );
      })}
    </div>
  );
}

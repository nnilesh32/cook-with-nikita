"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const VEG_OPTIONS = [
  { value: "", label: "All" },
  { value: "VEG", label: "Veg" },
  { value: "NON_VEG", label: "Non-veg" },
  { value: "JAIN", label: "Jain" },
] as const;

const SPICE_OPTIONS = [
  { value: "", label: "Any spice" },
  { value: "1", label: "Mild" },
  { value: "2", label: "Medium" },
  { value: "3", label: "Hot" },
] as const;

const PRICE_OPTIONS = [
  { value: "", label: "Any price" },
  { value: "under-200", label: "Under ₹200" },
  { value: "200-400", label: "₹200–400" },
  { value: "400-plus", label: "₹400+" },
] as const;

const SORT_OPTIONS = [
  { value: "popularity", label: "Popular first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "newest", label: "Newest" },
] as const;

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        active
          ? "border-turmeric bg-turmeric/15 text-ink"
          : "border-steel/60 bg-card text-ink/65 hover:border-steel hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const veg = searchParams.get("veg") ?? "";
  const spice = searchParams.get("spice") ?? "";
  const price = searchParams.get("price") ?? "";
  const availableToday = searchParams.get("available") === "today";
  const sort = searchParams.get("sort") ?? "popularity";

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  function toggleParam(key: string, value: string, current: string) {
    setParam(key, current === value ? "" : value);
  }

  // Debounce the search box so every keystroke doesn't trigger a navigation.
  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (query === current) return;
    const timeout = setTimeout(() => setParam("q", query), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const hasActiveFilters = veg || spice || price || availableToday || query;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink/40" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the menu — try “biryani” or “sweet”"
          aria-label="Search the menu"
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex shrink-0 gap-2 overflow-x-auto">
          {VEG_OPTIONS.map((opt) => (
            <Chip key={opt.value} active={veg === opt.value} onClick={() => setParam("veg", opt.value)}>
              {opt.label}
            </Chip>
          ))}
        </div>

        <div className="flex shrink-0 gap-2 overflow-x-auto">
          {SPICE_OPTIONS.map((opt) => (
            <Chip key={opt.value} active={spice === opt.value} onClick={() => setParam("spice", opt.value)}>
              {opt.label}
            </Chip>
          ))}
        </div>

        <div className="flex shrink-0 gap-2 overflow-x-auto">
          {PRICE_OPTIONS.map((opt) => (
            <Chip key={opt.value} active={price === opt.value} onClick={() => setParam("price", opt.value)}>
              {opt.label}
            </Chip>
          ))}
        </div>

        <Chip active={availableToday} onClick={() => toggleParam("available", "today", availableToday ? "today" : "")}>
          Available today
        </Chip>

        <div className="ml-auto flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                router.replace(pathname, { scroll: false });
              }}
              className="flex items-center gap-1 text-xs text-ink/50 hover:text-kashmiri"
            >
              <X className="size-3.5" />
              Clear filters
            </button>
          )}

          <Select
            value={sort}
            onValueChange={(value) => setParam("sort", !value || value === "popularity" ? "" : value)}
          >
            <SelectTrigger size="sm" aria-label="Sort by" className="w-[168px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <span className="sr-only" role="status">
        {isPending ? "Updating menu…" : ""}
      </span>
    </div>
  );
}

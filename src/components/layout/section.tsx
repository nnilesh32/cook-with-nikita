import { cn } from "@/lib/utils";

export function Section({
  className,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section
      className={cn("mx-auto max-w-7xl px-6 py-20 lg:px-8", className)}
      {...props}
    />
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow && (
        <p className="font-mono text-xs tracking-wide text-turmeric uppercase">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-2 text-3xl font-medium tracking-tight text-ink sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-ink/65">{description}</p>
      )}
    </div>
  );
}

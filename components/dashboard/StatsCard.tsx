import { cn } from "@/lib/utils";

export function StatsCard({
  label,
  value,
  detail,
  className,
}: {
  label: string;
  value: string | number;
  detail: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900", className)}>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-normal text-neutral-950 dark:text-neutral-50">{value}</p>
      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{detail}</p>
    </div>
  );
}

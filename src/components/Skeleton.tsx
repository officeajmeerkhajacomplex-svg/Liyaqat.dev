import { cn } from "../lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200 dark:bg-zinc-800", className)}
      {...props}
    />
  );
}

export function PrayerCardSkeleton() {
  return (
    <div className="p-6 rounded-[2rem] border border-slate-200 dark:border-zinc-800 space-y-8">
      <Skeleton className="w-12 h-12 rounded-2xl" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

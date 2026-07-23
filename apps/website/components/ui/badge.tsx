import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("inline-flex items-center rounded-full border border-[var(--oria-color-border)] bg-[var(--oria-color-surface-raised)] px-3 py-1 text-xs font-medium text-[var(--oria-color-muted-foreground)]", className)} {...props} />; }

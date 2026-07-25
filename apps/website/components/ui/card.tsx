import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("rounded-[var(--oria-radius-xl)] border border-[var(--oria-color-border)] bg-[var(--oria-color-surface-raised)] shadow-[var(--oria-shadow-md)]", className)} {...props} />; }

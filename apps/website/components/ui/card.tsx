import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("rounded-[var(--oria-shape-radius-xl)] border border-[var(--oria-color-border)] bg-[var(--oria-color-surfaceRaised)] shadow-[var(--oria-elevation-shadow-md)]", className)} {...props} />; }

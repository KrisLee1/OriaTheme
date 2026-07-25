import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva("inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oria-color-ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", {
  variants: { variant: { default: "bg-[var(--oria-color-primary)] text-[var(--oria-color-primary-fg)] hover:opacity-90", secondary: "border border-[var(--oria-color-border)] bg-[var(--oria-color-surface-raised)] text-[var(--oria-color-fg)] hover:bg-[var(--oria-color-muted)]", ghost: "text-[var(--oria-color-muted-fg)] hover:bg-[var(--oria-color-muted)] hover:text-[var(--oria-color-fg)]" }, size: { default: "h-11", sm: "h-9 px-4 text-xs", lg: "h-12 px-6 text-base" } },
  defaultVariants: { variant: "default", size: "default" },
});

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}
export function Button({ className, variant, size, ...props }: ButtonProps) { return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />; }

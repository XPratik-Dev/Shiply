import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-neutral-950 text-white shadow-sm hover:bg-neutral-800 focus-visible:ring-neutral-950 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200 dark:focus-visible:ring-neutral-200",
  secondary:
    "border-transparent bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 focus-visible:ring-emerald-600 dark:bg-emerald-500 dark:text-neutral-950 dark:hover:bg-emerald-400 dark:focus-visible:ring-emerald-400",
  ghost:
    "border-transparent bg-transparent text-neutral-700 hover:bg-neutral-100 focus-visible:ring-neutral-400 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 dark:focus-visible:ring-neutral-600",
  danger:
    "border-transparent bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus-visible:ring-rose-600 dark:bg-rose-500 dark:text-neutral-950 dark:hover:bg-rose-400 dark:focus-visible:ring-rose-400",
  outline:
    "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 focus-visible:ring-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:focus-visible:ring-neutral-600",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
  icon: "h-10 w-10 p-0",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-md border font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-55",
    "dark:focus-visible:ring-offset-neutral-950",
    variants[variant],
    sizes[size],
    className,
  );
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonClasses({ variant, size, className })}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

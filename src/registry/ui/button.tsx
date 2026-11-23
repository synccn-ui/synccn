import type * as React from "react";
import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive" | "link" | "soft";
export type ButtonSize = "sm" | "default" | "lg" | "icon" | "icon-sm";

const variants = {
  default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70",
  outline: "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  destructive: "bg-destructive text-white shadow-sm hover:bg-destructive/90",
  link: "text-primary underline-offset-4 hover:underline",
  soft: "bg-brand-soft text-primary hover:bg-primary/20",
};

const sizes = {
  sm: "h-8 gap-1.5 rounded-md px-3 text-[13px]",
  default: "h-9 gap-2 rounded-md px-4 text-sm",
  lg: "h-11 gap-2 rounded-lg px-6 text-[15px]",
  icon: "size-9 rounded-md",
  "icon-sm": "size-8 rounded-md",
};

export interface ButtonVariantsOptions {
  /** Visual style. */
  variant?: ButtonVariant;
  /** Height and padding. */
  size?: ButtonSize;
  /** Extra classes for the root element. */
  className?: string;
}

export function buttonVariants({ variant = "default", size = "default", className }: ButtonVariantsOptions = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center whitespace-nowrap font-medium transition-[color,background-color,box-shadow,transform] duration-150",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    variants[variant],
    sizes[size],
    className
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style.
   * @default "default"
   */
  variant?: ButtonVariant;
  /**
   * Height and padding.
   * @default "default"
   */
  size?: ButtonSize;
  /** Shows a spinner and disables the button. */
  loading?: boolean;
  /** Extra classes for the root element. */
  className?: string;
  /** Content to render. */
  children?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, loading = false, disabled, children, ...props }: ButtonProps,
  ref
) {
  return (
    <button
      ref={ref}
      className={buttonVariants({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" />}
      {children}
    </button>
  );
});

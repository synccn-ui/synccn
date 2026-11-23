import type * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Extra classes for the root element. */
  className?: string;
}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-[0_1px_2px_oklch(0_0_0/0.04)] dark:shadow-[inset_0_1px_0_0_oklch(1_0_0/0.05)]",
        className
      )}
      {...props}
    />
  );
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Extra classes for the root element. */
  className?: string;
}

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return <div className={cn("flex flex-col gap-1.5 p-5 pb-0", className)} {...props} />;
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Extra classes for the root element. */
  className?: string;
}

export function CardTitle({ className, ...props }: CardTitleProps) {
  return <h3 className={cn("text-base font-semibold leading-tight tracking-tight", className)} {...props} />;
}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Extra classes for the root element. */
  className?: string;
}

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Extra classes for the root element. */
  className?: string;
}

export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn("p-5", className)} {...props} />;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Extra classes for the root element. */
  className?: string;
}

export function CardFooter({ className, ...props }: CardFooterProps) {
  return <div className={cn("flex items-center gap-2 border-t px-5 py-3.5", className)} {...props} />;
}

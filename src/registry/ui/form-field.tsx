"use client";

import type * as React from "react";
import { cloneElement, isValidElement, useId } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  /** Field label. */
  label?: React.ReactNode;
  /** Help text, hidden while there's an error. */
  description?: React.ReactNode;
  /** Error message; also marks the control invalid. */
  error?: React.ReactNode;
  /** Adds an asterisk and aria-required. */
  required?: boolean;
  /** Adds “(optional)” after the label. */
  optional?: boolean;
  /** The control. It receives id and ARIA attributes. */
  children: React.ReactElement<any>;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Label, control, description and error in one consistent block.
 * The control gets the right id, aria-invalid and aria-describedby for free.
 */
export function FormField({ label, description, error, required, optional, children, className }: FormFieldProps) {
  const id = useId();
  const descId = description ? `${id}-d` : undefined;
  const errId = error ? `${id}-e` : undefined;
  const control = isValidElement<{ id?: string; invalid?: boolean } & React.AriaAttributes>(children)
    ? cloneElement(children, {
        id: children.props.id || id,
        invalid: error ? true : children.props.invalid,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": [descId, errId].filter(Boolean).join(" ") || undefined,
        "aria-required": required || undefined,
      })
    : children;
  return (
    <div className={cn("grid gap-2", className)}>
      {label && (
        <label htmlFor={children?.props?.id || id} className="flex items-center gap-1 text-sm font-medium leading-none">
          {label}
          {required && <span className="text-destructive">*</span>}
          {optional && <span className="font-normal text-muted-foreground">(optional)</span>}
        </label>
      )}
      {control}
      {description && !error && (
        <p id={descId} className="text-[13px] text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <p id={errId} role="alert" className="flex items-center gap-1.5 text-[13px] text-destructive">
          <CircleAlert className="size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

export interface FieldSetProps {
  /** Group heading. */
  legend?: React.ReactNode;
  /** Text under the heading. */
  description?: React.ReactNode;
  /** Content to render. */
  children?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** Groups related fields under a heading, like a fieldset. */
export function FieldSet({ legend, description, children, className }: FieldSetProps) {
  return (
    <fieldset className={cn("grid gap-5", className)}>
      {(legend || description) && (
        <div className="grid gap-1">
          {legend && <legend className="text-base font-semibold">{legend}</legend>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      {children}
    </fieldset>
  );
}

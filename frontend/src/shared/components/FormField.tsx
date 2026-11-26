import React from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/shared/components/ui/field";

interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FormField({ label, htmlFor, hint, error, required, className, children }: FormFieldProps) {
  return (
    <Field data-invalid={error ? true : undefined} className={className}>
      {label && (
        <FieldLabel htmlFor={htmlFor}>
          {label}
          {required && (
            <span className="text-destructive" aria-hidden>
              *
            </span>
          )}
        </FieldLabel>
      )}
      {children}
      {error ? <FieldError>{error}</FieldError> : hint && <FieldDescription>{hint}</FieldDescription>}
    </Field>
  );
}

import React from "react";
import { CardAction, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";

interface CardHeadingProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeading({ title, description, action, className }: CardHeadingProps) {
  return (
    <CardHeader className={className}>
      <CardTitle>{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
      {action && <CardAction className="flex items-center gap-2">{action}</CardAction>}
    </CardHeader>
  );
}

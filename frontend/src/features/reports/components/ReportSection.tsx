import React from "react";
import { Download } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { CardHeading } from "@/shared/components/CardHeading";
import { Button } from "@/shared/components/ui/button";

interface ReportSectionProps {
  title: string;
  subtitle?: string;
  onExport?: () => void;
  flush?: boolean;
  children: React.ReactNode;
}

export function ReportSection({ title, subtitle, onExport, flush, children }: ReportSectionProps) {
  return (
    <Card>
      <CardHeading
        title={title}
        description={subtitle}
        action={
          onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4" />
              Ekspor CSV
            </Button>
          )
        }
      />
      {flush ? children : <CardContent>{children}</CardContent>}
    </Card>
  );
}

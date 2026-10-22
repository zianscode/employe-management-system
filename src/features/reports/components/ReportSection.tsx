import React from "react";
import { Download } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";

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
      <CardHeader
        title={title}
        description={subtitle}
        action={
          onExport && (
            <Button variant="secondary" size="sm" onClick={onExport}>
              <Download className="h-4 w-4" />
              Ekspor CSV
            </Button>
          )
        }
      />
      {flush ? children : <CardBody>{children}</CardBody>}
    </Card>
  );
}

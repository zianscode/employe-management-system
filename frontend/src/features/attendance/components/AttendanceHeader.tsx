import React from "react";
import { Download } from "lucide-react";
import { PageHeader } from "@/shared/components/PageLayout";
import { Button } from "@/shared/components/ui/button";

interface AttendanceHeaderProps {
  onDownload: () => void;
}

const AttendanceHeader = ({ onDownload }: AttendanceHeaderProps) => {
  return (
    <PageHeader
      title="Absensi"
      description="Kehadiran harian karyawan"
      actions={
        <Button variant="outline" onClick={onDownload}>
          <Download className="h-4 w-4" />
          Ekspor CSV
        </Button>
      }
    />
  );
};

export default AttendanceHeader;

import React from "react";
import { Download } from "lucide-react";
import { PageHeader } from "@/shared/components/ui/Page";
import { Button } from "@/shared/components/ui/Button";

interface AttendanceHeaderProps {
  onDownload: () => void;
}

const AttendanceHeader = ({ onDownload }: AttendanceHeaderProps) => {
  return (
    <PageHeader
      title="Absensi"
      description="Kehadiran harian karyawan"
      actions={
        <Button variant="secondary" onClick={onDownload}>
          <Download className="h-4 w-4" />
          Ekspor CSV
        </Button>
      }
    />
  );
};

export default AttendanceHeader;

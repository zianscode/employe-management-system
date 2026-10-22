import React from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/shared/components/ui/Page";
import { Button } from "@/shared/components/ui/Button";

interface LeaveHeaderProps {
  onAdd: () => void;
}

const LeaveHeader: React.FC<LeaveHeaderProps> = ({ onAdd }) => {
  return (
    <PageHeader
      title="Cuti"
      description="Pengajuan dan persetujuan cuti"
      actions={
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Ajukan cuti
        </Button>
      }
    />
  );
};

export default LeaveHeader;

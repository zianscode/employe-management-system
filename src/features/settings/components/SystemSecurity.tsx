import React from "react";
import { Card, CardBody, CardHeader } from "@/shared/components/ui/Card";
import { DescriptionList } from "@/shared/components/ui/DescriptionList";
import { PASSWORD_RULE_TEXT } from "@/shared/utils/password-policy";
import { LOGIN_LOCK_MINUTES, MAX_FAILED_LOGIN_ATTEMPTS } from "@/shared/constants/security";

export const SystemSecurity: React.FC = () => {
  return (
    <Card>
      <CardHeader title="Kebijakan keamanan" description="Aturan yang berlaku untuk semua akun" />
      <CardBody>
        <DescriptionList
          columns={1}
          items={[
            { label: "Password", value: PASSWORD_RULE_TEXT },
            {
              label: "Batas login gagal",
              value: `Akun dikunci ${LOGIN_LOCK_MINUTES} menit setelah ${MAX_FAILED_LOGIN_ATTEMPTS} kali salah password`,
            },
            { label: "Akun baru", value: "Mendapat password sementara dan wajib menggantinya saat login pertama" },
            { label: "Registrasi", value: "Ditutup. Akun hanya dibuat oleh HR atau Admin dari menu Karyawan" },
            { label: "Karyawan keluar", value: "Status Resign atau Diberhentikan otomatis tidak bisa login" },
          ]}
        />
      </CardBody>
    </Card>
  );
};

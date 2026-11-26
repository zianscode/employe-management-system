import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { getEmployeeById, getEmployeeHistory } from "@/lib/api/server";
import { EmployeeHistory } from "@/features/employees/components/EmployeeHistory";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { formatCurrency } from "@/shared/utils/format";
import { getProbationDaysLeft } from "@/shared/utils/employee";
import { PayrollComponentsCard } from "@/features/salary/components/PayrollComponentsCard";
import { Page } from "@/shared/components/PageLayout";
import { Card, CardContent } from "@/shared/components/ui/card";
import { CardHeading } from "@/shared/components/CardHeading";
import { UserAvatar } from "@/shared/components/UserAvatar";
import { Badge } from "@/shared/components/ui/badge";
import { DescriptionList } from "@/shared/components/DescriptionList";
import { buttonVariants } from "@/shared/components/ui/button";
import { AccountCard } from "@/features/account/components/AccountCard";
import { AccountInfo } from "@/shared/types/settings.types";

interface FullEmployeeDetails {
  id: string;
  name: string;
  email: string;
  nip: string;
  joinDate: string;
  status: string;
  employmentType: string;
  salaryBase: number;
  leaveQuota: number;
  division: string;
  position: string;
  avatar?: string;
  phone?: string;
  address?: string;
  gender?: string;
  birthDate?: string;
  placeOfBirth?: string;
  identityNumber?: string;
  bio?: string;
  bankName?: string;
  bankAccount?: string;
  bankHolderName?: string;
  npwpNumber?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  education?: string;
  skills?: string;
  account: AccountInfo | null;
  managerName: string | null;
}

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full time",
  PART_TIME: "Part time",
  CONTRACT: "Kontrak",
  INTERNSHIP: "Magang",
  REMOTE: "Remote",
  FREELANCE: "Freelance",
};

function formatLongDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EmployeeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [res, historyRes] = await Promise.all([getEmployeeById(id), getEmployeeHistory(id)]);
  const history = historyRes.success ? historyRes.data : undefined;

  if (!res.success || !res.data) {
    notFound();
  }

  const employee = res.data as unknown as FullEmployeeDetails;

  let probationText: string | null = null;
  if (employee.status === "PROBATION" && employee.joinDate) {
    const daysLeft = getProbationDaysLeft(employee.joinDate);
    probationText = daysLeft <= 0 ? "Masa percobaan selesai" : `Sisa ${daysLeft} hari masa percobaan`;
  }

  const genderText = employee.gender === "MALE" ? "Laki-laki" : employee.gender === "FEMALE" ? "Perempuan" : "-";
  const skills = employee.skills ? employee.skills.split(",").map((s) => s.trim()).filter(Boolean) : [];

  return (
    <Page>
      <Link href="/dashboard/employees" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Karyawan
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <UserAvatar name={employee.name} src={employee.avatar} size="lg" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground">{employee.name}</h1>
              <StatusBadge status={employee.status} />
              {probationText && <Badge variant="warning">{probationText}</Badge>}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {employee.position} · {employee.division} · NIP <span className="tabular-nums">{employee.nip}</span>
            </p>
          </div>
        </div>
        <Link href={`/dashboard/employees/${employee.id}/edit`} className={buttonVariants({ variant: "outline" })}>
          <Pencil className="h-4 w-4" />
          Edit data
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeading title="Pekerjaan" />
            <CardContent>
              <DescriptionList
                items={[
                  { label: "Email kantor", value: employee.email },
                  { label: "Tipe kerja", value: EMPLOYMENT_TYPE_LABELS[employee.employmentType] ?? employee.employmentType },
                  { label: "Tanggal bergabung", value: formatLongDate(employee.joinDate) },
                  { label: "Atasan langsung", value: employee.managerName ?? "Tidak ada (cuti langsung ke HR)" },
                  { label: "Jatah cuti tahunan", value: `${employee.leaveQuota} hari` },
                  { label: "Gaji pokok", value: <span className="tabular-nums">{formatCurrency(employee.salaryBase || 0)}</span> },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeading title="Data pribadi" />
            <CardContent>
              <DescriptionList
                items={[
                  { label: "NIK", value: employee.identityNumber },
                  { label: "Jenis kelamin", value: genderText },
                  {
                    label: "Tempat, tanggal lahir",
                    value: `${employee.placeOfBirth ? `${employee.placeOfBirth}, ` : ""}${formatLongDate(employee.birthDate)}`,
                  },
                  { label: "Telepon", value: employee.phone },
                  { label: "Alamat", value: employee.address, wide: true },
                ]}
              />
            </CardContent>
          </Card>

          {history && <EmployeeHistory history={history} />}

          <PayrollComponentsCard employeeId={employee.id} />
        </div>

        <div className="space-y-6">
          <AccountCard account={employee.account} employeeName={employee.name} />

          <Card>
            <CardHeading title="Rekening dan pajak" />
            <CardContent>
              <DescriptionList
                columns={1}
                items={[
                  { label: "Bank", value: employee.bankName },
                  { label: "Nomor rekening", value: employee.bankAccount && <span className="tabular-nums">{employee.bankAccount}</span> },
                  { label: "Atas nama", value: employee.bankHolderName },
                  { label: "NPWP", value: employee.npwpNumber && <span className="tabular-nums">{employee.npwpNumber}</span> },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeading title="Kontak darurat" />
            <CardContent>
              <DescriptionList
                columns={1}
                items={[
                  { label: "Nama", value: employee.emergencyName },
                  { label: "Hubungan", value: employee.emergencyRelation },
                  { label: "Telepon", value: employee.emergencyPhone },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeading title="Pendidikan dan keahlian" />
            <CardContent>
              <DescriptionList
                columns={1}
                items={[
                  { label: "Pendidikan", value: employee.education },
                  {
                    label: "Keahlian",
                    value: skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {skills.map((skill) => (
                          <Badge variant="secondary" key={skill}>{skill}</Badge>
                        ))}
                      </div>
                    ),
                  },
                  { label: "Tentang", value: employee.bio },
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </Page>
  );
}

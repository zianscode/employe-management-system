import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { getEmployeeByIdAction } from "@/server/modules/employees/employee.actions";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { formatCurrency } from "@/shared/utils/format";
import { getProbationDaysLeft } from "@/shared/utils/employee";
import { PayrollComponentsCard } from "@/features/salary/components/PayrollComponentsCard";
import { Page } from "@/shared/components/ui/Page";
import { Card, CardBody, CardHeader } from "@/shared/components/ui/Card";
import { Avatar } from "@/shared/components/ui/Avatar";
import { Badge } from "@/shared/components/ui/Badge";
import { DescriptionList } from "@/shared/components/ui/DescriptionList";
import { buttonClass } from "@/shared/components/ui/Button";

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
  const res = await getEmployeeByIdAction(id);

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
      <Link href="/dashboard/employees" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" />
        Karyawan
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={employee.name} src={employee.avatar} size="lg" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-900">{employee.name}</h1>
              <StatusBadge status={employee.status} />
              {probationText && <Badge tone="yellow">{probationText}</Badge>}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {employee.position} · {employee.division} · NIP <span className="tabular-nums">{employee.nip}</span>
            </p>
          </div>
        </div>
        <Link href={`/dashboard/employees/${employee.id}/edit`} className={buttonClass("secondary")}>
          <Pencil className="h-4 w-4" />
          Edit data
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Pekerjaan" />
            <CardBody>
              <DescriptionList
                items={[
                  { label: "Email kantor", value: employee.email },
                  { label: "Tipe kerja", value: EMPLOYMENT_TYPE_LABELS[employee.employmentType] ?? employee.employmentType },
                  { label: "Tanggal bergabung", value: formatLongDate(employee.joinDate) },
                  { label: "Jatah cuti tahunan", value: `${employee.leaveQuota} hari` },
                  { label: "Gaji pokok", value: <span className="tabular-nums">{formatCurrency(employee.salaryBase || 0)}</span> },
                ]}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Data pribadi" />
            <CardBody>
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
            </CardBody>
          </Card>

          <PayrollComponentsCard employeeId={employee.id} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Rekening dan pajak" />
            <CardBody>
              <DescriptionList
                columns={1}
                items={[
                  { label: "Bank", value: employee.bankName },
                  { label: "Nomor rekening", value: employee.bankAccount && <span className="tabular-nums">{employee.bankAccount}</span> },
                  { label: "Atas nama", value: employee.bankHolderName },
                  { label: "NPWP", value: employee.npwpNumber && <span className="tabular-nums">{employee.npwpNumber}</span> },
                ]}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Kontak darurat" />
            <CardBody>
              <DescriptionList
                columns={1}
                items={[
                  { label: "Nama", value: employee.emergencyName },
                  { label: "Hubungan", value: employee.emergencyRelation },
                  { label: "Telepon", value: employee.emergencyPhone },
                ]}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Pendidikan dan keahlian" />
            <CardBody>
              <DescriptionList
                columns={1}
                items={[
                  { label: "Pendidikan", value: employee.education },
                  {
                    label: "Keahlian",
                    value: skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {skills.map((skill) => (
                          <Badge key={skill}>{skill}</Badge>
                        ))}
                      </div>
                    ),
                  },
                  { label: "Tentang", value: employee.bio },
                ]}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </Page>
  );
}

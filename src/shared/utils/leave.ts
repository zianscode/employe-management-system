export function describeLeaveNextStep(status: string, managerName?: string | null): string | null {
  if (status === "PENDING") {
    return managerName ? `Menunggu persetujuan atasan (${managerName})` : "Menunggu persetujuan HR";
  }
  if (status === "MANAGER_APPROVED") return "Menunggu persetujuan akhir HR";
  return null;
}

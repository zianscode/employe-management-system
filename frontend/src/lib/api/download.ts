import { toast } from "sonner";
import { browserTransport } from "./transport";

export async function downloadCSV(path: string, parameters: Record<string, string>) {
  try {
    const response = await browserTransport(`${path}?${new URLSearchParams(parameters)}`, { cache: "no-store" });
    if (!response.ok) {
      const error = await response.json() as { detail?: string };
      throw new Error(error.detail || "Gagal mengekspor CSV");
    }
    const filename = response.headers.get("Content-Disposition")?.match(/filename="?([a-z0-9.-]+\.csv)"?/i)?.[1];
    const url = URL.createObjectURL(await response.blob());
    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || "ekspor.csv";
      link.click();
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Gagal mengekspor CSV");
  }
}

export function downloadReportCSV(report: "attendance" | "salary" | "employees" | "leave", period: string) {
  const [year, month] = period.split("-");
  return downloadCSV(`/reports/${report}.csv`, { year, month });
}

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number;
}

const SEPARATOR = ";";
const UTF8_BOM = "﻿";

function escapeCell(value: string | number): string {
  const text = String(value ?? "");
  return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => escapeCell(c.header)).join(SEPARATOR);
  const body = rows.map((row) => columns.map((c) => escapeCell(c.value(row))).join(SEPARATOR));
  return [header, ...body].join("\n");
}

export function downloadCsv<T>(fileName: string, rows: T[], columns: CsvColumn<T>[]) {
  const blob = new Blob([UTF8_BOM + toCsv(rows, columns)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName.endsWith(".csv") ? fileName : `${fileName}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

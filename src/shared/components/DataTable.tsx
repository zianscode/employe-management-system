import React from "react";
import { Users } from "lucide-react";

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  isLoading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  emptyMessage = "Tidak ada data yang ditemukan",
  isLoading = false,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
        <p className="text-gray-500">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-4 text-left text-sm font-semibold text-gray-700 ${column.className || ""}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-6 py-4 text-sm text-gray-800 ${column.className || ""}`}
                  >
                    {typeof column.accessor === "function"
                      ? column.accessor(item)
                      : (item[column.accessor] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <div className="p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">{emptyMessage}</p>
          <p className="text-gray-400">Coba ubah filter pencarian Anda</p>
        </div>
      )}
    </div>
  );
}

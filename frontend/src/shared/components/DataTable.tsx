import React from "react";
import { Inbox } from "lucide-react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { EmptyState } from "@/shared/components/EmptyState";
import { cn } from "@/shared/utils/cn";

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  emptyDescription?: string;
  emptyIcon?: React.ElementType;
  isLoading?: boolean;
}

const SKELETON_ROWS = 5;

function renderCell<T>(column: Column<T>, item: T): React.ReactNode {
  return typeof column.accessor === "function" ? column.accessor(item) : (item[column.accessor] as React.ReactNode);
}

function withoutAlignment(className?: string) {
  return className?.replace(/\btext-(right|left|center)\b/g, "");
}

export function DataTable<T>({
  columns,
  data,
  emptyMessage = "Tidak ada data",
  emptyDescription,
  emptyIcon = Inbox,
  isLoading = false,
}: DataTableProps<T>) {
  const [primary, ...rest] = columns;
  const mobileFields = rest.filter((column) => column.header);
  const mobileActions = rest.filter((column) => !column.header);

  if (isLoading) {
    return (
      <div className="divide-y" aria-busy="true" aria-label="Memuat data">
        {Array.from({ length: SKELETON_ROWS }, (_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5">
            <Skeleton className="h-4 w-1/3 max-w-48" />
            <Skeleton className="hidden h-4 w-24 md:block" />
            <Skeleton className="hidden h-4 w-20 md:block" />
            <Skeleton className="ml-auto h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return <EmptyState icon={emptyIcon} title={emptyMessage} description={emptyDescription} className="py-10" />;
  }

  return (
    <>
      <ul className="divide-y md:hidden">
        {data.map((item, rowIndex) => (
          <li key={rowIndex} className="space-y-2.5 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className={cn("min-w-0 text-sm text-foreground", withoutAlignment(primary.className))}>
                {renderCell(primary, item)}
              </div>
              {mobileActions.length > 0 && (
                <div className="shrink-0">
                  {mobileActions.map((column, index) => (
                    <React.Fragment key={index}>{renderCell(column, item)}</React.Fragment>
                  ))}
                </div>
              )}
            </div>
            {mobileFields.length > 0 && (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                {mobileFields.map((column, index) => (
                  <div key={index} className="min-w-0">
                    <dt className="text-xs text-muted-foreground">{column.header}</dt>
                    <dd className={cn("mt-0.5 break-words text-sm text-foreground", withoutAlignment(column.className))}>
                      {renderCell(column, item)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </li>
        ))}
      </ul>

      <div className="hidden md:block">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className={cn("px-4 text-xs font-medium text-muted-foreground", column.className)}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex} className={cn("px-4 py-3 text-foreground", column.className)}>
                    {renderCell(column, item)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

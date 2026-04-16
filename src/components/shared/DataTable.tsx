"use client";

import { ReactNode } from "react";
import { Pagination } from "./Pagination";

// Column definition
export interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  align?: "left" | "right" | "center";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyIcon?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  // Pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  rowKey: (item: T) => string;
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyIcon,
  emptyTitle = "No data found",
  emptyDescription = "There are no records to display.",
  emptyAction,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  rowKey,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="w-full">
        {/* Desktop Skeleton Table View */}
        <div className="hidden md:block bg-card text-card-foreground rounded-2xl shadow-sm border border-border overflow-hidden mb-4">
          <div className="p-4 border-b border-border flex gap-4">
            {columns.map((col, i) => (
              <div key={i} className="h-4 bg-muted animate-pulse rounded w-1/4"></div>
            ))}
          </div>
          <div className="divide-y divide-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 flex gap-4">
                {columns.map((col, j) => (
                  <div key={j} className="h-4 bg-muted animate-pulse rounded w-1/4"></div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Skeleton Card View */}
        <div className="flex flex-col gap-4 md:hidden mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card text-card-foreground rounded-xl shadow-sm border border-border p-4 flex flex-col gap-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex justify-between items-center gap-2">
                  <div className="h-3 w-1/3 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 w-1/2 bg-muted animate-pulse rounded"></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0 && totalItems === 0) {
    return (
      <div className="bg-card text-card-foreground rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-12 text-center">
          {emptyIcon && (
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              {emptyIcon}
            </div>
          )}
          <h3 className="text-lg font-bold mb-1">{emptyTitle}</h3>
          <p className="text-muted-foreground mb-6">{emptyDescription}</p>
          {emptyAction}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden md:block bg-card text-card-foreground rounded-2xl shadow-sm border border-border overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted text-muted-foreground uppercase font-semibold text-xs border-b border-border">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-6 py-4 ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                      }`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((item) => (
                <tr key={rowKey(item)} className="hover:bg-muted/50 transition-colors">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-6 py-4 ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                        }`}
                    >
                      {col.render(item)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="flex flex-col gap-4 md:hidden mb-4">
        {data.map((item) => (
          <div key={rowKey(item)} className="bg-card text-card-foreground rounded-xl shadow-sm border border-border p-4 flex flex-col gap-3">
            {columns.map((col) => (
              <div key={col.key} className={`flex ${col.align === "right" ? "flex-row-reverse justify-between" : col.align === "center" ? "flex-col items-center" : "justify-between items-start"} gap-2`}>
                <span className="text-xs font-semibold text-muted-foreground uppercase shrink-0 mt-1">{col.header}</span>
                <div className={`text-sm ${col.align === "right" ? "text-left" : col.align === "center" ? "text-center" : "text-right break-all"}`}>
                  {col.render(item)}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="bg-card text-card-foreground md:rounded-2xl rounded-xl shadow-sm border border-border overflow-hidden">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  );
}

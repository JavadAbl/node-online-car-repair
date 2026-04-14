"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";

import { useVirtualizer } from "@tanstack/react-virtual";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import React, { useImperativeHandle, useRef } from "react";

export default function DataGrid({ data, columns, ref }) {
  const table = useReactTable({
    data,
    columns,
    state: {},

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const parentRef = useRef(null);

  // Virtualizer for big data sets (10k+ rows)
  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 20,
  });

  // Export CSV
  const exportCSV = () => {
    const csv = XLSX.utils.json_to_sheet(
      table.getFilteredRowModel().rows.map((r) => r.original),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, csv, "Data");
    const blob = XLSX.write(wb, { bookType: "csv", type: "array" });
    saveAs(new Blob([blob], { type: "text/csv" }), "data.csv");
  };

  // Export Excel
  const exportExcel = () => {
    const sheet = XLSX.utils.json_to_sheet(
      table.getFilteredRowModel().rows.map((r) => r.original),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Data");
    XLSX.writeFile(wb, "data.xlsx");
  };

  useImperativeHandle(ref, () => ({
    exportCSV,
    exportExcel,
  }));

  return (
    <div className="space-y-4">
      {/* Table with filters + virtualization */}
      <div
        ref={parentRef}
        className=" overflow-auto border rounded-md relative"
      >
        <Table className="w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <React.Fragment key={headerGroup.id}>
                {/* Header labels row */}
                <TableRow>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>

                {/* Filters row */}
                <TableRow>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.column.getCanFilter() ? (
                        <Input
                          value={
                            (header.column.getFilterValue() ?? "") as string
                          }
                          onChange={(e) =>
                            header.column.setFilterValue(e.target.value)
                          }
                          placeholder={`Filter ${header.column.columnDef.header}`}
                          className="h-8"
                        />
                      ) : null}
                    </TableHead>
                  ))}
                </TableRow>
              </React.Fragment>
            ))}
          </TableHeader>

          <TableBody>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = table.getRowModel().rows[virtualRow.index];

              return (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between py-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>

          <span className="text-sm">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

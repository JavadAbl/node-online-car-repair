import FormSheet from "@/components/shared/sheets/form-sheet";
import DataGridVirtual from "@/components/shared/tables/data-grid-virtual";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenu,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useRef, useState } from "react";
import ServiceCreateForm from "./service-create";
import { Pencil, Trash2 } from "lucide-react";
import { Download, FileSpreadsheet, Plus } from "lucide-react";
import { IconButtonWithTooltip } from "@/components/shared/buttons/icon-button-tooltip";
import ActionsDropDown from "@/components/shared/dropdowns/actions-drop-down";

export type User = {
  id: string;
  name: string;
  email: string;
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "ID",
    enableColumnFilter: true,
  },
  {
    accessorKey: "name",
    header: "Name",
    enableColumnFilter: true,
  },
  {
    accessorKey: "email",
    header: "Email",
    enableColumnFilter: true,
  },
  {
    id: "actions",
    header: "actions",
    cell: ({ row }) => (
      <ActionsDropDown
        row={row.original}
        actions={[
          {
            label: "Edit",
            icon: <Pencil className="h-4 w-4" />,
            onClick: (user) => alert("Edit " + user.id),
          },
          {
            label: "Delete",
            icon: <Trash2 className="h-4 w-4" />,
            onClick: (user) => alert("Delete " + user.id),
            destructive: true,
          },
        ]}
      />
    ),
  },
];

export default function ServicesGrid() {
  const gridRef = useRef<{
    exportCSV: () => any;
    exportExcel: () => any;
  }>(null);

  const [open, setOpen] = useState(false);

  const users = useMemo(() => {
    return Array.from({ length: 10000 }, (_, i) => ({
      id: String(i + 1),
      name: "User " + (i + 1),
      email: `user${i + 1}@mail.com`,
    }));
  }, []);

  return (
    <>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <IconButtonWithTooltip
            icon={<Plus className="h-4 w-4" />}
            tooltip="Create Service"
            onClick={() => setOpen(true)}
          />

          <IconButtonWithTooltip
            icon={<Download className="h-4 w-4" />}
            tooltip="Export CSV"
            onClick={() => gridRef.current?.exportCSV()}
          />

          <IconButtonWithTooltip
            icon={<FileSpreadsheet className="h-4 w-4" />}
            tooltip="Export Excel"
            onClick={() => gridRef.current?.exportExcel()}
          />
        </div>

        <DataGridVirtual ref={gridRef} data={users} columns={columns} />
      </div>

      <FormSheet
        open={open}
        setOpen={setOpen}
        title="Create New Service"
        description="Fill the form to create a new service."
      >
        <ServiceCreateForm onClose={() => setOpen(false)} />
      </FormSheet>
    </>
  );
}

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
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">•••</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => alert("Edit " + user.id)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert("Delete " + user.id)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function ServicesGrid() {
  const gridRef = useRef<{ exportCSV: () => any; exportExcel: () => any }>(
    null,
  );
  const [open, setOpen] = useState(false);

  const users = useMemo(() => {
    return Array.from({ length: 10000 }, (_, i) => ({
      id: String(i + 1),
      name: "User " + (i + 1),
      email: `user${i + 1}@mail.com`,
    }));
  }, []);

  /* const [users] = useState(() => {
    return Array.from({ length: 10000 }, (_, i) => ({
      id: String(i + 1),
      name: "User " + (i + 1),
      email: `user${i + 1}@mail.com`,
    }));
  }); */

  return (
    <>
      <div>
        <button onClick={() => gridRef.current?.exportCSV()}>655454</button>
        <Button size="sm" onClick={() => setOpen(true)}>
          Create Service
        </Button>
        <DataGridVirtual ref={gridRef} data={users} columns={columns} />
      </div>

      <FormSheet
        open={open}
        setOpen={setOpen}
        title="Create New Service"
        description="Fill the form to create a new service."
      >
        <ServiceCreateForm />
      </FormSheet>
    </>
  );
}

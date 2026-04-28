import FormSheet from "@/components/shared/sheets/form-sheet";
import DataGridVirtual from "@/components/shared/tables/data-grid-virtual";
import { ColumnDef } from "@tanstack/react-table";
import { useRef, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Download, FileSpreadsheet, Plus } from "lucide-react";
import { IconButtonWithTooltip } from "@/components/shared/buttons/icon-button-tooltip";
import ActionsDropDown from "@/components/shared/dropdowns/actions-drop-down";
import {
  useGetServicesQuery,
  useServiceDeleteMutation,
} from "@/lib/features/service/service-api";
import { ServiceDto } from "@/lib/features/service/schema/responses/service.dto";
import { Skeleton } from "@/components/ui/skeleton";
import ServiceMutate from "./service-mutate";

export default function ServicesGrid() {
  //Hooks-------------------------------------------------
  const gridRef = useRef<{ exportCSV: () => any; exportExcel: () => any }>(
    null,
  );
  const [isShowCreate, setIsShowCreate] = useState(false);
  const [isShowUpdate, setIsShowUpdate] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceDto | null>(
    null,
  );
  const [modalsKey, setModalsKey] = useState(0);

  //Data Hooks-------------------------------------------------
  const { data: servicesRes, isLoading: isLoadingGetServices } =
    useGetServicesQuery();
  const services = servicesRes;

  const [mutateServiceDelete, { isLoading: isLoadingServiceDelete }] =
    useServiceDeleteMutation();

  //Col Defs-------------------------------------------
  const columns: ColumnDef<ServiceDto>[] = [
    {
      accessorKey: "name",
      header: "Name",
      enableColumnFilter: true,
    },
    {
      accessorKey: "description",
      header: "Description",
      enableColumnFilter: true,
    },
    {
      accessorKey: "price",
      header: "Price",
      enableColumnFilter: true,
      cell: ({ row }) => {
        const value = row.original.price;
        return value?.toLocaleString?.() ?? value;
      },
    },

    {
      accessorKey: "discountPercent",
      header: "Discount Percent",
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
              onClick: (service) => {
                setSelectedService(service);
                setIsShowUpdate(true);
              },
            },
            {
              label: "Delete",
              icon: <Trash2 className="h-4 w-4" />,
              onClick: (service) => mutateServiceDelete(service.id),
              destructive: true,
              disabled: isLoadingServiceDelete,
            },
          ]}
        />
      ),
    },
  ];

  //Handlers-------------------------------------------
  const handleModalsKey = () => setModalsKey((val) => val + 1);

  //Component-------------------------------------------
  if (isLoadingGetServices) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>

        <div className="border rounded-md">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <IconButtonWithTooltip
            icon={<Plus className="h-4 w-4" />}
            tooltip="Create Service"
            onClick={() => setIsShowCreate(true)}
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

        <DataGridVirtual
          ref={gridRef}
          data={services?.items}
          columns={columns}
        />
      </div>

      <FormSheet
        key={`create-${modalsKey}`}
        open={isShowCreate}
        setOpen={(open) => {
          setIsShowCreate(open);
          handleModalsKey();
        }}
        title="Create New Service"
        description="Fill the form to create a new service."
      >
        <ServiceMutate
          mode="create"
          onClose={() => {
            handleModalsKey();
            setIsShowCreate(false);
          }}
        />
      </FormSheet>

      <FormSheet
        key={`update-${modalsKey}`}
        open={isShowUpdate}
        setOpen={(open) => {
          setIsShowUpdate(open);
          handleModalsKey();
          setSelectedService(null);
        }}
        title="Update Service"
        description="Fill the form to update the service."
      >
        <ServiceMutate
          id={selectedService?.id}
          mode="update"
          onClose={() => {
            handleModalsKey();
            setIsShowUpdate(false);
          }}
        />
      </FormSheet>
    </>
  );
}

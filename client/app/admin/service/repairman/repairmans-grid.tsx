import FormSheet from "@/components/shared/sheets/form-sheet";
import DataGridVirtual from "@/components/shared/tables/data-grid-virtual";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useRef, useState } from "react";
import { ImageIcon, Pencil, Trash2 } from "lucide-react";
import { Download, FileSpreadsheet, Plus } from "lucide-react";
import { IconButtonWithTooltip } from "@/components/shared/buttons/icon-button-tooltip";
import ActionsDropDown from "@/components/shared/dropdowns/actions-drop-down";
import {
  useGetRepairmansQuery,
  useRepairmanDeleteMutation,
} from "@/lib/features/service/service-api";
import { Skeleton } from "@/components/ui/skeleton";
import { RepairmanDto } from "@/lib/features/service/schema/responses/repairman.dto";
import RepairmanMutate from "./repairman-mutate";
import { RepairmanSetImageDialog } from "./rapairman-set-image";
import { useAppSelector } from "@/lib/hooks/use-state";
import { getAuthorizedImage } from "@/lib/shared/base-api-client";
import { REPAINRMAN_IMAGE_PLACEHOLDER } from "@/lib/shared/styles-classes";

export default function RepairmansGrid() {
  //Hooks-------------------------------------------------
  const gridRef = useRef<{ exportCSV: () => any; exportExcel: () => any }>(
    null,
  );
  const [isShowCreate, setIsShowCreate] = useState(false);
  const [isShowUpdate, setIsShowUpdate] = useState(false);
  const [isShowSetImage, setIsShowSetImage] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RepairmanDto | null>(null);
  const accessToken = useAppSelector((s) => s.auth.accessToken);

  //Data Hooks-------------------------------------------------
  const { data: repairmansRes, isLoading: isLoadingGetRepairmans } =
    useGetRepairmansQuery();
  const repairmans = repairmansRes;

  const [mutateRepairmanDelete, { isLoading: isLoadingRepairmanDelete }] =
    useRepairmanDeleteMutation();

  //Col Defs-------------------------------------------
  const columns: ColumnDef<RepairmanDto>[] = [
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => (
        <RepairmanImageCell
          url={row.original.image}
          accessToken={accessToken!}
        />
      ),
    },

    {
      accessorKey: "repairman",
      header: "Repairman",
      enableColumnFilter: true,
      cell: ({ row }) => {
        const value = row.original;
        return value.firstName + " " + value.lastName;
      },
    },

    {
      accessorKey: "employeeNumber",
      header: "Employee Number",
      enableColumnFilter: true,
    },
    {
      accessorKey: "workShift",
      header: "WorkShift",
      enableColumnFilter: true,
    },

    {
      accessorKey: "rating",
      header: "Rating",
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
                setSelectedItem(service);
                setIsShowUpdate(true);
              },
            },
            {
              label: "Set Image",
              icon: <ImageIcon className="h-4 w-4" />,
              onClick: (service) => {
                setSelectedItem(service);
                setIsShowSetImage(true);
              },
            },
            {
              label: "Delete",
              icon: <Trash2 className="h-4 w-4" />,
              onClick: (service) => mutateRepairmanDelete(service.id),
              destructive: true,
              disabled: isLoadingRepairmanDelete,
            },
          ]}
        />
      ),
    },
  ];

  //Handlers-------------------------------------------

  //Component-------------------------------------------
  if (isLoadingGetRepairmans) {
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

        <DataGridVirtual ref={gridRef} data={repairmans} columns={columns} />
      </div>

      <FormSheet
        open={isShowCreate}
        setOpen={(open) => {
          setIsShowCreate(open);
        }}
        title="Create New Repairman"
        description="Fill the form to create a new Repairman."
      >
        <RepairmanMutate
          mode="create"
          onClose={() => {
            setIsShowCreate(false);
          }}
        />
      </FormSheet>

      <FormSheet
        open={isShowUpdate}
        setOpen={(open) => {
          setIsShowUpdate(open);
          setSelectedItem(null);
        }}
        title="Update Repairman"
        description="Fill the form to update the Repairman."
      >
        <RepairmanMutate
          id={selectedItem?.id}
          mode="update"
          onClose={() => {
            setIsShowUpdate(false);
          }}
        />
      </FormSheet>

      <RepairmanSetImageDialog
        isShow={isShowSetImage}
        setIsShow={setIsShowSetImage}
        repairman={selectedItem}
      />
    </>
  );
}

function RepairmanImageCell({
  url,
  accessToken,
}: {
  url?: string;
  accessToken: string;
}) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;

    let cancelled = false;
    getAuthorizedImage(url, accessToken)
      .then((src) => {
        if (!cancelled) setImageSrc(src);
      })
      .catch(() => {
        if (!cancelled) setImageSrc(null); // fallback on error
      });

    return () => {
      cancelled = true;
    };
  }, [url, accessToken]);

  return (
    <div className="relative h-10 w-10">
      <img
        src={imageSrc ?? REPAINRMAN_IMAGE_PLACEHOLDER}
        alt="Repairman"
        className="object-cover rounded-full size-10"
      />
    </div>
  );
}

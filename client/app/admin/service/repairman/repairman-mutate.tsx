"use client";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/shared/buttons/loading-button";
import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect } from "react";
import {
  RepairmanCreateDto,
  RepairmanCreateSchema,
} from "@/lib/features/service/schema/requests/repairman-create-schema";
import {
  useGetRepairmanByIdQuery,
  useRepairmanCreateMutation,
  useRepairmanUpdateMutation,
} from "@/lib/features/service/service-api";
import { FormMessageFixed } from "@/components/shared/inputs/form-message-fixed";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { enumToSelectOptions } from "@/lib/shared/utils";
import { WorkShift } from "@/lib/features/service/service-enums";

interface Props {
  onClose: () => any;
  mode: "create" | "update";
  id?: number;
}
const defaultValues: RepairmanCreateDto = {
  firstName: "",
  lastName: "",
  employeeNumber: "",
  profession: "",
  //@ts-expect-error null
  workShift: null,
};

export default function RepairmanMutate({ mode, id, onClose }: Props) {
  //Hooks-----------------------------------------------------
  const form = useForm<RepairmanCreateDto>({
    resolver: zodResolver(
      RepairmanCreateSchema,
    ) as Resolver<RepairmanCreateDto>,
    defaultValues,
  });

  //Data Hooks--------------------------------------------------
  const [mutateRepairmanCreate, { isLoading: isLoadingRepairmanCreate }] =
    useRepairmanCreateMutation();

  const [mutateRepairmanUpdate, { isLoading: isLoadingRepairmanUpdate }] =
    useRepairmanUpdateMutation();

  const { data: serviceRes } = useGetRepairmanByIdQuery(id ?? skipToken);
  const repairman = serviceRes;

  useEffect(() => {
    console.log(repairman);

    if (mode === "update" && repairman) {
      form.reset(repairman);
    }
  }, [repairman]);

  //Handlers----------------------------------------------------
  const handleSubmit = async (data: RepairmanCreateDto) => {
    let res: { error?: any };

    switch (mode) {
      case "create":
        res = await mutateRepairmanCreate(data);
        break;

      case "update":
        res = await mutateRepairmanUpdate({ body: data, id: id! });
        break;
    }
    if (!res?.error) onClose();
  };

  if (!mode || (mode === "update" && !id)) return null;

  //Component----------------------------------------------------
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col w-full max-w-md"
      >
        {/* employeeNumber */}
        <FormField
          control={form.control}
          name="employeeNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>employeeNumber</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessageFixed />
            </FormItem>
          )}
        />

        {/* First Name */}
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessageFixed />
            </FormItem>
          )}
        />

        {/* Last Name */}
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessageFixed />
            </FormItem>
          )}
        />

        {/* profession */}
        <FormField
          control={form.control}
          name="profession"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profession</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessageFixed />
            </FormItem>
          )}
        />

        {/* Work Shift */}
        <FormField
          control={form.control}
          name="workShift"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Work Shift</FormLabel>
              <Select
                onValueChange={(e) => e !== "" && field.onChange(e)}
                value={field.value}
                required
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select work shift" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {enumToSelectOptions(WorkShift).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessageFixed />
            </FormItem>
          )}
        />

        <LoadingButton
          type="submit"
          className="w-full"
          isLoading={isLoadingRepairmanCreate || isLoadingRepairmanUpdate}
        >
          {mode === "create" ? "Create Repairman" : "Update Repairman"}
        </LoadingButton>
      </form>
    </Form>
  );
}

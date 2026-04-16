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
import NumberInput from "@/components/shared/inputs/number-input";
import { FormMessageFixed } from "@/components/shared/inputs/form-message-fixed";
import {
  ServiceCreateDto,
  ServiceCreateSchema,
} from "@/lib/features/service/schema/requests/service-create-schema";
import {
  useGetServiceByIdQuery,
  useServiceCreateMutation,
  useServiceUpdateMutation,
} from "@/lib/features/service/service-api";
import { LoadingButton } from "@/components/shared/buttons/loading-button";
import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect } from "react";

interface Props {
  onClose: () => any;
  mode: "create" | "update";
  id?: number;
}
const defaultValues: ServiceCreateDto = {
  name: "",
  price: NaN,
};

export default function ServiceMutate({ mode, id, onClose }: Props) {
  //Hooks-----------------------------------------------------
  const form = useForm<ServiceCreateDto>({
    resolver: zodResolver(ServiceCreateSchema) as Resolver<ServiceCreateDto>,
    defaultValues,
  });
  const { setValue } = form;

  //Data Hooks--------------------------------------------------
  const [mutateServiceCreate, { isLoading: isLoadingServiceCreate }] =
    useServiceCreateMutation();

  const [mutateServiceUpdate, { isLoading: isLoadingServiceUpdate }] =
    useServiceUpdateMutation();

  const { data: serviceRes } = useGetServiceByIdQuery(id ?? skipToken);
  const service = serviceRes;

  useEffect(() => {
    if (mode === "update" && service) {
      form.reset({
        name: service.name,
        price: service.price,
      });
    }
  }, [service, mode, form]);

  //Handlers----------------------------------------------------
  const handleSubmit = async (data: ServiceCreateDto) => {
    let res: { error?: any };

    switch (mode) {
      case "create":
        res = await mutateServiceCreate(data);
        break;

      case "update":
        res = await mutateServiceUpdate({ body: data, id: id! });
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
        className="space-y-1 w-full max-w-md"
      >
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Name</FormLabel>
              <FormControl>
                <Input placeholder="Example: Web Design" {...field} />
              </FormControl>
              <FormMessageFixed />
            </FormItem>
          )}
        />

        {/* Price */}
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <NumberInput field={field} />
              </FormControl>
              <FormMessageFixed />
            </FormItem>
          )}
        />

        <LoadingButton
          type="submit"
          className="w-full"
          isLoading={isLoadingServiceCreate || isLoadingServiceUpdate}
        >
          {mode === "create" ? "Create Service" : "Update Service"}
        </LoadingButton>
      </form>
    </Form>
  );
}

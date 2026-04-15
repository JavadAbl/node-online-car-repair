"use client";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
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
import { useServiceCreateMutation } from "@/lib/features/service/service-api";
import { toast } from "sonner";

interface Props {
  onClose: () => any;
}
const defaultValues: ServiceCreateDto = {
  name: "",
  price: NaN,
};

export default function ServiceCreateForm({ onClose }: Props) {
  const form = useForm<ServiceCreateDto>({
    resolver: zodResolver(ServiceCreateSchema) as Resolver<ServiceCreateDto>,
    defaultValues,
  });

  const [mutateServiceCreate, { isLoading: isLoadingServiceCreate }] =
    useServiceCreateMutation();

  const handleSubmit = async (data: ServiceCreateDto) => {
    console.log(data);
    const res = await mutateServiceCreate(data);
    if (!res.error) onClose();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 w-full max-w-md"
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

        <Button type="submit" className="w-full">
          Create Service
        </Button>
      </form>
    </Form>
  );
}

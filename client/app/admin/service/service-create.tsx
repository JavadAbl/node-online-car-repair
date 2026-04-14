"use client";

import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

const ServiceCreateSchema = z.object({
  name: z.string().min(2, "Name is required"),
  // Use .nanToUndefined or preprocess if you want empty input to be valid,
  // otherwise standard z.number() works for validation.
  price: z.number("Price is required").min(0, "Price must be positive"),
});

export type ServiceCreateDto = z.infer<typeof ServiceCreateSchema>;

const defaultValues: ServiceCreateDto = {
  name: "",
  price: NaN,
};

export default function ServiceCreateForm() {
  const form = useForm<ServiceCreateDto>({
    resolver: zodResolver(ServiceCreateSchema) as Resolver<ServiceCreateDto>,
    defaultValues,
  });

  const handleSubmit = (data: ServiceCreateDto) => {
    console.log(data);
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

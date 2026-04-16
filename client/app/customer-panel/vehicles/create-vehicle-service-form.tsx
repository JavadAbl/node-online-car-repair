"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormInput } from "@/components/shared/inputs/form-input";
import { FormTextarea } from "@/components/shared/inputs/form-textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import {
  CreateVehicleServiceDto,
  createVehicleServiceSchema,
} from "@/lib/features/vehicle-serivce/schema/create-vehicle-service-schema";
import { createVehicleServiceAction } from "@/lib/features/vehicle-serivce/actions/create-vehicle-service-action";

interface CreateVehicleServiceFormProps {
  vehicleId: number;
  services: { id: number; name: string }[];
}

const defaultValues: CreateVehicleServiceDto = {
  serviceDate: "",
  mileageAtService: "" as unknown as number,
  technicianName: "",
  description: null,
  serviceId: 0,
};

export default function CreateVehicleServiceForm({
  vehicleId,
  services,
}: CreateVehicleServiceFormProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);

  const form = useForm<CreateVehicleServiceDto>({
    resolver: zodResolver(createVehicleServiceSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(values: CreateVehicleServiceDto) {
    setServerError(null);
    setServerSuccess(null);

    startTransition(async () => {
      const result = await createVehicleServiceAction(values, { vehicleId });

      if (!result?.success) {
        setServerError(result?.error ?? "Failed to create service record.");

        if (result?.fieldErrors) {
          for (const [key, msgs] of Object.entries(result.fieldErrors)) {
            const message = msgs?.[0];
            if (!message) continue;

            form.setError(key as keyof CreateVehicleServiceDto, {
              type: "server",
              message,
            });
          }
        }

        return;
      }

      setServerSuccess("Service record created successfully!");
      form.reset(defaultValues);
    });
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-6">
      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Log Vehicle Service</CardTitle>
          <CardDescription className="text-muted-foreground">
            Record a new service entry for this vehicle
          </CardDescription>
        </CardHeader>
        <CardContent>
          {serverSuccess && (
            <Alert className="mb-6 bg-primary/10 border-primary text-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertDescription>{serverSuccess}</AlertDescription>
            </Alert>
          )}

          {serverError && (
            <Alert className="mb-6 bg-destructive/10 border-destructive text-foreground">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Added items-start to ensure columns align to the top if heights differ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Service Date */}
                <FormField
                  control={form.control}
                  name="serviceDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        Service Date *
                      </FormLabel>
                      <FormControl>
                        <FormInput
                          type="date"
                          {...field}
                          // FIX 1: Added w-full to stretch input to column width
                          className="w-full bg-background text-foreground border-input"
                        />
                      </FormControl>
                      {/* FIX 2: Added empty description to match the height of the neighbor field (Mileage) */}
                      <FormDescription className="text-muted-foreground">
                        When was the service performed?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Mileage at Service */}
                <FormField
                  control={form.control}
                  name="mileageAtService"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        Mileage at Service *
                      </FormLabel>
                      <FormControl>
                        <FormInput
                          type="number"
                          placeholder="e.g., 45000"
                          {...field}
                          // FIX 1: Added w-full
                          className="w-full bg-background text-foreground border-input"
                        />
                      </FormControl>
                      <FormDescription className="text-muted-foreground">
                        Current odometer reading
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Technician Name */}
                <FormField
                  control={form.control}
                  name="technicianName"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-foreground">
                        Technician Name *
                      </FormLabel>
                      <FormControl>
                        <FormInput
                          placeholder="Enter technician's full name"
                          {...field}
                          // FIX 1: Added w-full
                          className="w-full bg-background text-foreground border-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Service Type */}
                <FormField
                  control={form.control}
                  name="serviceId"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-foreground">
                        Service Type *
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          value={
                            (field?.value && String(field?.value)) ||
                            ("" as any)
                          }
                        >
                          {/* FIX 1: Added w-full to SelectTrigger */}
                          <SelectTrigger className="w-full bg-background text-foreground border-input">
                            <SelectValue placeholder="Select a service type" />
                          </SelectTrigger>

                          <SelectContent className="bg-popover text-popover-foreground border-border">
                            {services.map((service) => (
                              <SelectItem
                                key={service.id}
                                value={service.id.toString()}
                                className="focus:bg-accent focus:text-accent-foreground"
                              >
                                {service.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-foreground">
                        Description
                      </FormLabel>
                      <FormControl>
                        <FormTextarea
                          placeholder="Add notes about the service performed..."
                          // FIX 1: Added w-full
                          className="w-full resize-none bg-background text-foreground border-input"
                          rows={4}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription className="text-muted-foreground">
                        Optional details about parts replaced, observations,
                        etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  className="border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                  onClick={() => form.reset(defaultValues)}
                  disabled={isPending}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isPending ? "Saving..." : "Save Service Record"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

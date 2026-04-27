"use client";
import { LoadingButton } from "@/components/shared/buttons/loading-button";
import { ContentCard } from "@/components/shared/cards/content-card";
import { FormInput } from "@/components/shared/inputs/form-input";
import { FormMessageFixed } from "@/components/shared/inputs/form-message-fixed";
import { FormTextarea } from "@/components/shared/inputs/form-textarea";
import NumberInput from "@/components/shared/inputs/number-input";
import { Button } from "@/components/ui/button";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  Form,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetServicesQuery,
  useGetTechniciansQuery,
} from "@/lib/features/service/service-api";
import {
  VehicleServiceCreateDto,
  VehicleServiceCreateSchema,
} from "@/lib/features/vehicle/schema/requests/vehicle-service-create.schema";
import {
  useGetCustomerVehiclesQuery,
  useVehicleServiceCreateMutation,
} from "@/lib/features/vehicle/vehicle-api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

const defaultValues: VehicleServiceCreateDto = {
  serviceDate: "",
  mileageAtService: "" as unknown as number,
  description: null,
  serviceId: 0,
  technicianId: 0,
  vehicleId: 0,
};

export default function CreateVehicleService() {
  const router = useRouter();

  const form = useForm<VehicleServiceCreateDto>({
    resolver: zodResolver(VehicleServiceCreateSchema),
    defaultValues,
    mode: "onChange",
  });

  //Data Hooks------------------------------------------------
  const { data: servicesRes, isLoading: isLoadingServices } =
    useGetServicesQuery();
  const services = servicesRes?.items;

  const { data: vehiclesRes, isLoading: isloadingVehicles } =
    useGetCustomerVehiclesQuery({
      pageSize: 100,
    });
  const vehicles = vehiclesRes?.items;

  const { data: techniciansRes, isLoading: isLoadingTechnicians } =
    useGetTechniciansQuery({
      pageSize: 100,
    });
  const technicians = techniciansRes?.items;

  const [mutateCreate, { isLoading: isLoadingCreate }] =
    useVehicleServiceCreateMutation();

  const handleSubmit = async (values: VehicleServiceCreateDto) => {
    const res = await mutateCreate(values);
    if (!res.error) router.back();
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-8">
      <ContentCard>
        <CardHeader>
          <CardTitle>Create Vehicle Service Record</CardTitle>
          <CardDescription>
            Add a new service record for a vehicle
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vehicle Selection */}
                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle *</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value ? String(field.value) : ""}
                        disabled={isloadingVehicles}
                      >
                        <FormControl>
                          <>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  isloadingVehicles
                                    ? "Loading vehicles..."
                                    : "Select a vehicle"
                                }
                              />
                            </SelectTrigger>

                            <SelectContent>
                              {vehicles?.map((vehicle) => (
                                <SelectItem
                                  key={vehicle.id}
                                  value={String(vehicle.id)}
                                >
                                  {vehicle.year} {vehicle.make} {vehicle.model}{" "}
                                  - {vehicle.licensePlate || vehicle.vin}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </>
                        </FormControl>
                      </Select>
                      <FormMessageFixed />
                    </FormItem>
                  )}
                />

                {/* Service Type Selection */}
                <FormField
                  control={form.control}
                  name="serviceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Type *</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value ? String(field.value) : ""}
                        disabled={isLoadingServices}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isLoadingServices
                                  ? "Loading services..."
                                  : "Select a service"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {services?.map((service) => (
                            <SelectItem
                              key={service.id}
                              value={String(service.id)}
                            >
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessageFixed />
                    </FormItem>
                  )}
                />

                {/* Technician Selection */}
                <FormField
                  control={form.control}
                  name="technicianId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technician *</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value ? String(field.value) : ""}
                        disabled={isLoadingTechnicians}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isLoadingTechnicians
                                  ? "Loading technicians..."
                                  : "Select a technician"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {technicians?.map((technician) => (
                            <SelectItem
                              key={technician.id}
                              value={String(technician.id)}
                            >
                              {technician.firstName} {technician.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessageFixed />
                    </FormItem>
                  )}
                />

                {/* Service Date */}
                <FormField
                  control={form.control}
                  name="serviceDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Date *</FormLabel>
                      <FormControl>
                        <FormInput type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessageFixed />
                    </FormItem>
                  )}
                />

                {/* Mileage at Service */}
                <FormField
                  control={form.control}
                  name="mileageAtService"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mileage at Service (km) *</FormLabel>
                      <FormControl>
                        <NumberInput
                          type="number"
                          placeholder="e.g., 45000"
                          field={field}
                        />
                      </FormControl>
                      <FormMessageFixed />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <FormTextarea
                        placeholder="Add service details, notes, or observations..."
                        className="resize-none"
                        rows={5}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional field for additional service information
                    </FormDescription>
                    <FormMessageFixed />
                  </FormItem>
                )}
              />

              {/* Form Actions */}
              <div className="flex justify-between gap-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <LoadingButton isLoading={isLoadingCreate} type="submit">
                  Create Service Record
                </LoadingButton>
              </div>
            </form>
          </Form>
        </CardContent>
      </ContentCard>
    </div>
  );
}

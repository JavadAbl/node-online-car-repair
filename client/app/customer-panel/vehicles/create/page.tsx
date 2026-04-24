"use client";

import { useState } from "react";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormInput } from "@/components/shared/inputs/form-input";
import { FormTextarea } from "@/components/shared/inputs/form-textarea";
import { useVehicleCreateMutation } from "@/lib/features/vehicle/vehicle-api";
import {
  VehicleCreateDto,
  VehicleCreateSchema,
} from "@/lib/features/vehicle/schema/requests/vehicle-create.schema";
import { useRouter } from "next/navigation";
import { ContentCard } from "@/components/shared/cards/content-card";
import { LoadingButton } from "@/components/shared/buttons/loading-button";
import { cn, enumToSelectOptions } from "@/lib/shared/utils";
import {
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  VEHICLE_STATUS,
} from "@/lib/features/vehicle/vehicle-enums";
import NumberInput from "@/components/shared/inputs/number-input";
import { FormMessageFixed } from "@/components/shared/inputs/form-message-fixed";

const defaultValues: Partial<VehicleCreateDto> = {
  vin: "",
  make: "",
  model: "",
  year: null as unknown as number,
  trim: "",
  status: undefined,
  fuelType: undefined,
  transmission: undefined,
  engine: "",
  color: "",
  mileage: NaN,
  licensePlate: "",
  state: null,
  description: null,
};

export default function CreateVehicleForm() {
  const [activeTab, setActiveTab] = useState("basic");
  const router = useRouter();

  const form = useForm<VehicleCreateDto>({
    resolver: zodResolver(VehicleCreateSchema) as Resolver<VehicleCreateDto>,
    defaultValues: defaultValues as VehicleCreateDto,
    mode: "onChange",
  });

  //DataHooks------------------------------------------------------
  const [mutateCreate, { isLoading: isLoadingCreate }] =
    useVehicleCreateMutation();

  const handleSubmit = async (values: VehicleCreateDto) => {
    const res = await mutateCreate(values);
    if (!res.error) router.back();
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-8">
      <ContentCard>
        <CardHeader>
          <CardTitle>Create New Vehicle</CardTitle>
          <CardDescription>Add a new vehicle to the system</CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-8"
            >
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="specifications">
                    Specifications
                  </TabsTrigger>
                  <TabsTrigger value="additional">Additional</TabsTrigger>
                </TabsList>

                {/* Basic Information Tab */}
                <TabsContent value="basic">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* VIN */}
                    <FormField
                      control={form.control}
                      name="vin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>VIN *</FormLabel>
                          <FormControl>
                            <FormInput
                              placeholder="Enter 17-character VIN"
                              {...field}
                              maxLength={17}
                              className="uppercase"
                            />
                          </FormControl>
                          <FormMessageFixed />
                        </FormItem>
                      )}
                    />

                    {/* Make */}
                    <FormField
                      control={form.control}
                      name="make"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Make *</FormLabel>
                          <FormControl>
                            <FormInput
                              className={cn("border-border")}
                              placeholder="e.g., Toyota, Honda, BMW"
                              {...field}
                            />
                          </FormControl>
                          <FormMessageFixed />
                        </FormItem>
                      )}
                    />

                    {/* Model */}
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model *</FormLabel>
                          <FormControl>
                            <FormInput
                              placeholder="e.g., Camry, Civic, 3 Series"
                              {...field}
                            />
                          </FormControl>
                          <FormMessageFixed />
                        </FormItem>
                      )}
                    />

                    {/* Year */}
                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year *</FormLabel>
                          <FormControl>
                            <NumberInput
                              type="number"
                              placeholder="e.g., 2023"
                              field={field}
                            />
                          </FormControl>
                          <FormMessageFixed />
                        </FormItem>
                      )}
                    />

                    {/* Trim */}
                    <FormField
                      control={form.control}
                      name="trim"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trim *</FormLabel>
                          <FormControl>
                            <FormInput
                              placeholder="e.g., SE, LE, XLE"
                              {...field}
                            />
                          </FormControl>
                          <FormMessageFixed />
                        </FormItem>
                      )}
                    />

                    {/* Status */}
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status *</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={(e) =>
                                e !== "" && field.onChange(e)
                              }
                              value={field.value || ""}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>

                              <SelectContent>
                                {enumToSelectOptions(VEHICLE_STATUS).map(
                                  (option) => (
                                    <SelectItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </SelectItem>
                                  ),
                                )}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessageFixed />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Specifications Tab */}
                <TabsContent value="specifications" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Fuel Type */}
                    <FormField
                      control={form.control}
                      name="fuelType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fuel Type *</FormLabel>
                          <Select
                            onValueChange={(e) => e !== "" && field.onChange(e)}
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select fuel type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {enumToSelectOptions(FUEL_TYPES).map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessageFixed />
                        </FormItem>
                      )}
                    />

                    {/* Transmission */}
                    <FormField
                      control={form.control}
                      name="transmission"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transmission *</FormLabel>
                          <Select
                            onValueChange={(e) => e !== "" && field.onChange(e)}
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select transmission" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {enumToSelectOptions(TRANSMISSION_TYPES).map(
                                (option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessageFixed />
                        </FormItem>
                      )}
                    />

                    {/* Engine */}
                    <FormField
                      control={form.control}
                      name="engine"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Engine *</FormLabel>
                          <FormControl>
                            <FormInput
                              placeholder="e.g., 2.5L V6, 3.0L Turbo"
                              {...field}
                            />
                          </FormControl>
                          <FormMessageFixed />
                        </FormItem>
                      )}
                    />

                    {/* Color */}
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color *</FormLabel>
                          <FormControl>
                            <FormInput
                              placeholder="e.g., Black, Silver, Red"
                              {...field}
                            />
                          </FormControl>
                          <FormMessageFixed />
                        </FormItem>
                      )}
                    />

                    {/* Mileage */}
                    <FormField
                      control={form.control}
                      name="mileage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mileage (km) *</FormLabel>
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
                </TabsContent>

                {/* Additional Information Tab */}
                <TabsContent value="additional" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* License Plate */}
                    <FormField
                      control={form.control}
                      name="licensePlate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License Plate *</FormLabel>
                          <FormControl>
                            <FormInput
                              placeholder="e.g., ABC-1234"
                              {...field}
                            />
                          </FormControl>
                          <FormMessageFixed />
                        </FormItem>
                      )}
                    />

                    {/* State */}
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <FormInput
                              placeholder="e.g., CA, NY, TX"
                              {...field}
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
                            placeholder="Add any additional notes or details about the vehicle..."
                            className="resize-none"
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional field for additional vehicle information
                        </FormDescription>
                        <FormMessageFixed />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

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
                  {"Create Vehicle"}
                </LoadingButton>
              </div>
            </form>
          </Form>
        </CardContent>
      </ContentCard>
    </div>
  );
}

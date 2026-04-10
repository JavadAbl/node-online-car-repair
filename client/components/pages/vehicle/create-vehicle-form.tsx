"use client";

import { useState, useTransition } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreateVehicleDto,
  createVehicleSchema,
} from "@/lib/features/vehicle/schema/create-vehicle-schema";
import { FormInput } from "@/components/shared/form-input";
import { FormTextarea } from "@/components/shared/form-textarea";
import { createVehicleAction } from "@/lib/features/vehicle/actions/create-vehicle-action";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const defaultValues: CreateVehicleDto = {
  // Basic Info
  vin: "",
  make: "",
  model: "",
  year: null as unknown as number,
  trim: null,
  status: null,

  // Specifications
  fuelType: null,
  transmission: null,
  engine: null,
  color: null,
  mileage: null,

  // Additional
  licensePlate: null,
  state: null,
  description: null,
};

export default function CreateVehicleForm() {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");

  const form = useForm<CreateVehicleDto>({
    resolver: zodResolver(createVehicleSchema) as Resolver<CreateVehicleDto>,
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(values: CreateVehicleDto) {
    setServerError(null);
    setServerSuccess(null);

    startTransition(async () => {
      const result = await createVehicleAction(values);

      if (!result?.success) {
        setServerError(result?.error ?? "Failed to create vehicle.");

        // Map server fieldErrors back to RHF
        if (result?.fieldErrors) {
          for (const [key, msgs] of Object.entries(result.fieldErrors)) {
            const message = msgs?.[0];
            if (!message) continue;

            form.setError(key as keyof CreateVehicleDto, {
              type: "server",
              message,
            });
          }
        }

        return;
      }

      setServerSuccess("Vehicle created successfully!");
      form.reset(defaultValues);
    });
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Vehicle</CardTitle>
          <CardDescription>Add a new vehicle to the system</CardDescription>
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                <TabsContent value="basic" className="space-y-6">
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
                          <FormDescription>
                            Vehicle Identification Number
                          </FormDescription>
                          <FormMessage />
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
                              placeholder="e.g., Toyota, Honda, BMW"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
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
                          <FormMessage />
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
                            <FormInput
                              type="number"
                              placeholder="e.g., 2023"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Trim */}
                    <FormField
                      control={form.control}
                      name="trim"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trim</FormLabel>
                          <FormControl>
                            <FormInput
                              placeholder="e.g., SE, LE, XLE"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
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
                              onValueChange={field.onChange}
                              // defaultValue={field.value}
                              value={field.value || ""}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>

                              <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="InRepair">
                                  In Repair
                                </SelectItem>
                                <SelectItem value="ReadyForPickup">
                                  Ready For Pickup
                                </SelectItem>
                                <SelectItem value="Archived">
                                  Archived
                                </SelectItem>
                                <SelectItem value="UnderWarranty">
                                  Under Warranty
                                </SelectItem>
                                <SelectItem value="InService">
                                  In Service
                                </SelectItem>
                                <SelectItem value="OnLoan">On Loan</SelectItem>
                                <SelectItem value="NotOperational">
                                  Not Operational
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
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
                          <FormLabel>Fuel Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select fuel type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Gasoline">Gasoline</SelectItem>
                              <SelectItem value="Diesel">Diesel</SelectItem>
                              <SelectItem value="Electric">Electric</SelectItem>
                              <SelectItem value="Hybrid">Hybrid</SelectItem>
                              <SelectItem value="PlugInHybrid">
                                Plug-in Hybrid
                              </SelectItem>
                              <SelectItem value="Hydrogen">Hydrogen</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Transmission */}
                    <FormField
                      control={form.control}
                      name="transmission"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transmission</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select transmission" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Automatic">
                                Automatic
                              </SelectItem>
                              <SelectItem value="Manual">Manual</SelectItem>
                              <SelectItem value="CVT">CVT</SelectItem>
                              <SelectItem value="DualClutch">
                                Dual Clutch
                              </SelectItem>
                              <SelectItem value="Robotic">Robotic</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Engine */}
                    <FormField
                      control={form.control}
                      name="engine"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Engine</FormLabel>
                          <FormControl>
                            <FormInput
                              placeholder="e.g., 2.5L V6, 3.0L Turbo"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Color */}
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <FormControl>
                            <FormInput
                              placeholder="e.g., Black, Silver, Red"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Mileage */}
                    <FormField
                      control={form.control}
                      name="mileage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mileage (km)</FormLabel>
                          <FormControl>
                            <FormInput
                              type="number"
                              placeholder="e.g., 45000"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
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
                          <FormLabel>License Plate</FormLabel>
                          <FormControl>
                            <FormInput
                              placeholder="e.g., ABC-1234"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
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
                          <FormMessage />
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              {/* Form Actions */}
              <div className="flex justify-between gap-4 pt-6 border-t">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Creating..." : "Create Vehicle"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

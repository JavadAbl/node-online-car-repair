"use client";

import { ContentCard } from "@/components/shared/cards/content-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useGetTechniciansQuery } from "@/lib/features/service/service-api";
import { WorkShift } from "@/lib/features/service/service-enums";
import { VehicleDto } from "@/lib/features/vehicle/schema/responses/vehicle.dto";
import { useGetCustomerVehiclesQuery } from "@/lib/features/vehicle/vehicle-api";
import { useAppSelector } from "@/lib/hooks/use-state";
import { getAuthorizedImage } from "@/lib/shared/base-api-client";
import {
  Background_Gradient,
  TECHNICIAN_IMAGE_PLACEHOLDER,
} from "@/lib/shared/styles-classes";
import { cn } from "@/lib/shared/utils";
import {
  Wrench,
  Calendar,
  Gauge,
  User,
  Car,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  TrendingUp,
  ChevronRight,
  DollarSign,
} from "lucide-react";
import { useEffect, useState } from "react";

// Mock Data
const mockServices: ServiceDto[] = [
  {
    id: 1,
    name: "Full Synthetic Oil Change",
    description: "Premium synthetic oil change with filter replacement",
    price: 89.99,
    discountPercent: 10,
  },
  {
    id: 2,
    name: "Brake Pad Replacement",
    description: "Complete brake pad replacement with inspection",
    price: 249.99,
    discountPercent: 5,
  },
  {
    id: 3,
    name: "Engine Diagnostic",
    description: "Comprehensive engine diagnostic scan",
    price: 129.99,
    discountPercent: 15,
  },
  {
    id: 4,
    name: "Tire Rotation & Balance",
    description: "4-wheel tire rotation and balancing service",
    price: 59.99,
    discountPercent: 0,
  },
  {
    id: 5,
    name: "AC System Service",
    description: "Air conditioning system check and recharge",
    price: 149.99,
    discountPercent: 20,
  },
];

const mockVehicle: VehicleDto = {
  id: 101,
  vin: "1HGCM82633A004352",
  make: "Honda",
  model: "Accord",
  year: 2022,
  trim: "Sport",
  fuelType: "gasoline",
  transmission: "automatic",
  engine: "1.5L Turbo",
  color: "Pearl White",
  mileage: 28450,
  licensePlate: "ABC1234",
  state: "CA",
  customerId: 1,
  status: "active",
  createdAt: "2023-01-15T10:30:00Z",
  updatedAt: "2024-01-10T15:20:00Z",
};

const mockVehicleService: VehicleServiceDto = {
  id: 501,
  serviceDate: "2024-01-25T09:00:00Z",
  mileageAtService: 28000,
  technicianName: "Michael Chen",
  status: "reserved",
  description: "Regular maintenance - Oil change and inspection",
  createdAt: "2024-01-15T14:30:00Z",
  updatedAt: "2024-01-20T11:15:00Z",
  vehicleId: 101,
  serviceId: 1,
  technicianId: 201,
};

// Helper Components
const StatusBadge = ({ status }: { status: VehicleServiceDto["status"] }) => {
  const statusConfig = {
    reserved: {
      label: "Reserved",
      icon: Clock,
      variant: "secondary" as const,
      className: "bg-blue-100 text-blue-700 border-blue-200",
    },
    done: {
      label: "Completed",
      icon: CheckCircle2,
      variant: "default" as const,
      className: "bg-green-100 text-green-700 border-green-200",
    },
    canceled: {
      label: "Canceled",
      icon: XCircle,
      variant: "destructive" as const,
      className: "bg-red-100 text-red-700 border-red-200",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`gap-1 ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
      <span className="ml-2 text-sm font-medium text-muted-foreground">
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

const WorkShiftBadge = ({ shift }: { shift: WorkShift }) => {
  const shiftConfig = {
    Morning: { label: "Morning", className: "bg-orange-100 text-orange-700" },
    Afternoon: {
      label: "Afternoon",
      className: "bg-yellow-100 text-yellow-700",
    },
    Evening: { label: "Evening", className: "bg-purple-100 text-purple-700" },
    Night: { label: "Night", className: "bg-indigo-100 text-indigo-700" },
  };

  const config = shiftConfig[shift];

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};

// Main Dashboard Component
export default function CustomerOverviewPage() {
  // Hooks----------------------------------------------------
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const [techniciansAvatars, setTechniciansAvatars] = useState<
    Record<string, string | null>
  >({});

  //Data Hooks----------------------------------------------------
  const { data: technicians } = useGetTechniciansQuery({
    pageSize: 5,
    sortBy: "rating",
    sortOrder: "desc",
  });

  useEffect(() => {
    const fetchAvatars = async () => {
      const urls: Record<string, string | null> = {};
      for (const technician of technicians || []) {
        urls[technician.id] = await getAuthorizedImage(
          technician.image,
          accessToken!,
        );
      }
      setTechniciansAvatars(urls);
    };

    if (technicians?.length && accessToken) {
      fetchAvatars();
    }
  }, [technicians, accessToken]);

  return (
    <div className={cn("min-h-screen")}>
      {/* <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50"> */}
      <div className="container flex flex-col gap-6 mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="">
          <h1 className="text-3xl font-bold tracking-tight text-chart-2">
            Welcome back, John!
          </h1>
          <p className="mt-2 text-card-foreground">
            {"Here's what's happening with your vehicle services today."}
          </p>
        </div>

        {/* Quick Actions */}
        <div className=" grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Button
            variant="outline"
            className="h-auto flex-col items-center justify-center p-4 hover:bg-slate-50"
          >
            <Calendar className="mb-2 h-6 w-6 text-blue-500" />
            <span className="text-sm font-medium">Schedule Service</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col items-center justify-center p-4 hover:bg-slate-50"
          >
            <Car className="mb-2 h-6 w-6 text-green-500" />
            <span className="text-sm font-medium">Add Vehicle</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col items-center justify-center p-4 hover:bg-slate-50"
          >
            <DollarSign className="mb-2 h-6 w-6 text-yellow-500" />
            <span className="text-sm font-medium">View Estimates</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col items-center justify-center p-4 hover:bg-slate-50"
          >
            <AlertCircle className="mb-2 h-6 w-6 text-red-500" />
            <span className="text-sm font-medium">Emergency</span>
          </Button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Vehicle & Current Service */}
          <div className="space-y-6 lg:col-span-1">
            {/* Vehicle ContentCard */}
            <ContentCard>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    Your Vehicle
                  </CardTitle>
                  <Car className="h-5 w-5 text-slate-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Make & Model
                    </span>
                    <span className="font-medium">
                      {mockVehicle.year} {mockVehicle.make} {mockVehicle.model}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      License Plate
                    </span>
                    <Badge variant="outline" className="font-mono">
                      {mockVehicle.licensePlate}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">VIN</span>
                    <span className="font-mono text-sm">{mockVehicle.vin}</span>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Current Mileage
                    </span>
                    <span className="font-semibold text-lg">
                      {mockVehicle.mileage?.toLocaleString()} mi
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Status
                    </span>
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-700"
                    >
                      {mockVehicle.status}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full" size="sm">
                  View Details
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </ContentCard>

            {/* Current Service ContentCard */}
            <ContentCard>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    Upcoming Service
                  </CardTitle>
                  <StatusBadge status={mockVehicleService.status} />
                </div>
                <CardDescription>Next scheduled maintenance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {new Date(
                          mockVehicleService.serviceDate,
                        ).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(
                          mockVehicleService.serviceDate,
                        ).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {mockVehicleService.technicianName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Assigned Technician
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Gauge className="h-5 w-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {mockVehicleService.mileageAtService.toLocaleString()}{" "}
                        miles
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Mileage at service
                      </p>
                    </div>
                  </div>
                  {mockVehicleService.description && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Notes
                        </p>
                        <p className="text-sm">
                          {mockVehicleService.description}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" size="sm">
                    Reschedule
                  </Button>
                  <Button variant="outline" className="flex-1" size="sm">
                    Contact
                  </Button>
                </div>
              </CardContent>
            </ContentCard>
          </div>

          {/* Right Column - Services & Repairmen */}
          <div className="space-y-6 lg:col-span-2">
            {/* Latest Services */}
            <ContentCard>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      Latest Services
                    </CardTitle>
                    <CardDescription>
                      Recently offered maintenance services
                    </CardDescription>
                  </div>
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[320px] pr-4">
                  <div className="space-y-3">
                    {mockServices.map((service) => {
                      const discountedPrice =
                        service.price * (1 - service.discountPercent / 100);
                      return (
                        <div
                          key={service.id}
                          className="group flex items-start justify-between rounded-lg p-3 transition-colors hover:bg-slate-50"
                        >
                          <div className="flex items-start gap-3">
                            <div className="rounded-full bg-blue-100 p-2">
                              <Wrench className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{service.name}</p>
                                {service.discountPercent > 0 && (
                                  <Badge className="bg-red-100 text-red-700">
                                    -{service.discountPercent}%
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {service.description}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              {service.discountPercent > 0 && (
                                <span className="text-sm text-muted-foreground line-through">
                                  ${service.price}
                                </span>
                              )}
                              <p className="text-lg font-semibold text-slate-900">
                                ${discountedPrice.toFixed(2)}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm" className="mt-1">
                              Book Now
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </ContentCard>

            {/* Top Repairmen */}
            <ContentCard>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      Top Rated Specialists
                    </CardTitle>
                    <CardDescription>
                      Best repairmen by profession and rating
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-700">
                      Top Rated
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {technicians?.map((technician) => (
                    <div
                      key={`technician_${technician.id}`}
                      className="group relative rounded-lg border p-4 transition-all hover:border-blue-200 hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={
                            techniciansAvatars[technician.id] ??
                            TECHNICIAN_IMAGE_PLACEHOLDER
                          }
                          className="h-12 w-12 border-2 rounded-full border-white shadow"
                        />

                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold">
                                {technician.firstName} {technician.lastName}
                              </p>
                              <p className="text-sm font-medium text-blue-600">
                                {technician.profession}
                              </p>
                            </div>

                            <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="mt-2 space-y-1">
                            <RatingStars rating={technician.rating} />
                            <div className="flex items-center gap-2">
                              <WorkShiftBadge shift={technician.workShift} />
                              <Badge variant="outline" className="text-xs">
                                ID: {technician.employeeNumber}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </ContentCard>
          </div>
        </div>
      </div>
    </div>
  );
}

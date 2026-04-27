"use client";

import { useState } from "react";
import { useGetCustomerVehicleServicesQuery } from "@/lib/features/vehicle/vehicle-api";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  Plus,
  Car,
  Gauge,
  Fuel,
  Cog,
  Palette,
  Calendar,
} from "lucide-react";
import { VehicleDto } from "@/lib/features/vehicle/schema/responses/vehicle.dto";
import { ContentCard } from "@/components/shared/cards/content-card";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function CustomerVehicleServicesPage() {
  // State Management
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleDto | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  // API Query with search and pagination
  const { data: vehicleServicesRes, isLoading } =
    useGetCustomerVehicleServicesQuery({
      page: currentPage,
      pageSize: pageSize,
      search: searchTerm || undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

  // Extract vehicleServices and total from the new response format
  const vehicleServices = vehicleServicesRes?.items || [];
  const totalCount = vehicleServicesRes?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const totalItems = totalCount;

  // Handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewDetails = (vehicle: VehicleDto) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            My Vehicle Services
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and view your vehicle services
          </p>
        </div>
        <Button
          onClick={() => router.push("/customer-panel/vehicle-services/create")}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Vehicle Service
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by VIN, make, model, or license plate..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Vehicles Summary */}
      {vehicleServices.length === 0 ? (
        <ContentCard className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Car className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No vehicleServices found</h3>
            <p className="text-muted-foreground mt-1">
              {searchTerm
                ? "No vehicleServices match your search criteria"
                : "You haven't added any vehicleServices yet"}
            </p>
            <Button
              onClick={() =>
                router.push("/customer-panel/vehicle-services/create")
              }
              className="mt-4 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Your First Vehicle Service
            </Button>
          </CardContent>
        </ContentCard>
      ) : (
        <ContentCard>
          <CardHeader>
            <CardTitle>Vehicle Service Fleet</CardTitle>
            <CardDescription>
              Showing {vehicleServices.length} of {totalItems} vehicleServices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden md:table-cell">
                    Service
                  </TableHead>

                  <TableHead className="hidden md:table-cell">
                    Vehicle Service
                  </TableHead>

                  <TableHead className="hidden sm:table-cell">
                    Technician
                  </TableHead>

                  <TableHead className="hidden lg:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Service Date
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicleServices.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.serviceName}</TableCell>

                    <TableCell className="hidden md:table-cell font-mono text-sm">
                      {item.vehicleModel}
                    </TableCell>

                    <TableCell className="hidden sm:table-cell">
                      {item.technicianName}
                    </TableCell>

                    <TableCell className="hidden lg:table-cell">
                      <Badge className={"text-xs"}>{item.status}</Badge>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell">
                      {new Date(item.serviceDate).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(item)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          handlePageChange(Math.max(1, currentPage - 1))
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {getPaginationNumbers().map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          handlePageChange(
                            Math.min(totalPages, currentPage + 1),
                          )
                        }
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </ContentCard>
      )}

      {/* Vehicle Service Details Modal */}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl min-h-3/6">
          <DialogHeader className="">
            <DialogTitle className="text-2xl ">
              {selectedVehicle?.year} {selectedVehicle?.make}{" "}
              {selectedVehicle?.model}
            </DialogTitle>
            <DialogDescription>
              Complete vehicle information and specifications
            </DialogDescription>
          </DialogHeader>
          {selectedVehicle && (
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="specs">Specifications</TabsTrigger>
                <TabsTrigger value="registration">Registration</TabsTrigger>
              </TabsList>

              {/* ================= OVERVIEW ================= */}
              <TabsContent value="overview" className="mt-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    {selectedVehicle.trim && (
                      <p className="text-muted-foreground">
                        {selectedVehicle.trim}
                      </p>
                    )}
                    <Badge
                      variant="secondary"
                      className="mt-2 capitalize px-3 py-1 text-xs"
                    >
                      {selectedVehicle.status}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Year:</span>
                    <span>{selectedVehicle.year}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Mileage:</span>
                    <span>
                      {selectedVehicle.mileage?.toLocaleString()} miles
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Color:</span>
                    <span>{selectedVehicle.color}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Cog className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Engine:</span>
                    <span>{selectedVehicle.engine}</span>
                  </div>
                </div>

                {selectedVehicle.description && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium mb-2">Description</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedVehicle.description}
                      </p>
                    </div>
                  </>
                )}
              </TabsContent>

              {/* ================= SPECIFICATIONS ================= */}
              <TabsContent value="specs" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Fuel Type:</span>
                    <span>{selectedVehicle.fuelType}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Cog className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Transmission:</span>
                    <span>{selectedVehicle.transmission}</span>
                  </div>

                  <div className="flex items-center gap-2 md:col-span-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">VIN:</span>
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                      {selectedVehicle.vin}
                    </span>
                  </div>
                </div>
              </TabsContent>

              {/* ================= REGISTRATION ================= */}
              <TabsContent value="registration" className="mt-6 space-y-6">
                <div className="space-y-4 text-sm">
                  {selectedVehicle.licensePlate && (
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        License Plate:
                      </span>
                      <span className="font-medium">
                        {selectedVehicle.licensePlate}
                      </span>
                      {selectedVehicle.state && (
                        <Badge variant="outline">{selectedVehicle.state}</Badge>
                      )}
                    </div>
                  )}

                  <Separator />

                  <div className="text-muted-foreground space-y-1">
                    <div>
                      Added:{" "}
                      {new Date(selectedVehicle.createdAt).toLocaleDateString()}
                    </div>
                    {selectedVehicle.updatedAt && (
                      <div>
                        Updated:{" "}
                        {new Date(
                          selectedVehicle.updatedAt,
                        ).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

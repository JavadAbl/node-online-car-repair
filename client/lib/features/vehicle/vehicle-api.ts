import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApi } from "@/lib/shared/base-api-client";
import { VehicleDto } from "./vehicle-types";

export const vehicleApi = createApi({
  reducerPath: "vehicleApi",
  baseQuery: baseApi,
  //  tagTypes: ["auth"],
  endpoints: (builder) => ({
    getCustomerVehicles: builder.query<VehicleDto[], void>({
      query: () => ({
        url: "vehicle-api/Vehicles/CustomerVehicles",
      }),
    }),
  }),
});

export const { useGetCustomerVehiclesQuery } = vehicleApi;

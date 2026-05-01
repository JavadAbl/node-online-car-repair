import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApi } from "@/lib/shared/base-api-client";
import { VehicleDto } from "./schema/responses/vehicle.dto";
import { GetManyQuery, GetManyReply } from "@/lib/shared/types";
import {
  getInvalidatesTags,
  getProvidesTags,
  getUpdateInvalidatesTags,
} from "@/lib/shared/rtk-tag-helpers";
import { VehicleCreateDto } from "./schema/requests/vehicle-create.schema";
import { VehicleServiceCreateDto } from "./schema/requests/vehicle-service-create.schema";
import { VehicleServiceDto } from "./schema/responses/vehicle-service.dto";

const SERVICE_DOMAIN = "Vehicle-Api";

export const vehicleApi = createApi({
  reducerPath: "vehicleApi",
  baseQuery: baseApi,
  tagTypes: ["vehicles", "vehicle-services"],
  endpoints: (builder) => ({
    //Vehicle-----------------------------------------------------
    GetCustomerVehicles: builder.query<
      GetManyReply<VehicleDto>,
      GetManyQuery | void
    >({
      query: (params) => ({
        url: `${SERVICE_DOMAIN}/Vehicles/CustomerVehicles`,
        params: params ?? undefined,
      }),
      providesTags: (result) => getProvidesTags("vehicles", result?.items),
    }),

    GetVehicleById: builder.query<VehicleDto, number>({
      query: (id) => ({
        url: `${SERVICE_DOMAIN}/Vehicles/${id}`,
      }),
      providesTags: (result) => getProvidesTags("vehicles", result),
    }),

    VehicleCreate: builder.mutation<VehicleDto, VehicleCreateDto>({
      query: (body) => ({
        url: `${SERVICE_DOMAIN}/Vehicles`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error) =>
        getInvalidatesTags("vehicles", result, true, error),
    }),

    VehicleUpdate: builder.mutation<
      VehicleDto,
      { id: number; body: Partial<VehicleCreateDto> }
    >({
      query: ({ id, body }) => ({
        url: `${SERVICE_DOMAIN}/Vehicles/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) =>
        getUpdateInvalidatesTags("vehicles", id, false, error),
    }),

    //VehicleService-----------------------------------------------------
    GetCustomerVehicleServices: builder.query<
      GetManyReply<VehicleServiceDto>,
      GetManyQuery | void
    >({
      query: (params) => ({
        url: `${SERVICE_DOMAIN}/VehicleServices`,
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        getProvidesTags("vehicle-services", result?.items),
    }),

    GetVehicleServiceById: builder.query<VehicleServiceDto, number>({
      query: (id) => ({
        url: `${SERVICE_DOMAIN}/VehicleServices/${id}`,
      }),
      providesTags: (result) => getProvidesTags("vehicle-services", result),
    }),

    GetVehicleServiceByVehicleId: builder.query<VehicleServiceDto[], number>({
      query: (id) => ({
        url: `${SERVICE_DOMAIN}/Vehicle/VehicleServices/${id}`,
      }),
      providesTags: (result) => getProvidesTags("vehicle-services", result),
    }),

    VehicleServiceCreate: builder.mutation<
      VehicleServiceDto,
      VehicleServiceCreateDto
    >({
      query: (body) => ({
        url: `${SERVICE_DOMAIN}/VehicleServices`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error) =>
        getInvalidatesTags("vehicle-services", result, true, error),
    }),

    VehicleServiceUpdate: builder.mutation<
      VehicleServiceDto,
      { id: number; body: Partial<VehicleServiceCreateDto> }
    >({
      query: ({ id, body }) => ({
        url: `${SERVICE_DOMAIN}/VehicleServices/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) =>
        getUpdateInvalidatesTags("vehicle-services", id, false, error),
    }),
  }),
});

export const {
  useGetCustomerVehiclesQuery,
  useGetVehicleByIdQuery,
  useVehicleCreateMutation,
  useVehicleUpdateMutation,
  useGetVehicleServiceByIdQuery,
  useGetVehicleServiceByVehicleIdQuery,
  useGetCustomerVehicleServicesQuery,
  useVehicleServiceCreateMutation,
  useVehicleServiceUpdateMutation,
} = vehicleApi;

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApi } from "@/lib/shared/base-api-client";
import { ServiceCreateDto } from "./schema/requests/service-create-schema";
import { ServiceDto } from "./schema/responses/service.dto";
import { GetManyQuery } from "@/lib/shared/types";
import {
  getProvidesTags,
  getInvalidatesTags,
  getDeleteInvalidatesTags,
  getUpdateInvalidatesTags,
  getInvalidatesTagsById,
} from "@/lib/shared/rtk-tag-helpers";
import { RepairmanDto } from "./schema/responses/repairman.dto";
import { RepairmanCreateDto } from "./schema/requests/repairman-create-schema";

const SERVICE_DOMAIN = "Service-Api";

export const serviceApi = createApi({
  reducerPath: "serviceApi",
  baseQuery: baseApi,
  tagTypes: ["services", "repairmans"],
  endpoints: (builder) => ({
    //Service-----------------------------------------------------
    GetServices: builder.query<ServiceDto[], GetManyQuery | void>({
      query: (params) => ({
        url: `${SERVICE_DOMAIN}/Service`,
        params: params ?? undefined,
      }),
      providesTags: (result) => getProvidesTags("services", result),
    }),

    GetServiceById: builder.query<ServiceDto, number>({
      query: (id) => ({
        url: `${SERVICE_DOMAIN}/Service/${id}`,
      }),
      providesTags: (result) => getProvidesTags("services", result),
    }),

    ServiceCreate: builder.mutation<ServiceDto, ServiceCreateDto>({
      query: (body) => ({
        url: `${SERVICE_DOMAIN}/Service`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error) =>
        getInvalidatesTags("services", result, true, error),
    }),

    ServiceUpdate: builder.mutation<
      ServiceDto,
      { id: number; body: Partial<ServiceCreateDto> }
    >({
      query: ({ id, body }) => ({
        url: `${SERVICE_DOMAIN}/Service/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) =>
        getUpdateInvalidatesTags("services", id, false, error),
    }),

    ServiceDelete: builder.mutation<void, number>({
      query: (id) => ({
        url: `${SERVICE_DOMAIN}/Service/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) =>
        getDeleteInvalidatesTags("services", id, error),
    }),

    //Repairman-----------------------------------------------------
    GetRepairmans: builder.query<RepairmanDto[], GetManyQuery | void>({
      query: (params) => ({
        url: `${SERVICE_DOMAIN}/Repairmans`,
        params: params ?? undefined,
      }),
      providesTags: (result) => getProvidesTags("repairmans", result),
    }),

    GetRepairmanById: builder.query<RepairmanDto, number>({
      query: (id) => ({
        url: `${SERVICE_DOMAIN}/Repairmans/${id}`,
      }),
      providesTags: (result) => getProvidesTags("repairmans", result),
    }),

    RepairmanCreate: builder.mutation<RepairmanDto, RepairmanCreateDto>({
      query: (body) => ({
        url: `${SERVICE_DOMAIN}/Repairmans`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error) =>
        getInvalidatesTags("repairmans", result, true, error),
    }),

    RepairmanSetImage: builder.mutation<void, { id: number; body: FormData }>({
      query: ({ id, body }) => ({
        url: `${SERVICE_DOMAIN}/Repairmans/${id}/SetImage`,
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body,
      }),
      invalidatesTags: (result, error, { id }) =>
        getInvalidatesTagsById("repairmans", id, true, error),
    }),

    RepairmanUpdate: builder.mutation<
      RepairmanDto,
      { id: number; body: Partial<RepairmanCreateDto> }
    >({
      query: ({ id, body }) => ({
        url: `${SERVICE_DOMAIN}/Repairmans/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) =>
        getUpdateInvalidatesTags("repairmans", id, false, error),
    }),

    RepairmanDelete: builder.mutation<void, number>({
      query: (id) => ({
        url: `${SERVICE_DOMAIN}/Repairmans/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) =>
        getDeleteInvalidatesTags("repairmans", id, error),
    }),
  }),
});

export const {
  useGetServicesQuery,
  useGetServiceByIdQuery,
  useServiceCreateMutation,
  useServiceUpdateMutation,
  useServiceDeleteMutation,
  useGetRepairmanByIdQuery,
  useGetRepairmansQuery,
  useRepairmanCreateMutation,
  useRepairmanUpdateMutation,
  useRepairmanDeleteMutation,
  useRepairmanSetImageMutation,
} = serviceApi;

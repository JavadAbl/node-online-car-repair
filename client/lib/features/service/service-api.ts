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
import { TechnicianDto } from "./schema/responses/technician.dto";
import { TechnicianCreateDto } from "./schema/requests/technician-create-schema";

const SERVICE_DOMAIN = "Service-Api";

export const serviceApi = createApi({
  reducerPath: "serviceApi",
  baseQuery: baseApi,
  tagTypes: ["services", "technicians"],
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

    //Technician-----------------------------------------------------
    GetTechnicians: builder.query<TechnicianDto[], GetManyQuery | void>({
      query: (params) => ({
        url: `${SERVICE_DOMAIN}/Technicians`,
        params: params ?? undefined,
      }),
      providesTags: (result) => getProvidesTags("technicians", result),
    }),

    GetTechnicianById: builder.query<TechnicianDto, number>({
      query: (id) => ({
        url: `${SERVICE_DOMAIN}/Technicians/${id}`,
      }),
      providesTags: (result) => getProvidesTags("technicians", result),
    }),

    TechnicianCreate: builder.mutation<TechnicianDto, TechnicianCreateDto>({
      query: (body) => ({
        url: `${SERVICE_DOMAIN}/Technicians`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error) =>
        getInvalidatesTags("technicians", result, true, error),
    }),

    TechnicianSetImage: builder.mutation<void, { id: number; body: FormData }>({
      query: ({ id, body }) => ({
        url: `${SERVICE_DOMAIN}/Technicians/${id}/SetImage`,
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body,
      }),
      invalidatesTags: (result, error, { id }) =>
        getInvalidatesTagsById("technicians", id, true, error),
    }),

    TechnicianUpdate: builder.mutation<
      TechnicianDto,
      { id: number; body: Partial<TechnicianCreateDto> }
    >({
      query: ({ id, body }) => ({
        url: `${SERVICE_DOMAIN}/Technicians/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) =>
        getUpdateInvalidatesTags("technicians", id, false, error),
    }),

    TechnicianDelete: builder.mutation<void, number>({
      query: (id) => ({
        url: `${SERVICE_DOMAIN}/Technicians/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) =>
        getDeleteInvalidatesTags("technicians", id, error),
    }),
  }),
});

export const {
  useGetServicesQuery,
  useGetServiceByIdQuery,
  useServiceCreateMutation,
  useServiceUpdateMutation,
  useServiceDeleteMutation,
  useGetTechnicianByIdQuery,
  useGetTechniciansQuery,
  useTechnicianCreateMutation,
  useTechnicianUpdateMutation,
  useTechnicianDeleteMutation,
  useTechnicianSetImageMutation,
} = serviceApi;

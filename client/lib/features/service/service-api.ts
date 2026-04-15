import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApi } from "@/lib/shared/base-api-client";
import { ServiceCreateDto } from "./schema/requests/service-create-schema";
import { ServiceDto } from "./schema/responses/service.dto";

const SERVICE_DOMAIN = "Service-Api";

export const serviceApi = createApi({
  reducerPath: "serviceApi",
  baseQuery: baseApi,
  tagTypes: ["services"],
  endpoints: (builder) => ({
    /*  getUser: builder.query<UserDto, void>({
      query: () => ({
        url: "Service-Api/Users",
      }),
      providesTags: ["services"],
    }), */

    ServiceCreate: builder.mutation<ServiceDto, ServiceCreateDto>({
      query: (body) => ({
        url: `${SERVICE_DOMAIN}/Service`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["services"],
    }),
  }),
});

export const { useServiceCreateMutation } = serviceApi;

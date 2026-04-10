import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApi } from "@/lib/shared/base-api-client";
import { AuthDto, UserDto } from "./auth-types";
import { SendOtpDto } from "./schema/register-schema";
import { VerifyOtpDto } from "./schema/verify-schema";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseApi,
  //  tagTypes: ["auth"],
  endpoints: (builder) => ({
    getUser: builder.query<UserDto, void>({
      query: () => ({
        url: "Auth-Api/Users",
      }),
    }),

    sendOtp: builder.mutation<void, SendOtpDto>({
      query: (body) => ({
        url: "Auth-Api/Auth/SendOtp",
        method: "POST",
        body,
      }),
    }),

    verifyOtp: builder.mutation<AuthDto, VerifyOtpDto>({
      query: (body) => ({
        url: "Auth-Api/Auth/VerifyOtp",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useLazyGetUserQuery, useSendOtpMutation, useVerifyOtpMutation } =
  authApi;

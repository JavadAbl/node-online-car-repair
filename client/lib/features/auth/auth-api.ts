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

    // Server-side logout: revokes the presented refresh token so it can never
    // be replayed, even after the local session state is gone.
    logout: builder.mutation<void, { refreshToken: string | null }>({
      query: (body) => ({
        url: "Auth-Api/Auth/Logout",
        method: "POST",
        body: { refreshToken: body.refreshToken },
      }),
    }),
  }),
});

export const {
  useLazyGetUserQuery,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useLogoutMutation,
} = authApi;

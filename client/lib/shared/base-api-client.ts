import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import { jwtDecode } from "jwt-decode";
import { RootState } from "./store";
import { authActions } from "../features/auth/auth-slice";
import { toast } from "sonner";

const BASE_ADDRESS = "https://localhost:3000/";

// Create a mutex to prevent multiple refresh requests at the same time
const mutex = new Mutex();

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_ADDRESS,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state?.auth?.accessToken;
    console.log("before set token");

    if (token) {
      console.log("after set token");
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseApi: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // 1. Wait for mutex release (if another request is currently refreshing)
  await mutex.waitForUnlock();

  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    const err = result.error;

    // 2. Check if error is 401 and we are not already refreshing
    if (err.status === 401) {
      // Check if a refresh is already in progress
      if (!mutex.isLocked()) {
        const release = await mutex.acquire();

        try {
          const state = api.getState() as RootState;
          const refreshToken = state?.auth?.refreshToken;

          // 3. If we have a refresh token, try to get a new access token
          if (refreshToken) {
            // NOTE: Adjust the URL and parameters to match your Keycloak/OpenID configuration
            // This example assumes a standard OAuth2 Token Endpoint (often at /protocol/openid-connect/token for Keycloak)
            const refreshResult = await fetch(
              `${BASE_ADDRESS}auth/refresh-token`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  refreshToken,
                }),
              },
            );
            console.log(1);

            if (refreshResult.ok) {
              const data = await refreshResult.json();
              console.log(2);
              // 4. Update the Redux store with the new access token
              api.dispatch(
                authActions.setCredentials({
                  accessToken: data.accessToken,
                  refreshToken: data.refreshToken,
                  tokenObject: jwtDecode(data.accessToken),
                }),
              );
              console.log(343);
              // 5. Retry the original request with the new token
              // The rawBaseQuery will pick up the new token from the state via prepareHeaders
              result = await rawBaseQuery(args, api, extraOptions);
            } else {
              console.log(2);
              // Refresh failed (token expired or invalid) -> Logout
              api.dispatch(authActions.logout());
            }
          } else {
            console.log(3);
            // No refresh token in state -> Logout
            api.dispatch(authActions.logout());
          }
        } finally {
          // 6. Release the mutex so other requests can proceed
          release();
        }
      } else {
        // If mutex is locked, wait for the refresh to finish and retry the request
        await mutex.waitForUnlock();
        result = await rawBaseQuery(args, api, extraOptions);
      }
    }

    // Handle non-401 errors (toasts)
    if (result.error && result.error.status !== 401)
      if (api.endpoint !== "walletPaymentVerify") {
        let message = "Server error";
        console.log(result.error);

        if (typeof result.error.data === "string") {
          message = result.error.data;
        } else if (
          result.error.data &&
          typeof result.error.data === "object" &&
          "message" in result.error.data
        ) {
          message = (result.error.data as any).message;
        } else {
          if (result?.error?.data?.detail)
            message = result?.error?.data?.detail;
        }

        toast.error(message);
      }

    // If we still have a 401 error after attempting refresh, logout
    if (result.error && result.error.status === 401) {
      console.log(4);
      api.dispatch(authActions.logout());
    }
  }

  return result;
};

fetch(``, {});

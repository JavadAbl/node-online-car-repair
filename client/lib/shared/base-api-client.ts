import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import { RootState } from "./store";
import { authActions } from "../features/auth/auth-slice";
import { toast } from "sonner";

// Single configuration point for the API base address.
// NEXT_PUBLIC_ prefix makes Next.js inline it into the client bundle.
const BASE_ADDRESS = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:3000/";

// Create a mutex to prevent multiple refresh requests at the same time
const mutex = new Mutex();

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_ADDRESS,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state?.auth?.accessToken;
    if (token) {
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
  const meta = result.meta;

  if (!result.error) {
    if (
      // POST with Created (201)
      (meta?.request.method === "POST" && meta?.response?.status === 201) ||
      // PUT or PATCH with OK (200)
      ((meta?.request.method === "PUT" || meta?.request.method === "PATCH") &&
        meta?.response?.status === 200) ||
      // DELETE with No Content (204)
      (meta?.request.method === "DELETE" && meta?.response?.status === 204)
    )
      toast.success("Operation successful");
  }

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

          // 3. If we have a refresh token, try to get a new access token.
          //    The server rotates it on every use; a rejected token means
          //    it was already rotated (replay), revoked, or expired.
          if (refreshToken) {
            const refreshResult = await fetch(`${BASE_ADDRESS}Auth-Api/Auth/Refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshResult.ok) {
              const data = await refreshResult.json();
              // 4. Update the Redux store with the new token pair
              api.dispatch(
                authActions.setTokens({
                  accessToken: data.accessToken,
                  refreshToken: data.refreshToken,
                }),
              );
              // 5. Retry the original request with the new token
              // The rawBaseQuery will pick up the new token from the state via prepareHeaders
              result = await rawBaseQuery(args, api, extraOptions);
            } else {
              // Refresh failed (rotated/replayed, revoked or expired) -> drop the session
              api.dispatch(authActions.logout());
            }
          } else {
            // No refresh token in state -> drop the session
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

        if (typeof result.error.data === "string") {
          message = result.error.data;
        } else if (
          result.error.data &&
          typeof result.error.data === "object" &&
          "message" in result.error.data
        ) {
          message = (result.error.data as any).message;
        } else {
          const detail = (result.error.data as { detail?: string } | undefined)?.detail;
          if (detail) message = detail;
        }

        toast.error(message);
      }

    // If we still have a 401 error after attempting refresh, drop the session
    if (result.error && result.error.status === 401) {
      api.dispatch(authActions.logout());
    }
  }

  return result;
};

export const getAuthorizedImage = async (
  url: string | null | undefined,
  accessToken: string,
) => {
  if (!url) return null;
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    return objectUrl;
  } catch {
    return null;
  }
};

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
//
// Default "/" = same-origin RELATIVE base. Nginx is the single public
// origin (dev: port 80; prod: TLS terminates at an edge proxy that
// forwards to nginx), so relative requests always reach the gateway no
// matter which host/port/protocol the browser used — the baked bundle
// stays domain-agnostic and never needs rebuilding for a domain change.
// Set an absolute URL (e.g. http://localhost:3000/) ONLY for native dev,
// where the client and the gateway run on different origins (the gateway
// has CORS open for that case).
const configuredBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/";

// fetchBaseQuery concatenates baseUrl + url, and our endpoints are written
// without a leading slash ("Auth-Api/..."), so the base must end with "/"
// to avoid "https://host" + "Auth-Api/..." breakage. Also maps an empty
// string to "/" (empty is not nullish, so "??" alone would not catch it).
const BASE_ADDRESS = configuredBase.endsWith("/") ? configuredBase : `${configuredBase}/`;

// Create a mutex to prevent multiple refresh requests at the same time
const mutex = new Mutex();

/**
 * How long a tab whose refresh was REJECTED waits for a sibling tab's
 * in-flight refresh to land its new pair in localStorage (see the failure
 * branch below). Short enough that a genuinely dead session still bounces
 * to /login promptly, long enough to cover a slow winner.
 */
const REFRESH_RACE_POLL_MS = 2500;

/**
 * Polls localStorage for a refresh token DIFFERENT from the one that was
 * just rejected. Resolves the newer token if a sibling tab wrote one within
 * `timeoutMs`, otherwise null. Never rejects.
 */
function waitForFreshRefreshToken(
  rejectedToken: string,
  timeoutMs: number,
): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(null);
      return;
    }
    const startedAt = Date.now();
    const poll = () => {
      const stored = localStorage.getItem("refreshToken");
      if (stored && stored !== rejectedToken) {
        resolve(stored);
        return;
      }
      if (Date.now() - startedAt >= timeoutMs) {
        resolve(null);
        return;
      }
      setTimeout(poll, 250);
    };
    setTimeout(poll, 250);
  });
}

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
  // Set when a refresh token exchange SUCCEEDED in this call. Only then can
  // a still-401 retry mean "the new token pair is dead" (see the trailing
  // logout below) — a 401 from a rejected/skipped refresh must NOT log out.
  let refreshSucceeded = false;

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
          // 3. If we have a refresh token, try to get a new access token.
          //    STORAGE-FIRST: sibling tabs share localStorage but NOT redux.
          //    A tab whose redux still holds a rotated-away refresh token must
          //    present the NEWEST one from storage — otherwise the server sees
          //    a replay and its reuse detection revokes EVERY session of the
          //    user ("sidebar missing on direct /admin load" afterwards).
          const storedRefreshToken =
            typeof window !== "undefined"
              ? localStorage.getItem("refreshToken")
              : null;
          const state = api.getState() as RootState;
          const refreshToken = storedRefreshToken ?? state?.auth?.refreshToken ?? null;
          //    The server rotates it on every use; a rejected token means
          //    it was already rotated (replay), revoked, or expired.
          if (refreshToken) {
            const refreshResult = await fetch(`${BASE_ADDRESS}Auth-Api/Auth/Refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshResult.ok) {
              refreshSucceeded = true;
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
              // Refresh failed (rotated/replayed, revoked or expired) -> drop
              // the session — BUT only if the rejected token is still the one
              // in storage. A sibling tab that presented the SAME token may
              // have WON the server race while its 200 is still IN FLIGHT:
              // its new pair has not reached localStorage yet, so an immediate
              // storage read still sees the old (rejected) token. Poll storage
              // briefly for a newer token first; if one appears, retry the
              // refresh with it instead of killing a healthy session.
              const healedToken = await waitForFreshRefreshToken(
                refreshToken,
                REFRESH_RACE_POLL_MS,
              );
              if (healedToken) {
                const retryResult = await fetch(
                  `${BASE_ADDRESS}Auth-Api/Auth/Refresh`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refreshToken: healedToken }),
                  },
                );
                if (retryResult.ok) {
                  refreshSucceeded = true;
                  const data = await retryResult.json();
                  api.dispatch(
                    authActions.setTokens({
                      accessToken: data.accessToken,
                      refreshToken: data.refreshToken,
                    }),
                  );
                  result = await rawBaseQuery(args, api, extraOptions);
                } else {
                  const currentStored =
                    typeof window !== "undefined"
                      ? localStorage.getItem("refreshToken")
                      : null;
                  if (!currentStored || currentStored === healedToken) {
                    api.dispatch(authActions.logout());
                  }
                }
              } else {
                const currentStored =
                  typeof window !== "undefined"
                    ? localStorage.getItem("refreshToken")
                    : null;
                if (!currentStored || currentStored === refreshToken) {
                  api.dispatch(authActions.logout());
                }
              }
            }
          } else {
            // No refresh token in state -> drop the session, again only when
            // storage doesn't hold a token somebody else may have just
            // refreshed (another tab's restore could be in flight).
            if (!localStorage.getItem("refreshToken")) {
              api.dispatch(authActions.logout());
            }
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

    // If we still have a 401 error after a SUCCESSFUL refresh, the new token
    // pair is genuinely rejected -> drop the session. (When the refresh was
    // rejected or skipped, the rotation guard above already made the call —
    // logging out here anyway would kill the healthy session another tab
    // just refreshed.)
    if (result.error && result.error.status === 401 && refreshSucceeded) {
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

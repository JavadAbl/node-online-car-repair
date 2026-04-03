import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import crypto from "crypto";
import { cookies } from "next/headers";
import { Agent } from "https";

const refreshLocks = new Map<string, Promise<string>>();

function sessionKey(refreshToken: string) {
  return crypto.createHash("sha256").update(refreshToken).digest("hex");
}

export async function createApi() {
  const instance = axios.create({
    baseURL: process.env.BACKEND_URL,
    httpsAgent: new Agent({ rejectUnauthorized: false }),
  });

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("accessToken")?.value;

  if (accessToken)
    instance.defaults.headers.Authorization = `Bearer ${accessToken}`;

  /*  instance.interceptors.response.use(
    (r) => r,
    async (error: AxiosError) => {
      const original = error.config as InternalAxiosRequestConfig<any> & {
        _retry: boolean;
      };

      if (error.response?.status !== 401 || original._retry) throw error;

      original._retry = true;

      if (!refreshToken) throw error;
      const key = sessionKey(refreshToken);

      let refreshPromise = refreshLocks.get(key);

      if (!refreshPromise) {
        refreshPromise = fetch("/api/auth/refresh", {
          method: "POST",
          cache: "no-store",
        })
          .then((r) => {
            if (!r.ok) throw new Error("refresh failed");
            return r.json();
          })
          .then((d) => d.accessToken)
          .finally(() => {
            refreshLocks.delete(key);
          });

        refreshLocks.set(key, refreshPromise);
      }

      const newToken = await refreshPromise;
      original.headers.Authorization = `Bearer ${newToken}`;

      return instance(original);
    },
  ); */

  return instance;
}

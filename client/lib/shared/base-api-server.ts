import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { Agent } from "https";
import { getTokens, setTokens } from "@/lib/shared/tokens";

// 1. Define the standard response shape (like RTK Query)
export type ApiResponse<T> = {
  data?: T;
  status: number;
  error?: { message: string; data?: any };
  isSuccess: boolean;
};

// 2. Define the factory for the Axios Client (Stateless)
const createApiClient = async (): Promise<AxiosInstance> => {
  const instance = axios.create({
    baseURL: process.env.BACKEND_URL,
    httpsAgent: new Agent({ rejectUnauthorized: false }), // Dev only
  });

  const { accessToken, refreshToken } = await getTokens();

  // Request Interceptor
  instance.interceptors.request.use((config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  // Response Interceptor (Handles 401 Refresh)
  instance.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        refreshToken
      ) {
        originalRequest._retry = true;
        try {
          const refreshRes = await axios.post<AuthDto>(
            `${process.env.BACKEND_URL}Auth-Api/Auth/Refresh`,
            { refreshToken },
            { httpsAgent: new Agent({ rejectUnauthorized: false }) },
          );

          const { accessToken: newAccess, refreshToken: newRefresh } =
            refreshRes.data;
          await setTokens(newAccess, newRefresh);

          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return instance(originalRequest);
        } catch (refreshError) {
          // If refresh fails, we return the error below via the wrapper
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    },
  );

  return instance;
};

// 3. The Wrapper Class that eliminates try/catch blocks
class BaseHttpService {
  private async request<T>(
    method: string,
    url: string,
    body?: any,
  ): Promise<ApiResponse<T>> {
    try {
      const client = await createApiClient();
      const response = await client.request<T>({ method, url, data: body });

      return { data: response.data, isSuccess: true, status: response.status };
    } catch (error: any) {
      // Centralized Error Handling
      const axiosError = error as AxiosError<any>;

      return {
        isSuccess: false,
        status: axiosError.response?.status || 500,
        error: {
          message: extractErrorMessage(error),
          data: axiosError?.response?.data,
        },
      };
    }
  }

  // Convenience methods
  public get<T>(url: string) {
    return this.request<T>("GET", url);
  }

  public post<T>(url: string, body: any) {
    return this.request<T>("POST", url, body);
  }

  public put<T>(url: string, body: any) {
    return this.request<T>("PUT", url, body);
  }

  public delete<T>(url: string) {
    return this.request<T>("DELETE", url);
  }
}

// Export a singleton instance of the wrapper (Safe because wrapper creates internal client on demand)
export const httpService = new BaseHttpService();

function extractErrorMessage(error: any): string {
  if (error instanceof AxiosError)
    if (typeof error.response?.data?.message === "string")
      return error.response?.data?.message;

  if (error.message) return error.message;

  return "An unknown error happened";
}

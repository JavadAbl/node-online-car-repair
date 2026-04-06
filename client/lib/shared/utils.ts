import { AxiosError } from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/* export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
} */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function emptyObjectFieldsToNull<T extends Record<string, any>>(
  obj: T,
): T {
  const out: Record<string, any> = { ...obj }; // allow write indexing
  for (const key of Object.keys(out)) {
    const v = out[key];
    if (v === "" || v === undefined) {
      out[key] = null;
    } else if (v && typeof v === "object" && !Array.isArray(v)) {
      out[key] = emptyObjectFieldsToNull(v); // recursion
    } else if (Array.isArray(v)) {
      out[key] = v.map((item) =>
        item === "" || item === undefined
          ? null
          : item && typeof item === "object"
            ? emptyObjectFieldsToNull(item)
            : item,
      );
    }
  }
  return out as T;
}

export type RemoveNullValues<T> = {
  [K in keyof T]: Exclude<T[K], null>;
};

export function extractErrorMessage(error: any): string {
  if (error instanceof AxiosError)
    if (typeof error.response?.data?.message === "string")
      return error.response?.data?.message;

  if (error.message) return error.message;

  return "An unknown error happened";
}

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



export function persianDigitsToEnglish(str: string) {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const englishDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return str.replace(/۰|۱|۲|۳|۴|۵|۶|۷|۸|۹/g, (match) => {
    return englishDigits[persianDigits.indexOf(match)];
  });
}

export function enumToSelectOptions<T extends string>(
  enumObj: Record<string, string>,
): { label: string; value: string }[] {
  return Object.values(enumObj).map((value) => ({
    label: value,
    value: value,
  }));
}

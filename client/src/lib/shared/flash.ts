// src/lib/flash.ts
import { cookies } from "next/headers";

const FLASH_KEY = "flash";

export type FlashPayload =
  | {
      type: "success";
      message: string;
    }
  | {
      type: "error";
      message: string;
      fieldErrors?: Record<string, string[]>;
      formData?: Record<string, string>;
    };

export async function setFlash(payload: FlashPayload) {
  (await cookies()).set(FLASH_KEY, JSON.stringify(payload), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    // secure: process.env.NODE_ENV === "production",
    maxAge: 60, // 1 minute is enough for a redirect
  });
}

/**
 * Reads flash once and clears it (so refresh won't show again).
 * Must be called in a Server Component / Route / Server Action.
 */
export async function consumeFlash(): Promise<FlashPayload | null> {
  const store = await cookies();
  const raw = store.get(FLASH_KEY)?.value;
  if (!raw) return null;

  store.set(FLASH_KEY, "", { path: "/", maxAge: 0 });

  try {
    return JSON.parse(raw) as FlashPayload;
  } catch {
    return null;
  }
}

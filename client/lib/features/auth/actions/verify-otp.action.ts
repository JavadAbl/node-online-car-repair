"use server";

import { VerifyOtpRequest, VerifyOtpSchema } from "../schema/verify-schema";
import { cookies } from "next/headers";
import { createApi } from "@/lib/base-api";
import { AuthDto } from "../auth.type";
import { redirect } from "next/navigation";
import { ActionState } from "../../common/common.type";

export async function verifyOtpAction(
  data: VerifyOtpRequest,
): Promise<ActionState> {
  try {
    const validatedFields = VerifyOtpSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const payload = validatedFields.data;

    const api = await createApi();

    const res = await api.post<AuthDto>(`Auth-Api/Auth/VerifyOtp`, payload);

    const { accessToken, refreshToken } = res.data;

    // 2. Set Cookies (HttpOnly for security)
    const cookieStore = await cookies();

    // Set Access Token
    // Shorter expiry (e.g., 15 mins or whatever your backend logic dictates)
    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax", // or 'strict'
      path: "/",
      maxAge: 60 * 15, // Example: 15 minutes
    });

    // Set Refresh Token
    // Longer expiry (e.g., 7 days)
    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // Example: 7 days
    });
  } catch (error: any) {
    console.error(error);
    return {
      success: false,
      error: error?.message || "Failed to verifyOtp. Please try again.",
    };
  }

  redirect("/");
}

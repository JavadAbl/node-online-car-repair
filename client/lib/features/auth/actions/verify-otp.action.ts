"use server";

import { VerifyOtpRequest, VerifyOtpSchema } from "../schema/verify-schema";
import { cookies } from "next/headers";
import { createApi } from "@/lib/shared/base-api";
import { AuthDto } from "../auth.type";
import { redirect } from "next/navigation";
import { ActionState } from "../../common/common.type";
import { setTokens } from "@/lib/shared/tokens";
import { extractErrorMessage } from "@/lib/shared/utils";

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

    await setTokens(accessToken, refreshToken);
  } catch (error: any) {
    console.error(error);
    return {
      success: false,
      error: extractErrorMessage(error),
    };
  }

  redirect("/");
}

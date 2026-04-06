"use server";

import { extractErrorMessage } from "@/lib/shared/utils";
import { ActionState } from "../../common/common.type";
import { SendOtpRequest, SendOtpSchema } from "../schema/register-schema";
import { createApi } from "@/lib/shared/base-api";

export async function sendOtpAction(
  data: SendOtpRequest,
): Promise<ActionState> {
  try {
    const validatedFields = SendOtpSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const payload = validatedFields.data;

    const api = await createApi();
    await api.post(`Auth-Api/Auth/SendOtp`, payload);

    return { success: true };
  } catch (error: any) {
    console.error(error);
    return {
      success: false,
      error: extractErrorMessage(error),
    };
  }
}

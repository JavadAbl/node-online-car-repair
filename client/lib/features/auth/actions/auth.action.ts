"use server";

import { auth } from "@/lib/shared/auth";
import { ActionState } from "../../common/common.type";

export async function authAction(): Promise<ActionState> {
  try {
    const res = await auth();

    if (res.isAuth) return { success: true, data: res };
    else return { success: false };
  } catch (error: any) {
    console.error(error);
    return {
      success: false,
      error: error?.message,
    };
  }
}

"use server";

import { redirect, RedirectType } from "next/navigation";
import { UserDto } from "../auth.type";
import { getUserApi } from "../server-calls/auth.call";

export async function authAction(isFromPublic: boolean = false): Promise<{
  isAuth: boolean;
  user?: UserDto;
  error?: any;
}> {
  const res = await getUserApi();

  if (!isFromPublic && !res.success && res?.status === 401)
    redirect("/", RedirectType.replace);

  if (isFromPublic && !res.success && res?.status === 401)
    return { isAuth: false };

  if (!res.success && res?.error) return { isAuth: false, error: res.error };
  if (res.success) return { isAuth: true, user: res.data };

  return { isAuth: false, error: "An unknown error happened" };
}

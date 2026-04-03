import { cookies } from "next/headers";
import { getUserApi } from "../features/auth/server-calls/get-user.api";
import { UserDto } from "../features/auth/auth.type";

export const getTokens = async () => {
  const cookieStore = await cookies();
  return {
    accessToken: cookieStore.get("accessToken"),
    refreshToken: cookieStore.get("refreshToken"),
  };
};

export const auth = async (): Promise<{
  isAuth: boolean;
  user: UserDto | null;
}> => {
  try {
    const { accessToken } = await getTokens();

    if (!accessToken) return { isAuth: false, user: null };

    const res = await getUserApi();

    return { isAuth: true, user: res.data };
  } catch (error: any) {
    return { isAuth: false, user: null };
  }
};

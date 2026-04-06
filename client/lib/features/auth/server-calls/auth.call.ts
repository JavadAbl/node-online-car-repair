import { AuthDto, UserDto } from "../auth.type";
import axios from "axios";
import { getTokens, setTokens } from "@/lib/shared/tokens";
import { Agent } from "https";

export const getUserApi = async (): Promise<{
  status?: number;
  data?: any;
  error?: any;
  success: boolean;
}> => {
  //for dev
  const httpsAgent = new Agent({ rejectUnauthorized: false });

  try {
    const { accessToken, refreshToken } = await getTokens();

    let res;
    if (accessToken)
      res = await axios.get<UserDto>(
        `${process.env.BACKEND_URL}Auth-Api/Users`,
        {
          httpsAgent,
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

    if (!res || res?.status === 401) {
      if (!refreshToken) return { status: 401, success: false };
      const refreshRes = await refreshTokenCall(refreshToken);
      await setTokens(
        refreshRes.data.accessToken,
        refreshRes.data.refreshToken,
      );

      res = await axios.get<UserDto>(
        `${process.env.BACKEND_URL}Auth-Api/Users`,
        {
          httpsAgent,
          headers: { Authorization: `Bearer ${refreshRes.data.accessToken}` },
        },
      );
    }

    if (res) return { status: res.status, data: res.data, success: true };
    else return { error: "An unknown error happened", success: false };
  } catch (error: any) {
    console.error(error.response.data);

    return { error: error?.message, success: false };
  }
};

export const refreshTokenCall = async (refreshToken: string) => {
  //for dev
  const httpsAgent = new Agent({ rejectUnauthorized: false });

  return await axios.post<AuthDto>(
    `${process.env.BACKEND_URL}Auth-Api/Auth/Refresh`,
    { refreshToken },
    {
      httpsAgent,
    },
  );
};

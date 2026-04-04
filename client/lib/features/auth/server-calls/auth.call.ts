import { createApi } from "@/lib/shared/base-api";
import { AuthDto, UserDto } from "../auth.type";

export const getUserApi = async () => {
  return (await createApi()).get<UserDto>(`Auth-Api/Users`);
};

export const refreshTokenCall = async (refreshToken: string) => {
  return (await createApi()).post<AuthDto>(
    `${process.env.BACKEND_URL}Auth-Api/Auth/Refresh`,
    { refreshToken },
  );
};

/*   export const refreshTokenApi = async (refreshToken: string) =>
  fetch(`${process.env.BACKEND_URL}/Auth-Api/Auth/Refresh`, {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
    headers: { "Content-Type": "application/json" },
  }); */

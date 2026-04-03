import { createApi } from "@/lib/base-api";
import { UserDto } from "../auth.type";

export const getUserApi = async () => {
  console.log(21331);

  return (await createApi()).get<UserDto>(`Auth-Api/Users`);
};

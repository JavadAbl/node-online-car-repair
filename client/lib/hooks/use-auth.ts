import { useLayoutEffect } from "react";
import { useGetUserQuery } from "../features/auth/auth-api";
import { useAppDispatch } from "./use-state";
import { authActions } from "../features/auth/auth-slice";
import { jwtDecode } from "jwt-decode";

export function useAuth() {
  const dis = useAppDispatch();
  const { data, isLoading } = useGetUserQuery();

  const handleAuth = () => {
    if (data) {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (accessToken && refreshToken) {
        const tokenObject: any = jwtDecode(accessToken);
        dis(
          authActions.login({
            accessToken,
            refreshToken,
            tokenObject,
            user: data,
            role: tokenObject?.role,
          }),
        );
      } else dis(authActions.logout());
    }
  };

  useLayoutEffect(() => {
    handleAuth();
  }, []);

  return { isLoading };
}

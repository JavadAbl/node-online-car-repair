import { useEffect, useState } from "react";
import { useLazyGetUserQuery } from "../features/auth/auth-api";
import { useAppDispatch, useAppSelector } from "./use-state";
import { authActions } from "../features/auth/auth-slice";
import { jwtDecode } from "jwt-decode";

export function useAuth() {
  const dis = useAppDispatch();
  const isAuth = useAppSelector((s) => s.auth.isAuth);
  const [isAuthDone, setIsAuthDone] = useState(false);
  const [fetchUser] = useLazyGetUserQuery();

  useEffect(() => {
    const handleAuth = () => {
      if (isAuth) {
        setIsAuthDone(true);
        return;
      }

      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        setIsAuthDone(true);
        return;
      }

      dis(authActions.setRefreshToken({ refreshToken }));
      if (accessToken) {
        dis(authActions.setAccessToken({ accessToken }));
      }

      fetchUser()
        .then((res) => {
          if (!res.isError && res.data) {
            const accessToken = localStorage.getItem("accessToken");
            const refreshToken = localStorage.getItem("refreshToken");

            if (!accessToken || !refreshToken) return;

            const tokenObject: any = jwtDecode(accessToken);

            dis(
              authActions.login({
                accessToken,
                refreshToken,
                tokenObject,
                user: res.data,
                role: tokenObject?.role,
              }),
            );
          }
        })
        .finally(() => setIsAuthDone(true));
    };

    handleAuth();
  }, [dis, fetchUser]);

  return { isAuthDone };
}

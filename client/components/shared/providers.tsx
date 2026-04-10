"use client";

import { Provider } from "react-redux";
import { store } from "@/lib/shared/store";
import { ThemeProvider } from "next-themes";
import { Toaster } from "../ui/sonner";
import { authActions } from "@/lib/features/auth/auth-slice";
import { useAppDispatch } from "@/lib/hooks/use-state";
import { useLayoutEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const dis = useAppDispatch();

  useLayoutEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (accessToken) dis(authActions.setAccessToken({ accessToken }));
    if (refreshToken) dis(authActions.setRefreshToken({ refreshToken }));
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider
        attribute="class"
        enableSystem
        defaultTheme="light"
        disableTransitionOnChange
      >
        <Toaster />
        {children}
      </ThemeProvider>
    </Provider>
  );
}

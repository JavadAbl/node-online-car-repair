"use client";
import { Provider } from "react-redux";
import { store } from "@/lib/shared/store";
import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { ScreenShareIcon } from "lucide-react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider
        attribute="class"
        enableSystem
        defaultTheme="light"
        disableTransitionOnChange
      >
        <Toaster />
        <TempThemeWrapper> {children}</TempThemeWrapper>
      </ThemeProvider>
    </Provider>
  );
}

function TempThemeWrapper({ children }: any) {
  const { setTheme, theme } = useTheme();
  return (
    <>
      <ScreenShareIcon
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="fixed bottom-6 right-5 cursor-pointer "
      />

      {children}
    </>
  );
}

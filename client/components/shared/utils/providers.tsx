"use client";
import { Provider } from "react-redux";
import { store } from "@/lib/shared/store";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

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
        {children}
      </ThemeProvider>
    </Provider>
  );
}

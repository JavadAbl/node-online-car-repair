"use client";

import { Provider } from "react-redux";
import { store } from "@/lib/shared/store";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import Index from ".";

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
        <Index>{children}</Index>
      </ThemeProvider>
    </Provider>
  );
}

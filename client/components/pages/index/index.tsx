"use client";

import { useAuth } from "@/lib/hooks/use-auth";

export default function Index({ children }: { children: React.ReactNode }) {
  const { isAuthDone } = useAuth();

  if (!isAuthDone) return null;
  return children;
}

"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { useAppSelector } from "@/lib/hooks/use-state";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Auth({
  redirect = true,
  children,
}: {
  redirect?: boolean;
  children: React.ReactNode;
}) {
  const { isAuthDone } = useAuth();
  const isAuth = useAppSelector((s) => s.auth.isAuth);
  const router = useRouter();

  useEffect(() => {
    if (isAuthDone && !isAuth && redirect) {
      router.replace("/login");
    }
  }, [isAuthDone, isAuth, redirect, router]);

  if (!isAuthDone) return null;
  if (!isAuth && redirect) return null;

  return children;
}

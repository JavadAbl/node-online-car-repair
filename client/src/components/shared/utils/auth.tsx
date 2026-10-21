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
  const { isAuthDone, hadSession } = useAuth();
  const isAuth = useAppSelector((s) => s.auth.isAuth);
  const router = useRouter();

  useEffect(() => {
    if (isAuthDone && !isAuth && redirect) {
      // Tell the login page WHY the user was sent there: an expired/revoked
      // session (they were logged in, tokens no longer restore) gets a
      // notice, while plain "not logged in yet" redirects silently.
      router.replace(
        hadSession ? "/login?reason=session-expired" : "/login",
      );
    }
  }, [isAuthDone, isAuth, hadSession, redirect, router]);

  if (!isAuthDone) return null;
  if (!isAuth && redirect) return null;

  return children;
}

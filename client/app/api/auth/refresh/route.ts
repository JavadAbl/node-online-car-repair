import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { refreshTokenCall } from "@/lib/features/auth/server-calls/auth.call";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return new NextResponse("No refresh token", { status: 401 });
    }

    // Call your backend
    const res = await refreshTokenCall(refreshToken);
    const data = res.data;

    // 1. Create the response object first
    const response = NextResponse.json({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });

    // 2. Set cookies on the response object
    response.cookies.set("accessToken", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // Example: 7 days
    });

    response.cookies.set("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // Example: 7 days
    });

    // 3. Return the modified response
    return response;
  } catch (error: any) {
    return new NextResponse("Refresh failed: " + error.message, {
      status: 401,
    });
  }
}

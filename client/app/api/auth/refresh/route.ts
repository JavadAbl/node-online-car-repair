import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return new NextResponse("No refresh token", { status: 401 });
  }

  // Call your backend
  const resp = await fetch(
    `${process.env.BACKEND_URL}/Auth-Api/Auth/RefreshToken`,
    {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!resp.ok) {
    return new NextResponse("Refresh failed", { status: 401 });
  }

  const data = await resp.json();

  cookieStore.set("accessToken", data.accessToken, {
    httpOnly: true,
    secure: true,
    path: "/",
  });

  cookieStore.set("refreshToken", data.refreshToken, {
    httpOnly: true,
    secure: true,
    path: "/",
  });

  return NextResponse.json({ accessToken: data.accessToken });
}

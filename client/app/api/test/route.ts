import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;
    console.log(refreshToken);

    return NextResponse.json({});
  } catch (error: any) {
    return new NextResponse("Refresh failed: " + error.message, {
      status: 401,
    });
  }
}

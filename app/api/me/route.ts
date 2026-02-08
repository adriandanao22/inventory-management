import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/src/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    return NextResponse.json({ c: 401, m: "Unauthorized", d: null });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ c: 401, m: "Unauthorized", d: null });
  }

  return NextResponse.json({ c: 200, m: "Success", d: { user: payload } } );
}
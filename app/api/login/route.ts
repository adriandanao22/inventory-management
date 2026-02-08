import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { signToken } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createClient()

  const request = await req.json();
  const { username, password } = request.d;

  if (!username || !password) {
    return NextResponse.json({ c: 400, m: "Username and password are required", d: null });
  }

  const { data: user, error } = await supabase.from("users").select("id, email, username, password").eq("username", username).single();

  if (error || !user) {
    return NextResponse.json({ c: 401, m: "Invalid username or password", d: null });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return NextResponse.json({ c: 401, m: "Invalid username or password", d: null });
  }

  const jwt = signToken({ userId: user.id, email: user.email, username: user.username });

  const response = NextResponse.json({ c: 200, m: "Login successful", d: { token: jwt } });
  response.cookies.set("auth-token", jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  })

  return response;
}
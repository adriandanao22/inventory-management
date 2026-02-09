import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, signToken } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";

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

// PUT /api/me — Update profile (username, email)
export async function PUT(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    return NextResponse.json({ c: 401, m: "Unauthorized", d: null });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ c: 401, m: "Unauthorized", d: null });
  }

  const body = await req.json();
  const { username, email } = body.d;

  if (!username && !email) {
    return NextResponse.json({ c: 400, m: "Nothing to update", d: null });
  }

  const supabase = await createClient();

  // Check for duplicate username
  if (username && username !== payload.username) {
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .neq("id", payload.userId)
      .single();

    if (existing) {
      return NextResponse.json({ c: 409, m: "Username already taken", d: null });
    }
  }

  // Check for duplicate email
  if (email && email !== payload.email) {
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .neq("id", payload.userId)
      .single();

    if (existing) {
      return NextResponse.json({ c: 409, m: "Email already taken", d: null });
    }
  }

  const updates: Record<string, string> = {};
  if (username) updates.username = username;
  if (email) updates.email = email;

  const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", payload.userId);

  if (error) {
    return NextResponse.json({ c: 500, m: "Failed to update profile", d: null });
  }

  // Issue a new token with updated info
  const newToken = signToken({
    userId: payload.userId,
    email: email || payload.email,
    username: username || payload.username,
  });

  const response = NextResponse.json({ c: 200, m: "Profile updated", d: null });
  response.cookies.set("auth-token", newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}
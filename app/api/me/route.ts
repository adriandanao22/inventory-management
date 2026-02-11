import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, signToken } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import {
  wrapHandler,
  jsonUnauthorized,
  jsonBadRequest,
  jsonSuccess,
  jsonConflict,
  jsonError,
} from "@/src/lib/api";

export const GET = wrapHandler(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) return jsonUnauthorized();

  const payload = verifyToken(token);
  if (!payload) return jsonUnauthorized();

  const supabase = await createClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("id, email, username, low_stock_limit, avatar_url, created_at")
    .eq("id", payload.userId)
    .single();

  if (error || !user) return jsonBadRequest("User Not Found");

  return jsonSuccess({ user: user }, "User Profile Fetched Successfully");
});

// PUT /api/me — Update profile (username, email)
export const PUT = wrapHandler(async (req: NextRequest) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) return jsonUnauthorized();

  const payload = verifyToken(token);
  if (!payload) return jsonUnauthorized();

  const body = await req.json();
  const { username, email } = body.d;

  if (!username && !email) return jsonBadRequest("Nothing to update");

  const supabase = await createClient();

  // Check for duplicate username
  if (username && username !== payload.username) {
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .neq("id", payload.userId)
      .single();

    if (existing) return jsonConflict("Username already taken");
  }

  // Check for duplicate email
  if (email && email !== payload.email) {
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .neq("id", payload.userId)
      .single();

    if (existing) return jsonConflict("Email already taken");
  }

  const updates: Record<string, string> = {};
  if (username) updates.username = username;
  if (email) updates.email = email;

  const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", payload.userId);

  if (error) return jsonError("Failed to update profile");

  // Issue a new token with updated info
  const newToken = signToken({
    userId: payload.userId,
    email: email || payload.email,
    username: username || payload.username,
  });

  const response = jsonSuccess("Profile Updated Successfully");
  response.cookies.set("auth-token", newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
});

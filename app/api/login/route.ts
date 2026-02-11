import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { signToken } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import {
  wrapHandler,
  jsonSuccess,
  jsonError,
  jsonUnauthorized,
} from "@/src/lib/api";

export const POST = wrapHandler(async (req: NextRequest) => {
  const supabase = await createClient();

  const request = await req.json();
  const { username, password } = request.d;

  if (!username || !password) {
    return jsonError("Username and password are required", 400);
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("id, email, username, password")
    .eq("username", username)
    .single();

  if (error || !user) return jsonUnauthorized();

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) return jsonUnauthorized("Invalid username or password");

  const jwt = signToken({
    userId: user.id,
    email: user.email,
    username: user.username,
  });

  const response = jsonSuccess({ token: jwt }, "Login Success");
  response.cookies.set("auth-token", jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });
  return response;
});

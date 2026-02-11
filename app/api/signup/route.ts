import bcrypt from "bcryptjs";
import { signToken } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import {
  jsonBadRequest,
  jsonError,
  jsonSuccess,
  wrapHandler,
} from "@/src/lib/api";

export const POST = wrapHandler(async (req: Request) => {
  const request = await req.json();
  const { token, email, username, password, confirmPassword } = request.d;
  const supabase = await createClient();

  const captchaRes = await fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    },
  );

  const captchaData = await captchaRes.json();
  if (!captchaData.success)
    return jsonBadRequest("reCAPTCHA Verification Failed");

  if (password !== confirmPassword)
    return jsonBadRequest("Passwords Do Not Match");

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();
  if (existing) return jsonBadRequest("Email Already In Use");

  const hashedPassword = await bcrypt.hash(password, 12);
  const { data: user, error } = await supabase
    .from("users")
    .insert({ email, username, password: hashedPassword })
    .select("id, email, username")
    .single();

  if (error) return jsonError("Error Creating User");

  const jwt = signToken({
    userId: user.id,
    email: user.email,
    username: user.username,
  });

  const response = jsonSuccess({ token: jwt }, "Signup Success");
  response.cookies.set("auth-token", jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });

  return response;
});

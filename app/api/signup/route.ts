import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signToken } from "@/src/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const { token, email, username, password, confirmPassword } = await req.json();

  const captchaRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
  });

  const captchaData = await captchaRes.json();
  if (!captchaData.success) {
    return NextResponse.json({ c: 400, m: "reCAPTCHA verification failed", d: null });
  }

  if (password !== confirmPassword) {
    return NextResponse.json({ c: 400, m: "Passwords do not match", d: null });
  }
  
  const { data: existing } = await supabase.from("users").select("id").eq("email", email).single();
  if (existing) {
    return NextResponse.json({ c: 400, m: "Email already in use", d: null });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const { data: user, error } = await supabase.from("users").insert({ email, username, password: hashedPassword }).select("id, email, username").single();

  if (error) {
    return NextResponse.json({ c: 500, m: "Error creating user", d: null });
  }

  const jwt = signToken({ userId: user.id, email: user.email, username: user.username });

  const response = NextResponse.json({ c: 200, m: "User created successfully", d: { token: jwt } });
  response.cookies.set("auth-token", jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });

  return response;
}
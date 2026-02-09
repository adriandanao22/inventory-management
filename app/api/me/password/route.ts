import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import bcrypt from "bcryptjs";

// PUT /api/me/password — Change password
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
  const { currentPassword, newPassword } = body.d;

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ c: 400, m: "Current and new password are required", d: null });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ c: 400, m: "Password must be at least 6 characters", d: null });
  }

  const supabase = await createClient();

  // Verify current password
  const { data: user, error } = await supabase
    .from("users")
    .select("id, password")
    .eq("id", payload.userId)
    .single();

  if (error || !user) {
    return NextResponse.json({ c: 404, m: "User not found", d: null });
  }

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    return NextResponse.json({ c: 401, m: "Current password is incorrect", d: null });
  }

  // Hash and update
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const { error: updateError } = await supabase
    .from("users")
    .update({ password: hashedPassword })
    .eq("id", payload.userId);

  if (updateError) {
    return NextResponse.json({ c: 500, m: "Failed to update password", d: null });
  }

  return NextResponse.json({ c: 200, m: "Password updated", d: null });
}

import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import bcrypt from "bcryptjs";
import {
  jsonBadRequest,
  jsonError,
  jsonNotFound,
  jsonSuccess,
  jsonUnauthorized,
  wrapHandler,
} from "@/src/lib/api";

// PUT /api/me/password — Change password
export const PUT = wrapHandler(async (req: NextRequest) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) return jsonUnauthorized();

  const payload = verifyToken(token);
  if (!payload) return jsonUnauthorized();

  const body = await req.json();
  const { currentPassword, newPassword } = body.d;

  if (!currentPassword || !newPassword)
    return jsonBadRequest("Current and new password are required");

  if (newPassword.length < 6)
    return jsonBadRequest("Password must be at least 6 characters");

  const supabase = await createClient();

  // Verify current password
  const { data: user, error } = await supabase
    .from("users")
    .select("id, password")
    .eq("id", payload.userId)
    .single();

  if (error || !user) return jsonNotFound("User not found");

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) return jsonUnauthorized("Current password is incorrect");

  // Hash and update
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const { error: updateError } = await supabase
    .from("users")
    .update({ password: hashedPassword })
    .eq("id", payload.userId);

  if (updateError) return jsonError("Error Updating Password");

  return jsonSuccess("Password Updated Successfully");
});

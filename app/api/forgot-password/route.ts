import bcrypt from "bcryptjs";
import { createClient } from "@/src/lib/supabase/server";
import {
  jsonBadRequest,
  jsonError,
  jsonNotFound,
  jsonSuccess,
  wrapHandler,
} from "@/src/lib/api";

// POST /api/forgot-password — Reset a password without being logged in.
// NOTE: temporary flow — no email verification token yet, so anyone who knows
// an email can set that account's password. Gate this behind an emailed token
// before shipping to production.
export const POST = wrapHandler(async (req: Request) => {
  const request = await req.json();
  const { email, newPassword, confirmPassword } = request.d;

  if (!email || !newPassword || !confirmPassword)
    return jsonBadRequest("Email and new password are required");

  if (newPassword !== confirmPassword)
    return jsonBadRequest("Passwords Do Not Match");

  if (newPassword.length < 6)
    return jsonBadRequest("Password must be at least 6 characters");

  const supabase = await createClient();

  const { data: user, error } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (error || !user) return jsonNotFound("No account found for that email");

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  const { error: updateError } = await supabase
    .from("users")
    .update({ password: hashedPassword })
    .eq("id", user.id);

  if (updateError) return jsonError("Error Updating Password");

  return jsonSuccess({}, "Password Updated Successfully");
});

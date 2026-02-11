import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import {
  jsonBadRequest,
  jsonError,
  jsonSuccess,
  jsonUnauthorized,
  wrapHandler,
} from "@/src/lib/api";

// GET /api/me/settings — Get user settings
export const GET = wrapHandler(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) return jsonUnauthorized();

  const payload = verifyToken(token);
  if (!payload) return jsonUnauthorized();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select("low_stock_limit")
    .eq("id", payload.userId)
    .single();

  if (error) return jsonError("Failed to fetch settings");

  return jsonSuccess(
    { low_stock_limit: data.low_stock_limit ?? 5 },
    "Settings Fetched Successfully",
  );
});

// PUT /api/me/settings — Update user settings
export const PUT = wrapHandler(async (req: NextRequest) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) return jsonUnauthorized();

  const payload = verifyToken(token);
  if (!payload) return jsonUnauthorized();

  const body = await req.json();
  const { low_stock_limit } = body.d;

  if (low_stock_limit === undefined || low_stock_limit === null)
    return jsonBadRequest("low_stock_limit is required");

  const limit = parseInt(low_stock_limit);
  if (isNaN(limit) || limit < 0)
    return jsonBadRequest("low_stock_limit must be a non-negative integer");

  const supabase = await createClient();

  const { error } = await supabase
    .from("users")
    .update({ low_stock_limit: limit })
    .eq("id", payload.userId);

  if (error) return jsonError("Failed to update settings");

  return jsonSuccess(
    { low_stock_limit: limit },
    "Settings updated successfully",
  );
});

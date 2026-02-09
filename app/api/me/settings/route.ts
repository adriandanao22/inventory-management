import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";

// GET /api/me/settings — Get user settings
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

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select("low_stock_limit")
    .eq("id", payload.userId)
    .single();

  if (error) {
    return NextResponse.json({ c: 500, m: "Failed to fetch settings", d: null });
  }

  return NextResponse.json({
    c: 200,
    m: "Success",
    d: { low_stock_limit: data.low_stock_limit ?? 5 },
  });
}

// PUT /api/me/settings — Update user settings
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
  const { low_stock_limit } = body.d;

  if (low_stock_limit === undefined || low_stock_limit === null) {
    return NextResponse.json({ c: 400, m: "low_stock_limit is required", d: null });
  }

  const limit = parseInt(low_stock_limit);
  if (isNaN(limit) || limit < 0) {
    return NextResponse.json({ c: 400, m: "low_stock_limit must be a non-negative number", d: null });
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("users")
    .update({ low_stock_limit: limit })
    .eq("id", payload.userId);

  if (error) {
    return NextResponse.json({ c: 500, m: "Failed to update settings", d: null });
  }

  return NextResponse.json({ c: 200, m: "Settings updated", d: { low_stock_limit: limit } });
}

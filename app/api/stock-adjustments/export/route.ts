import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import {
  jsonError,
  jsonExported,
  jsonUnauthorized,
  wrapHandler,
} from "@/src/lib/api";

function escapeCsv(value: unknown) {
  if (value === null) return "";
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export const GET = wrapHandler(async (req: NextRequest) => {
  const cookieStore = await cookies();

  const token = cookieStore.get("auth-token")?.value;
  if (!token) return jsonUnauthorized();

  const payload = verifyToken(token);
  if (!payload) return jsonUnauthorized();

  const supabase = await createClient();

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  let query = supabase
    .from("stock_adjustments")
    .select("*")
    .eq("user_id", payload.userId)
    .order("created_at", { ascending: false });

  if (type) query = query.eq("type", type);

  const { data: stockAdjustments, error } = await query;

  if (error) return jsonError("Failed To Fetch Stock Adjustments");

  const headers = ["ID", "Product ID", "Type", "Units", "Reason", "Created At"];

  const keys = ["id", "product_id", "type", "units", "reason", "created_at"];

  const csvRows = [headers.join(",")].concat(
    (stockAdjustments || []).map((s: Record<string, unknown>) =>
      keys.map((k) => escapeCsv(s[k])).join(","),
    ),
  );

  const csv = csvRows.join("\r\n");

  return jsonExported(csv, "Exported", "stock_adjustments.csv");
});

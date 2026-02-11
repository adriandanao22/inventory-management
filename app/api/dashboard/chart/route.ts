import { cookies } from "next/headers";
import {
  wrapHandler,
  jsonSuccess,
  jsonUnauthorized,
  jsonError,
} from "@/src/lib/api";
import { verifyToken } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export const GET = wrapHandler(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) return jsonUnauthorized();

  const payload = verifyToken(token);
  if (!payload) return jsonUnauthorized();

  const supabase = await createClient();

  // last 12 months
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const { data, error } = await supabase
    .from("stock_adjustments")
    .select("type, units, created_at")
    .eq("user_id", payload.userId)
    .gte("created_at", start.toISOString())
    .order("created_at", { ascending: true });

  if (error) return jsonError("Failed to fetch adjustments");

  // build months array (ensure months with zero values are present)
  const months: string[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    months.push(monthKey(d));
  }

  const map = new Map<string, { incoming: number; outgoing: number }>();
  months.forEach((m) => map.set(m, { incoming: 0, outgoing: 0 }));

  (data ?? []).forEach(
    (row: { type: string; units: number; created_at: string }) => {
      const created = new Date(row.created_at);
      const key = monthKey(created);
      const entry = map.get(key);
      if (!entry) return;
      const units = Number(row.units) || 0;
      if (row.type === "incoming") entry.incoming += units;
      else entry.outgoing += units;
    },
  );

  const result = months.map((m) => ({ month: m, ...map.get(m)! }));

  return jsonSuccess(result);
});

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
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  let query = supabase
    .from("products")
    .select("*")
    .eq("user_id", payload.userId)
    .order("created_at", { ascending: false });

  if (category) query = query.eq("category", category);

  if (status) query = query.eq("status", status);

  if (search) query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);

  const { data: products, error } = await query;

  if (error) return jsonError("Failed To Fetch Products");

  const headers = [
    "ID",
    "Name",
    "Description",
    "SKU",
    "Category",
    "Stock",
    "Price",
    "Status",
    "Supplier",
    "Location",
    "Minimum Stock",
    "Last Restock Date",
    "Created At",
    "Updated At",
  ];

  const keys = [
    "id",
    "name",
    "description",
    "sku",
    "category",
    "stock",
    "price",
    "status",
    "supplier",
    "location",
    "min_stock",
    "last_restocked",
    "created_at",
    "updated_at",
  ];

  const csvRows = [headers.join(",")].concat(
    (products || []).map((p: Record<string, unknown>) =>
      keys.map((k) => escapeCsv(p[k])).join(","),
    ),
  );

  const csv = csvRows.join("\r\n");

  return jsonExported(csv, "Products Export Successful", "products.csv");
});

import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { CreateProduct } from "@/src/types/products";
import {
  jsonBadRequest,
  jsonConflict,
  jsonCreated,
  jsonError,
  jsonUnauthorized,
  wrapHandler,
} from "@/src/lib/api";

// GET /api/products — List all products for authenticated user
export const GET = wrapHandler(async (req: NextRequest) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) return jsonUnauthorized();

  const payload = verifyToken(token);
  if (!payload) return jsonUnauthorized();

  const supabase = await createClient();

  // Optional query params for filtering
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

  const { data, error } = await query;

  if (error) return jsonError("Error Fetching Products");

  return NextResponse.json({ c: 200, m: "Success", d: data });
});

// POST /api/products — Create a new product
export const POST = wrapHandler(async (req: NextRequest) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) return jsonUnauthorized();

  const payload = verifyToken(token);
  if (!payload) return jsonUnauthorized();

  const body = await req.json();
  const product: CreateProduct = body.d;

  if (!product?.name || !product?.sku || !product?.price)
    return jsonBadRequest("Name, SKU, and Price are required");

  const supabase = await createClient();

  // Check for duplicate SKU
  const { data: existing } = await supabase
    .from("products")
    .select("id")
    .eq("sku", product.sku)
    .eq("user_id", payload.userId)
    .single();

  if (existing) return jsonConflict("A Product With This SKU Already Exists");

  const { data, error } = await supabase
    .from("products")
    .insert({ ...product, user_id: payload.userId })
    .select()
    .single();

  if (error) return jsonError("Error Creating Product");

  return jsonCreated(data, "Product Created Successfully");
});

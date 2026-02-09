import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { UpdateProduct } from "@/src/types/products";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/products/[id] — Get a single product
export async function GET(req: NextRequest, { params }: RouteParams) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    return NextResponse.json({ c: 401, m: "Unauthorized", d: null });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ c: 401, m: "Unauthorized", d: null });
  }

  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("user_id", payload.userId)
    .single();

  if (error || !data) {
    return NextResponse.json({ c: 404, m: "Product not found", d: null });
  }

  return NextResponse.json({ c: 200, m: "Success", d: data });
}

// PUT /api/products/[id] — Update a product
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    return NextResponse.json({ c: 401, m: "Unauthorized", d: null });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ c: 401, m: "Unauthorized", d: null });
  }

  const { id } = await params;
  const body = await req.json();
  const updates: UpdateProduct = body.d;

  if (!updates || Object.keys(updates).length === 0) {
    return NextResponse.json({ c: 400, m: "No fields to update", d: null });
  }

  const supabase = await createClient();

  // Check SKU uniqueness if SKU is being updated
  if (updates.sku) {
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("sku", updates.sku)
      .eq("user_id", payload.userId)
      .neq("id", id)
      .single();

    if (existing) {
      return NextResponse.json({ c: 409, m: "A product with this SKU already exists", d: null });
    }
  }

  const { data, error } = await supabase
    .from("products")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", payload.userId)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ c: 404, m: "Product not found or update failed", d: null });
  }

  return NextResponse.json({ c: 200, m: "Product updated", d: data });
}

// DELETE /api/products/[id] — Delete a product
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    return NextResponse.json({ c: 401, m: "Unauthorized", d: null });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ c: 401, m: "Unauthorized", d: null });
  }

  const { id } = await params;
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("user_id", payload.userId);

  if (error) {
    return NextResponse.json({ c: 500, m: "Error deleting product", d: null });
  }

  return NextResponse.json({ c: 200, m: "Product deleted", d: null });
}

import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { UpdateProduct } from "@/src/types/products";
import {
  jsonUnauthorized,
  jsonError,
  jsonSuccess,
  jsonBadRequest,
  jsonNotFound,
  jsonConflict,
  wrapHandler,
} from "@/src/lib/api";

// GET /api/products/[id] — Get a single product
export const GET = wrapHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return jsonUnauthorized();
    }

    const payload = verifyToken(token);
    if (!payload) {
      return jsonUnauthorized();
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
      return jsonNotFound("Product not found");
    }

    return jsonSuccess(data);
  },
);

// PUT /api/products/[id] — Update a product
export const PUT = wrapHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return jsonUnauthorized();
    }

    const payload = verifyToken(token);
    if (!payload) {
      return jsonUnauthorized();
    }

    const { id } = await params;
    const body = await req.json();
    const updates: UpdateProduct = body.d;

    if (!updates || Object.keys(updates).length === 0) {
      return jsonBadRequest("No fields to update");
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
        return jsonConflict("A product with this SKU already exists");
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
      return jsonNotFound("Product not found or update failed");
    }

    return jsonSuccess(data, "Product updated");
  },
);

// DELETE /api/products/[id] — Delete a product
export const DELETE = wrapHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return jsonUnauthorized();
    }

    const payload = verifyToken(token);
    if (!payload) {
      return jsonUnauthorized();
    }

    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .eq("user_id", payload.userId);

    if (error) {
      return jsonError("Error deleting product");
    }

    return jsonSuccess(null, "Product deleted");
  },
);

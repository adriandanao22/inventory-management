import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/src/lib/supabase/server";
import { verifyToken } from "@/src/lib/auth";
import { sendLowStockEmail } from "@/src/lib/resend";
import {
  wrapHandler,
  jsonSuccess,
  jsonError,
  jsonUnauthorized,
  jsonNotFound,
  jsonBadRequest,
  jsonCreated,
} from "@/src/lib/api";

export const GET = wrapHandler(async (req: NextRequest) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) return jsonUnauthorized();

  const payload = verifyToken(token);
  if (!payload) return jsonUnauthorized();

  const supabase = await createClient();

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const productId = searchParams.get("product_id");

  let query = supabase
    .from("stock_adjustments")
    .select(
      "*, products:product_id(name, sku), users:user_id(username)",
      { count: "exact" },
    )
    .eq("user_id", payload.userId)
    .order("created_at", { ascending: false });

  if (type) {
    query = query.eq("type", type);
  }

  if (productId) {
    query = query.eq("product_id", productId);
  }

  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.max(parseInt(searchParams.get("limit") || "20", 10), 1);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await query.range(from, to);

  if (error) return jsonError("Error Fetching Stock Adjustments");

  return jsonSuccess(
    {
      items: data ?? [],
      total: count ?? 0,
      page,
      pageSize: limit,
    },
    "Stock Adjustments Fetched Successfully",
  );
});

export const POST = wrapHandler(async (req: NextRequest) => {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return jsonUnauthorized();

  const payload = verifyToken(token);
  if (!payload) return jsonUnauthorized();

  const userId = payload.userId;
  const body = await req.json();
  const { product_id, type, units, reason } = body.d;

  const supabase = await createClient();

  // Get current product
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", product_id)
    .eq("user_id", userId)
    .single();

  if (productError || !product) return jsonNotFound("Product Not Found");

  const newStock =
    type === "incoming" ? product.stock + units : product.stock - units;

  if (newStock < 0) return jsonBadRequest("Insufficient Stock");

  const newStatus =
    newStock === 0
      ? "Out of Stock"
      : newStock <= product.min_stock
        ? "Low Stock"
        : "In Stock";

  const updateData: Record<string, unknown> = {
    stock: newStock,
    status: newStatus,
  };

  if (type === "incoming") {
    updateData.last_restocked = new Date().toISOString().split("T")[0];
  }

  // Update product
  const { error: updateError } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", product_id);

  if (updateError) return jsonError("Failed To Update Product Stock");

  // Insert stock adjustment
  const { data: adjustment, error: adjError } = await supabase
    .from("stock_adjustments")
    .insert({
      product_id,
      user_id: userId,
      type,
      units,
      reason: reason || null,
    })
    .select()
    .single();

  if (adjError) return jsonError("Failed To Create Stock Adjustment");

  // Send low stock email if stock crossed user's notification threshold
  try {
    const { data: userData } = await supabase
      .from("users")
      .select("email, low_stock_limit")
      .eq("id", userId)
      .single();

    if (
      userData &&
      newStock > 0 &&
      newStock <= userData.low_stock_limit &&
      product.stock > userData.low_stock_limit // only notify on the transition
    ) {
      await sendLowStockEmail(
        userData.email,
        product.name,
        newStock,
        userData.low_stock_limit,
      );
    }
  } catch (emailError) {
    // Don't fail the request if email fails
    console.error("Failed to send low stock email:", emailError);
  }

  return jsonCreated(adjustment, "Stock adjustment created");
});

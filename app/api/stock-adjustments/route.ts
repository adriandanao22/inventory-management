import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/src/lib/supabase/server";
import { verifyToken } from "@/src/lib/auth";
import { sendLowStockEmail } from "@/src/lib/resend";

export async function GET(req: NextRequest) {
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

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const productId = searchParams.get("product_id");
  const limit = parseInt(searchParams.get("limit") || "50");

  let query = supabase
    .from("stock_adjustments")
    .select("*, products:product_id(name, sku), users:user_id(username)")
    .eq("user_id", payload.userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (type) {
    query = query.eq("type", type);
  }

  if (productId) {
    query = query.eq("product_id", productId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ c: 500, m: "Error fetching stock adjustments", d: null });
  }

  return NextResponse.json({ c: 200, m: "Success", d: data });
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ c: 401, m: "Unauthorized", d: null }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ c: 401, m: "Unauthorized", d: null }, { status: 401 });
    }

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

    if (productError || !product) {
      return NextResponse.json(
        { c: 404, m: "Product not found", d: null },
        { status: 404 }
      );
    }

    const newStock =
      type === "incoming" ? product.stock + units : product.stock - units;

    if (newStock < 0) {
      return NextResponse.json(
        { c: 400, m: "Insufficient stock", d: null },
        { status: 400 }
      );
    }

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

    if (updateError) {
      return NextResponse.json(
        { c: 500, m: "Failed to update product stock", d: null },
        { status: 500 }
      );
    }

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

    if (adjError) {
      return NextResponse.json(
        { c: 500, m: "Failed to create stock adjustment", d: null },
        { status: 500 }
      );
    }

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
          userData.low_stock_limit
        );
      }
    } catch (emailError) {
      // Don't fail the request if email fails
      console.error("Failed to send low stock email:", emailError);
    }

    return NextResponse.json({
      c: 201,
      m: "Stock adjustment created",
      d: adjustment,
    });
  } catch (error) {
    console.error("Error creating stock adjustment:", error);
    return NextResponse.json(
      { c: 500, m: "Internal server error", d: null },
      { status: 500 }
    );
  }
}
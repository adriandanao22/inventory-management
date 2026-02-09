import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";

// GET /api/dashboard — Get dashboard metrics
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

  // Fetch all products for the user
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, sku, category, stock, price, status, min_stock")
    .eq("user_id", payload.userId);

  if (productsError) {
    return NextResponse.json({ c: 500, m: "Error fetching dashboard data", d: null });
  }

  const allProducts = products || [];

  // Calculate metrics using per-product min_stock
  const totalProducts = allProducts.length;
  const totalStockValue = allProducts.reduce((sum, p) => sum + p.stock * p.price, 0);
  const lowStockItems = allProducts.filter((p) => p.stock > 0 && p.stock <= p.min_stock);
  const outOfStock = allProducts.filter((p) => p.stock === 0).length;

  // Fetch recent activity (last 10 stock adjustments)
  const { data: recentActivity } = await supabase
    .from("stock_adjustments")
    .select("*, products:product_id(name, sku), users:user_id(username)")
    .eq("user_id", payload.userId)
    .order("created_at", { ascending: false })
    .limit(10);

  // Fetch top products by total outgoing units
  const { data: topProducts } = await supabase
    .from("stock_adjustments")
    .select("product_id, units, products:product_id(name, stock)")
    .eq("user_id", payload.userId)
    .eq("type", "outgoing")
    .order("units", { ascending: false })
    .limit(5);

  return NextResponse.json({
    c: 200,
    m: "Success",
    d: {
      metrics: {
        totalProducts,
        totalStockValue,
        lowStockCount: lowStockItems.length,
        outOfStock,
      },
      lowStockItems,
      recentActivity: recentActivity || [],
      topProducts: topProducts || [],
    },
  });
}

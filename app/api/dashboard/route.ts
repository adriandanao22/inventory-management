import { cookies } from "next/headers";
import { verifyToken } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import {
  wrapHandler,
  jsonSuccess,
  jsonError,
  jsonUnauthorized,
} from "@/src/lib/api";

// GET /api/dashboard — Get dashboard metrics
export const GET = wrapHandler(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) return jsonUnauthorized();

  const payload = verifyToken(token);
  if (!payload) return jsonUnauthorized();

  const supabase = await createClient();

  // Fetch all products for the user
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, sku, category, stock, price, status, min_stock")
    .eq("user_id", payload.userId);

  if (productsError) return jsonError("Error fetching dashboard data");

  const allProducts = products || [];

  // Calculate metrics using per-product min_stock
  const totalProducts = allProducts.length;
  const totalStockValue = allProducts.reduce(
    (sum, p) => sum + p.stock * p.price,
    0,
  );
  const lowStockItems = allProducts.filter(
    (p) => p.stock > 0 && p.stock <= p.min_stock,
  );
  const outOfStock = allProducts.filter((p) => p.stock === 0).length;

  // Fetch recent activity (last 10 stock adjustments)
  const { data: recentActivity } = await supabase
    .from("stock_adjustments")
    .select("*, products:product_id(name, sku), users:user_id(username)")
    .eq("user_id", payload.userId)
    .order("created_at", { ascending: false })
    .limit(10);

  // Fetch top products by total outgoing units
  const { data: topProducts } = await supabase.rpc("top_products_by_units", {
    _user_id: payload.userId,
    _limit_count: 5,
  });

  return jsonSuccess({
    metrics: {
      totalProducts,
      totalStockValue,
      lowStockCount: lowStockItems.length,
      outOfStock,
    },
    lowStockItems,
    recentActivity: recentActivity || [],
    topProducts: topProducts || [],
  });
});

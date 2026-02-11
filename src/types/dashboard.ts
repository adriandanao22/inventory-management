import { Product } from "./products";
import { StockAdjustment } from "./stockAdjustments";

export interface DashboardData {
  metrics: {
    totalProducts: number;
    totalStockValue: number;
    lowStockCount: number;
    outOfStock: number;
  };
  lowStockItems: Product[];
  recentActivity: (StockAdjustment & {
    products: { name: string; sku: string };
    users: { username: string };
  })[];
  topProducts: {
    product_id: string;
    units: number;
    name: string;
    stock: number;
  }[];
}

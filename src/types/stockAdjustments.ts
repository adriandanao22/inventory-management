export interface StockAdjustment {
  id: string;
  product_id: string;
  user_id: string;
  type: "incoming" | "outgoing";
  units: number;
  reason: string;
  created_at: string;
}

export type CreateStockAdjustment = Omit<StockAdjustment, "id" | "created_at">;

// Joined version for dashboard display (with product name and user info)
export interface StockAdjustmentWithDetails extends StockAdjustment {
  product: {
    name: string;
    sku: string;
  };
  user: {
    username: string;
  };
}
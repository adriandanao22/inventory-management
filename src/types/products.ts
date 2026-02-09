export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  price: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  description: string;
  supplier: string;
  location: string;
  min_stock: number;
  last_restocked: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// For creating a new product (id and timestamps are auto-generated)
export type CreateProduct = Omit<Product, "id" | "created_at" | "updated_at">;

// For updating an existing product (all fields optional except id)
export type UpdateProduct = Partial<Omit<Product, "id" | "created_at" | "updated_at">>;
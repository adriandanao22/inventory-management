/** @jest-environment node */
import { GET } from "@/app/api/dashboard/route";

// --- Supabase mock ---
const mockProducts = [
  { id: "1", name: "Widget", sku: "W-001", category: "Parts", stock: 10, price: 5, status: "In Stock", min_stock: 5 },
  { id: "2", name: "Gadget", sku: "G-001", category: "Parts", stock: 3, price: 10, status: "Low Stock", min_stock: 5 },
  { id: "3", name: "Doohickey", sku: "D-001", category: "Tools", stock: 0, price: 15, status: "Out of Stock", min_stock: 5 },
];

const queryBuilder: Record<string, jest.Mock> = {};
queryBuilder.select = jest.fn(() => queryBuilder);
queryBuilder.eq = jest.fn(() => queryBuilder);
queryBuilder.order = jest.fn(() => queryBuilder);
queryBuilder.limit = jest.fn(() => queryBuilder);

const mockFrom = jest.fn(() => queryBuilder);

jest.mock("@/src/lib/supabase/server", () => ({
  createClient: () => ({ from: mockFrom }),
}));

jest.mock("next/headers", () => ({
  cookies: () => ({
    get: (name: string) =>
      name === "auth-token" ? { value: "valid-token" } : undefined,
  }),
}));

jest.mock("@/src/lib/auth", () => ({
  verifyToken: (token: string) =>
    token === "valid-token"
      ? { userId: "user-1", email: "a@b.com", username: "user" }
      : null,
}));

describe("GET /api/dashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Products query (non-single, resolves via thenable)
    let callCount = 0;
    queryBuilder.eq.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // First eq("user_id") for products — return thenable
        return {
          then: (resolve: (val: { data: unknown; error: unknown }) => void) =>
            resolve({ data: mockProducts, error: null }),
        };
      }
      // Subsequent calls for stock_adjustments queries
      return {
        ...queryBuilder,
        order: jest.fn(() => ({
          ...queryBuilder,
          limit: jest.fn(() => ({
            then: (resolve: (val: { data: unknown; error: unknown }) => void) =>
              resolve({ data: [], error: null }),
          })),
        })),
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              then: (resolve: (val: { data: unknown; error: unknown }) => void) =>
                resolve({ data: [], error: null }),
            })),
          })),
        })),
      };
    });
  });

  it("Should return dashboard metrics", async () => {
    const res = await GET();
    const data = await res.json();

    expect(data.c).toBe(200);
    expect(data.d.metrics.totalProducts).toBe(3);
    // Total stock value: (10*5) + (3*10) + (0*15) = 80
    expect(data.d.metrics.totalStockValue).toBe(80);
    // Low stock: stock > 0 && stock <= min_stock → Gadget (3 <= 5)
    expect(data.d.metrics.lowStockCount).toBe(1);
    // Out of stock: stock === 0 → Doohickey
    expect(data.d.metrics.outOfStock).toBe(1);
  });

  it("Should include low stock items in response", async () => {
    const res = await GET();
    const data = await res.json();

    expect(data.d.lowStockItems).toHaveLength(1);
    expect(data.d.lowStockItems[0].name).toBe("Gadget");
  });
});

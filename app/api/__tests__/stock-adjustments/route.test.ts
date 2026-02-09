/** @jest-environment node */
import { POST } from "@/app/api/stock-adjustments/route";
import { NextRequest } from "next/server";

// --- Build a fully chainable Supabase mock per table ---
function createChainMock() {
  const chain: Record<string, jest.Mock> = {};
  const methods = ["select", "insert", "update", "delete", "eq", "neq", "order", "limit"];
  methods.forEach((m) => {
    chain[m] = jest.fn(() => chain);
  });
  chain.single = jest.fn();
  return chain;
}

// Separate chains for different operations on the same table
let productSelectChain: ReturnType<typeof createChainMock>;
let productUpdateChain: ReturnType<typeof createChainMock>;
let adjustmentChain: ReturnType<typeof createChainMock>;
let userChain: ReturnType<typeof createChainMock>;

const mockFrom = jest.fn((table: string) => {
  if (table === "products") {
    // Route through a proxy that picks the right chain based on operation
    return {
      select: jest.fn(() => productSelectChain),
      update: jest.fn((...args: unknown[]) => {
        productUpdateChain.update(...args);
        return productUpdateChain;
      }),
    };
  }
  if (table === "stock_adjustments") return adjustmentChain;
  if (table === "users") return userChain;
  return createChainMock();
});

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

import { sendLowStockEmail } from "@/src/lib/resend";

jest.mock("@/src/lib/resend", () => ({
  sendLowStockEmail: jest.fn(() => Promise.resolve()),
}));

const mockSendLowStockEmail = sendLowStockEmail as jest.Mock;

function makeRequest(body: Record<string, unknown>, withAuth = true) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (withAuth) headers.Cookie = "auth-token=valid-token";

  return new NextRequest("http://localhost/api/stock-adjustments", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

describe("POST /api/stock-adjustments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    productSelectChain = createChainMock();
    productUpdateChain = createChainMock();
    adjustmentChain = createChainMock();
    userChain = createChainMock();
  });

  it("Should return 401 without auth cookie", async () => {
    const req = new NextRequest("http://localhost/api/stock-adjustments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ d: {} }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(data.c).toBe(401);
  });

  it("Should return 404 if product not found", async () => {
    productSelectChain.single.mockResolvedValueOnce({
      data: null,
      error: { message: "Not found" },
    });

    const res = await POST(
      makeRequest({ d: { product_id: "bad", type: "incoming", units: 5 } })
    );
    const data = await res.json();
    expect(data.c).toBe(404);
  });

  it("Should return 400 if outgoing exceeds stock", async () => {
    productSelectChain.single.mockResolvedValueOnce({
      data: { id: "p-1", stock: 3, min_stock: 5, name: "Widget" },
      error: null,
    });

    const res = await POST(
      makeRequest({ d: { product_id: "p-1", type: "outgoing", units: 10 } })
    );
    const data = await res.json();
    expect(data.c).toBe(400);
    expect(data.m).toContain("Insufficient");
  });

  it("Should create incoming adjustment and update stock", async () => {
    productSelectChain.single.mockResolvedValueOnce({
      data: { id: "p-1", stock: 10, min_stock: 5, name: "Widget" },
      error: null,
    });
    productUpdateChain.eq.mockResolvedValueOnce({ error: null });
    adjustmentChain.single.mockResolvedValueOnce({
      data: { id: "adj-1", product_id: "p-1", type: "incoming", units: 5 },
      error: null,
    });
    userChain.single.mockResolvedValueOnce({
      data: { email: "a@b.com", low_stock_limit: 5 },
      error: null,
    });

    const res = await POST(
      makeRequest({ d: { product_id: "p-1", type: "incoming", units: 5 } })
    );
    const data = await res.json();
    expect(data.c).toBe(201);
    expect(data.d.type).toBe("incoming");
  });

  it("Should set Low Stock status when stock falls below min_stock", async () => {
    productSelectChain.single.mockResolvedValueOnce({
      data: { id: "p-1", stock: 8, min_stock: 5, name: "Widget" },
      error: null,
    });
    productUpdateChain.eq.mockResolvedValueOnce({ error: null });
    adjustmentChain.single.mockResolvedValueOnce({
      data: { id: "adj-2", product_id: "p-1", type: "outgoing", units: 5 },
      error: null,
    });
    userChain.single.mockResolvedValueOnce({
      data: { email: "a@b.com", low_stock_limit: 5 },
      error: null,
    });

    const res = await POST(
      makeRequest({ d: { product_id: "p-1", type: "outgoing", units: 5 } })
    );
    const data = await res.json();
    expect(data.c).toBe(201);

    expect(productUpdateChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ stock: 3, status: "Low Stock" })
    );
  });

  it("Should set Out of Stock when stock reaches 0", async () => {
    productSelectChain.single.mockResolvedValueOnce({
      data: { id: "p-1", stock: 5, min_stock: 5, name: "Widget" },
      error: null,
    });
    productUpdateChain.eq.mockResolvedValueOnce({ error: null });
    adjustmentChain.single.mockResolvedValueOnce({
      data: { id: "adj-3", product_id: "p-1", type: "outgoing", units: 5 },
      error: null,
    });
    userChain.single.mockResolvedValueOnce({
      data: { email: "a@b.com", low_stock_limit: 5 },
      error: null,
    });

    const res = await POST(
      makeRequest({ d: { product_id: "p-1", type: "outgoing", units: 5 } })
    );
    const data = await res.json();
    expect(data.c).toBe(201);

    expect(productUpdateChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ stock: 0, status: "Out of Stock" })
    );
  });

  it("Should send low stock email on threshold transition", async () => {

    productSelectChain.single.mockResolvedValueOnce({
      data: { id: "p-1", stock: 10, min_stock: 5, name: "Widget" },
      error: null,
    });
    productUpdateChain.eq.mockResolvedValueOnce({ error: null });
    adjustmentChain.single.mockResolvedValueOnce({
      data: { id: "adj-4", product_id: "p-1", type: "outgoing", units: 6 },
      error: null,
    });
    userChain.single.mockResolvedValueOnce({
      data: { email: "a@b.com", low_stock_limit: 5 },
      error: null,
    });

    const res = await POST(
      makeRequest({ d: { product_id: "p-1", type: "outgoing", units: 6 } })
    );
    const data = await res.json();
    expect(data.c).toBe(201);
    expect(mockSendLowStockEmail).toHaveBeenCalledWith("a@b.com", "Widget", 4, 5);
  });

  it("Should NOT send email if stock was already below threshold", async () => {

    productSelectChain.single.mockResolvedValueOnce({
      data: { id: "p-1", stock: 3, min_stock: 5, name: "Widget" },
      error: null,
    });
    productUpdateChain.eq.mockResolvedValueOnce({ error: null });
    adjustmentChain.single.mockResolvedValueOnce({
      data: { id: "adj-5", product_id: "p-1", type: "outgoing", units: 1 },
      error: null,
    });
    userChain.single.mockResolvedValueOnce({
      data: { email: "a@b.com", low_stock_limit: 5 },
      error: null,
    });

    await POST(
      makeRequest({ d: { product_id: "p-1", type: "outgoing", units: 1 } })
    );

    expect(mockSendLowStockEmail).not.toHaveBeenCalled();
  });
});

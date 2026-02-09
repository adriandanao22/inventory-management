/** @jest-environment node */
import { GET, POST } from "@/app/api/products/route";
import { NextRequest } from "next/server";

// --- Supabase mock with chainable query builder ---
const mockQueryResult = { data: null as unknown, error: null as unknown };

const queryBuilder: Record<string, jest.Mock> = {};
queryBuilder.select = jest.fn(() => queryBuilder);
queryBuilder.insert = jest.fn(() => queryBuilder);
queryBuilder.eq = jest.fn(() => queryBuilder);
queryBuilder.neq = jest.fn(() => queryBuilder);
queryBuilder.or = jest.fn(() => queryBuilder);
queryBuilder.order = jest.fn(() => queryBuilder);
queryBuilder.limit = jest.fn(() => queryBuilder);
queryBuilder.single = jest.fn(() => Promise.resolve(mockQueryResult));
// For non-single queries, resolve via then
queryBuilder.then = undefined as unknown as jest.Mock;

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

function makeGetRequest(params: Record<string, string> = {}) {
  const url = new URL("http://localhost/api/products");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

function makePostRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/products", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQueryResult.data = null;
    mockQueryResult.error = null;
  });

  it("Should return products for authenticated user", async () => {
    // For non-single queries, we need the final await to resolve
    const products = [
      { id: "1", name: "Widget", sku: "W-001", stock: 10 },
      { id: "2", name: "Gadget", sku: "G-001", stock: 5 },
    ];

    // Override the chain's last call to return data
    queryBuilder.order.mockImplementationOnce(() => ({
      ...queryBuilder,
      then: (resolve: (val: { data: unknown; error: unknown }) => void) =>
        resolve({ data: products, error: null }),
      eq: jest.fn().mockReturnValue({
        then: (resolve: (val: { data: unknown; error: unknown }) => void) =>
          resolve({ data: products, error: null }),
        or: jest.fn().mockReturnValue({
          then: (resolve: (val: { data: unknown; error: unknown }) => void) =>
            resolve({ data: products, error: null }),
        }),
        eq: jest.fn().mockReturnValue({
          then: (resolve: (val: { data: unknown; error: unknown }) => void) =>
            resolve({ data: products, error: null }),
          or: jest.fn().mockReturnValue({
            then: (resolve: (val: { data: unknown; error: unknown }) => void) =>
              resolve({ data: products, error: null }),
          }),
        }),
      }),
    }));

    const res = await GET(makeGetRequest());
    const data = await res.json();
    expect(data.c).toBe(200);
    expect(data.d).toEqual(products);
  });

  it("Should return 500 on database error", async () => {
    queryBuilder.order.mockImplementationOnce(() => ({
      ...queryBuilder,
      then: (resolve: (val: { data: unknown; error: unknown }) => void) =>
        resolve({ data: null, error: { message: "DB error" } }),
      eq: jest.fn().mockReturnValue({
        then: (resolve: (val: { data: unknown; error: unknown }) => void) =>
          resolve({ data: null, error: { message: "DB error" } }),
        or: jest.fn().mockReturnValue({
          then: (resolve: (val: { data: unknown; error: unknown }) => void) =>
            resolve({ data: null, error: { message: "DB error" } }),
        }),
      }),
    }));

    const res = await GET(makeGetRequest());
    const data = await res.json();
    expect(data.c).toBe(500);
  });
});

describe("POST /api/products", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQueryResult.data = null;
    mockQueryResult.error = null;
  });

  it("Should return 400 if required fields are missing", async () => {
    const res = await POST(makePostRequest({ d: { name: "", sku: "", price: 0 } }));
    const data = await res.json();
    expect(data.c).toBe(400);
  });

  it("Should return 409 if SKU already exists", async () => {
    // SKU check returns existing product
    queryBuilder.single.mockResolvedValueOnce({ data: { id: "existing" }, error: null });

    const res = await POST(
      makePostRequest({
        d: { name: "Widget", sku: "DUP-001", price: 10, category: "Parts", stock: 5 },
      })
    );
    const data = await res.json();
    expect(data.c).toBe(409);
  });

  it("Should return 201 on successful creation", async () => {
    const newProduct = { id: "new-1", name: "Widget", sku: "W-001", price: 10 };

    // SKU check — not found
    queryBuilder.single.mockResolvedValueOnce({ data: null, error: null });
    // Insert — success
    queryBuilder.single.mockResolvedValueOnce({ data: newProduct, error: null });

    const res = await POST(
      makePostRequest({
        d: { name: "Widget", sku: "W-001", price: 10, category: "Parts", stock: 5 },
      })
    );
    const data = await res.json();
    expect(data.c).toBe(201);
    expect(data.d).toEqual(newProduct);
  });

  it("Should return 500 on insert failure", async () => {
    // SKU check — not found
    queryBuilder.single.mockResolvedValueOnce({ data: null, error: null });
    // Insert — fails
    queryBuilder.single.mockResolvedValueOnce({ data: null, error: { message: "DB error" } });

    const res = await POST(
      makePostRequest({
        d: { name: "Widget", sku: "W-001", price: 10, category: "Parts", stock: 5 },
      })
    );
    const data = await res.json();
    expect(data.c).toBe(500);
  });
});

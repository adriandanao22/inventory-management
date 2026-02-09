/** @jest-environment node */
import { GET, PUT, DELETE } from "@/app/api/products/[id]/route";
import { NextRequest } from "next/server";

// --- Supabase mock with chainable query builder ---
const queryBuilder: Record<string, jest.Mock> = {};
queryBuilder.select = jest.fn(() => queryBuilder);
queryBuilder.insert = jest.fn(() => queryBuilder);
queryBuilder.update = jest.fn(() => queryBuilder);
queryBuilder.delete = jest.fn(() => queryBuilder);
queryBuilder.eq = jest.fn(() => queryBuilder);
queryBuilder.neq = jest.fn(() => queryBuilder);
queryBuilder.single = jest.fn();

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

const makeParams = (id: string) => ({
  params: Promise.resolve({ id }),
});

describe("GET /api/products/[id]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("Should return a product by id", async () => {
    const product = { id: "p-1", name: "Widget", sku: "W-001", stock: 10 };
    queryBuilder.single.mockResolvedValueOnce({ data: product, error: null });

    const req = new NextRequest("http://localhost/api/products/p-1");
    const res = await GET(req, makeParams("p-1"));
    const data = await res.json();

    expect(data.c).toBe(200);
    expect(data.d).toEqual(product);
  });

  it("Should return 404 if product not found", async () => {
    queryBuilder.single.mockResolvedValueOnce({ data: null, error: { message: "Not found" } });

    const req = new NextRequest("http://localhost/api/products/bad-id");
    const res = await GET(req, makeParams("bad-id"));
    const data = await res.json();

    expect(data.c).toBe(404);
  });
});

describe("PUT /api/products/[id]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("Should return 400 if no fields to update", async () => {
    const req = new NextRequest("http://localhost/api/products/p-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ d: {} }),
    });
    const res = await PUT(req, makeParams("p-1"));
    const data = await res.json();
    expect(data.c).toBe(400);
  });

  it("Should return 409 if updated SKU already exists", async () => {
    // SKU uniqueness check returns existing
    queryBuilder.single.mockResolvedValueOnce({ data: { id: "other" }, error: null });

    const req = new NextRequest("http://localhost/api/products/p-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ d: { sku: "TAKEN-SKU" } }),
    });
    const res = await PUT(req, makeParams("p-1"));
    const data = await res.json();
    expect(data.c).toBe(409);
  });

  it("Should return 200 on successful update", async () => {
    const updated = { id: "p-1", name: "Updated Widget", sku: "W-001" };
    queryBuilder.single.mockResolvedValueOnce({ data: updated, error: null });

    const req = new NextRequest("http://localhost/api/products/p-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ d: { name: "Updated Widget" } }),
    });
    const res = await PUT(req, makeParams("p-1"));
    const data = await res.json();
    expect(data.c).toBe(200);
    expect(data.d.name).toBe("Updated Widget");
  });

  it("Should return 404 if product not found on update", async () => {
    queryBuilder.single.mockResolvedValueOnce({ data: null, error: { message: "Not found" } });

    const req = new NextRequest("http://localhost/api/products/bad-id", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ d: { name: "X" } }),
    });
    const res = await PUT(req, makeParams("bad-id"));
    const data = await res.json();
    expect(data.c).toBe(404);
  });
});

describe("DELETE /api/products/[id]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("Should return 200 on successful delete", async () => {
    queryBuilder.eq.mockReturnValueOnce({
      ...queryBuilder,
      eq: jest.fn().mockResolvedValueOnce({ error: null }),
    });

    const req = new NextRequest("http://localhost/api/products/p-1", { method: "DELETE" });
    const res = await DELETE(req, makeParams("p-1"));
    const data = await res.json();
    expect(data.c).toBe(200);
  });

  it("Should return 500 on delete failure", async () => {
    queryBuilder.eq.mockReturnValueOnce({
      ...queryBuilder,
      eq: jest.fn().mockResolvedValueOnce({ error: { message: "FK constraint" } }),
    });

    const req = new NextRequest("http://localhost/api/products/p-1", { method: "DELETE" });
    const res = await DELETE(req, makeParams("p-1"));
    const data = await res.json();
    expect(data.c).toBe(500);
  });
});

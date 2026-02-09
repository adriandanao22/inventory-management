/** @jest-environment node */
import { GET, PUT } from "@/app/api/me/settings/route";
import { NextRequest } from "next/server";

// --- Supabase mock ---
const queryBuilder: Record<string, jest.Mock> = {};
queryBuilder.select = jest.fn(() => queryBuilder);
queryBuilder.update = jest.fn(() => queryBuilder);
queryBuilder.eq = jest.fn(() => queryBuilder);
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

describe("GET /api/me/settings", () => {
  beforeEach(() => jest.clearAllMocks());

  it("Should return user low_stock_limit", async () => {
    queryBuilder.single.mockResolvedValueOnce({
      data: { low_stock_limit: 10 },
      error: null,
    });

    const res = await GET();
    const data = await res.json();

    expect(data.c).toBe(200);
    expect(data.d.low_stock_limit).toBe(10);
  });

  it("Should default to 5 if low_stock_limit is null", async () => {
    queryBuilder.single.mockResolvedValueOnce({
      data: { low_stock_limit: null },
      error: null,
    });

    const res = await GET();
    const data = await res.json();

    expect(data.c).toBe(200);
    expect(data.d.low_stock_limit).toBe(5);
  });

  it("Should return 500 on database error", async () => {
    queryBuilder.single.mockResolvedValueOnce({
      data: null,
      error: { message: "DB error" },
    });

    const res = await GET();
    const data = await res.json();
    expect(data.c).toBe(500);
  });
});

describe("PUT /api/me/settings", () => {
  beforeEach(() => jest.clearAllMocks());

  it("Should update low_stock_limit", async () => {
    queryBuilder.eq.mockReturnValueOnce(Promise.resolve({ error: null }));

    const req = new NextRequest("http://localhost/api/me/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ d: { low_stock_limit: 15 } }),
    });

    const res = await PUT(req);
    const data = await res.json();

    expect(data.c).toBe(200);
    expect(data.d.low_stock_limit).toBe(15);
  });

  it("Should return 400 if low_stock_limit is missing", async () => {
    const req = new NextRequest("http://localhost/api/me/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ d: {} }),
    });

    const res = await PUT(req);
    const data = await res.json();
    expect(data.c).toBe(400);
  });

  it("Should return 400 if low_stock_limit is negative", async () => {
    const req = new NextRequest("http://localhost/api/me/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ d: { low_stock_limit: -1 } }),
    });

    const res = await PUT(req);
    const data = await res.json();
    expect(data.c).toBe(400);
  });

  it("Should return 400 if low_stock_limit is not a number", async () => {
    const req = new NextRequest("http://localhost/api/me/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ d: { low_stock_limit: "abc" } }),
    });

    const res = await PUT(req);
    const data = await res.json();
    expect(data.c).toBe(400);
  });

  it("Should return 500 on database error", async () => {
    queryBuilder.eq.mockReturnValueOnce(
      Promise.resolve({ error: { message: "DB error" } })
    );

    const req = new NextRequest("http://localhost/api/me/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ d: { low_stock_limit: 10 } }),
    });

    const res = await PUT(req);
    const data = await res.json();
    expect(data.c).toBe(500);
  });
});

/** @jest-environment node */
import { POST } from "@/app/api/login/route";

const mockSingle = jest.fn();
const mockEq = jest.fn(() => ({ single: mockSingle }));
const mockSelect = jest.fn(() => ({ eq: mockEq }));
const mockFrom = jest.fn(() => ({ select: mockSelect }));

jest.mock("@/src/lib/supabase/server", () => ({
  createClient: () => ({ from: mockFrom }),
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));

jest.mock("@/src/lib/auth", () => ({
  signToken: jest.fn(() => "mocked-jwt-token"),
}));

import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/login", () => {
  beforeEach(() => jest.clearAllMocks());

  it("Should Return 400 If Username Is Missing", async () => {
    const res = await POST(makeRequest({ d: { username: "", password: "pass" }}));
    const data = await res.json();
    expect(data.c).toBe(400);
  });

  it("Should Return 400 If Password Is Missing", async () => {
    const res = await POST(makeRequest({ d: { username: "user", password: "" }}));
    const data = await res.json();
    expect(data.c).toBe(400);
  });

  it("Should Return 401 If User Not Found", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: "Not found" }});
    const res = await POST(makeRequest({ d: { username: "nonexistent", password: "pass" }}));
    const data = await res.json();
    expect(data.c).toBe(401);
  });

  it("Should Return 401 If Password Is Incorrect", async () => {
    mockSingle.mockResolvedValue({
      data: { id: "1", email: "a@b.com", username: "user", password: "hashed" },
      error: null
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const res = await POST(makeRequest({ d: { username: "user", password: "wrong" }}));
    const data = await res.json();
    expect(data.c).toBe(401);
  });

  it("Should Return 200 And Set Auth Cookie On Success", async () => {
    mockSingle.mockResolvedValue({
      data: { id: "1", email: "a@b.com", username: "user", password: "hashed" },
      error: null,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const res = await POST(makeRequest({ d: { username: "user", password: "correct" }}));
    const data = await res.json();

    expect(data.c).toBe(200);
    expect(data.d.token).toBe("mocked-jwt-token");
    expect(res.headers.get("set-cookie")).toContain("auth-token=mocked-jwt-token");
  });
});
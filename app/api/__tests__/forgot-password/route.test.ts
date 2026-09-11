/** @jest-environment node */
import { POST } from "@/app/api/forgot-password/route";
import { NextRequest } from "next/server";

const mockSingle = jest.fn();
const mockSelectEq = jest.fn(() => ({ single: mockSingle }));
const mockSelect = jest.fn(() => ({ eq: mockSelectEq }));
const mockUpdateEq = jest.fn();
const mockUpdate = jest.fn(() => ({ eq: mockUpdateEq }));
const mockFrom = jest.fn(() => ({ select: mockSelect, update: mockUpdate }));

jest.mock("@/src/lib/supabase/server", () => ({
  createClient: () => ({ from: mockFrom }),
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(() => Promise.resolve("hashed-password")),
}));

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ d: body }),
  });
}

describe("POST /api/forgot-password", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateEq.mockResolvedValue({ error: null });
  });

  it("Should return 400 if fields are missing", async () => {
    const res = await POST(makeRequest({ email: "a@b.com" }));
    const data = await res.json();
    expect(data.c).toBe(400);
    expect(data.m).toContain("required");
  });

  it("Should return 400 if passwords do not match", async () => {
    const res = await POST(
      makeRequest({
        email: "a@b.com",
        newPassword: "pass123",
        confirmPassword: "different",
      }),
    );
    const data = await res.json();
    expect(data.c).toBe(400);
    expect(data.m).toContain("Do Not Match");
  });

  it("Should return 400 if password is too short", async () => {
    const res = await POST(
      makeRequest({
        email: "a@b.com",
        newPassword: "abc",
        confirmPassword: "abc",
      }),
    );
    const data = await res.json();
    expect(data.c).toBe(400);
    expect(data.m).toContain("at least 6 characters");
  });

  it("Should return 404 if no user matches the email", async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: null });

    const res = await POST(
      makeRequest({
        email: "missing@b.com",
        newPassword: "pass123",
        confirmPassword: "pass123",
      }),
    );
    const data = await res.json();
    expect(data.c).toBe(404);
  });

  it("Should return 500 if the update fails", async () => {
    mockSingle.mockResolvedValueOnce({ data: { id: "user-1" }, error: null });
    mockUpdateEq.mockResolvedValueOnce({ error: { message: "DB error" } });

    const res = await POST(
      makeRequest({
        email: "a@b.com",
        newPassword: "pass123",
        confirmPassword: "pass123",
      }),
    );
    const data = await res.json();
    expect(data.c).toBe(500);
  });

  it("Should return 200 and store the hashed password on success", async () => {
    mockSingle.mockResolvedValueOnce({ data: { id: "user-1" }, error: null });

    const res = await POST(
      makeRequest({
        email: "a@b.com",
        newPassword: "pass123",
        confirmPassword: "pass123",
      }),
    );
    const data = await res.json();
    expect(data.c).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith({ password: "hashed-password" });
    expect(mockUpdateEq).toHaveBeenCalledWith("id", "user-1");
  });
});

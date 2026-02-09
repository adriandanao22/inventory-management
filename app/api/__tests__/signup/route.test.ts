/** @jest-environment node */
import { POST } from "@/app/api/signup/route";

const mockSingle = jest.fn();
const mockEq = jest.fn(() => ({ single: mockSingle }));
const mockSelect = jest.fn(() => ({ eq: mockEq }));
const mockInsertSelect = jest.fn(() => ({ single: mockSingle }));
const mockInsert = jest.fn(() => ({ select: mockInsertSelect }));
const mockFrom = jest.fn(() => ({ select: mockSelect, insert: mockInsert }));

jest.mock("@/src/lib/supabase/server", () => ({
  createClient: () => ({ from: mockFrom }),
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(() => Promise.resolve("hashed-password")),
}));

jest.mock("@/src/lib/auth", () => ({
  signToken: jest.fn(() => "mocked-jwt-token"),
}));

// Mock recaptcha verification
const mockFetch = jest.fn();
global.fetch = mockFetch;

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/signup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: captcha passes
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    });
  });

  it("Should return 400 if reCAPTCHA fails", async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ success: false }),
    });

    const res = await POST(
      makeRequest({
        token: "bad-token",
        email: "a@b.com",
        username: "user",
        password: "pass123",
        confirmPassword: "pass123",
      })
    );
    const data = await res.json();
    expect(data.c).toBe(400);
    expect(data.m).toContain("reCAPTCHA");
  });

  it("Should return 400 if passwords do not match", async () => {
    const res = await POST(
      makeRequest({
        token: "valid",
        email: "a@b.com",
        username: "user",
        password: "pass123",
        confirmPassword: "different",
      })
    );
    const data = await res.json();
    expect(data.c).toBe(400);
    expect(data.m).toContain("do not match");
  });

  it("Should return 400 if email already exists", async () => {
    mockSingle.mockResolvedValueOnce({ data: { id: "existing" }, error: null });

    const res = await POST(
      makeRequest({
        token: "valid",
        email: "taken@b.com",
        username: "user",
        password: "pass123",
        confirmPassword: "pass123",
      })
    );
    const data = await res.json();
    expect(data.c).toBe(400);
    expect(data.m).toContain("already in use");
  });

  it("Should return 500 if insert fails", async () => {
    // Email check — not found
    mockSingle.mockResolvedValueOnce({ data: null, error: null });
    // Insert fails
    mockSingle.mockResolvedValueOnce({ data: null, error: { message: "DB error" } });

    const res = await POST(
      makeRequest({
        token: "valid",
        email: "new@b.com",
        username: "user",
        password: "pass123",
        confirmPassword: "pass123",
      })
    );
    const data = await res.json();
    expect(data.c).toBe(500);
  });

  it("Should return 200 and set cookie on success", async () => {
    // Email check — not found
    mockSingle.mockResolvedValueOnce({ data: null, error: null });
    // Insert success
    mockSingle.mockResolvedValueOnce({
      data: { id: "new-id", email: "new@b.com", username: "user" },
      error: null,
    });

    const res = await POST(
      makeRequest({
        token: "valid",
        email: "new@b.com",
        username: "user",
        password: "pass123",
        confirmPassword: "pass123",
      })
    );
    const data = await res.json();
    expect(data.c).toBe(200);
    expect(data.d.token).toBe("mocked-jwt-token");
    expect(res.headers.get("set-cookie")).toContain("auth-token=mocked-jwt-token");
  });
});

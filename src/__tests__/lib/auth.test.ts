import { signToken, verifyToken } from "@/src/lib/auth";
import { JwtPayload } from "@/src/types/auth";

describe("Auth Library", () => {
  const mockPayload: JwtPayload = {
    userId: "123",
    email: "test@example.com",
    username: "testuser",
  };

  it("Should Sign And Verify A Token", () => {
    const token = signToken(mockPayload);
    expect(token).toBeDefined();

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(mockPayload.userId);
    expect(decoded?.email).toBe(mockPayload.email);
    expect(decoded?.username).toBe(mockPayload.username);
  });

  it("Should Return Null For An Invalid Token", () => {
    const result = verifyToken("invalid-token");
    expect(result).toBeNull();
  });

  it("Should Return Null For A Tampered Token", () => {
    const token = signToken(mockPayload);
    const tampered = token + "x";
    const result = verifyToken(tampered);
    expect(result).toBeNull();
  });
})
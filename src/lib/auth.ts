import jwt from "jsonwebtoken";

import { JwtPayload } from "@/src/types/auth";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRATION = "1d";

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}
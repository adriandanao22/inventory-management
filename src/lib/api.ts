import { NextRequest, NextResponse } from "next/server";

export function jsonSuccess(
  data: unknown = {},
  message = "Success",
  status = 200,
) {
  return NextResponse.json({ c: status, m: message, d: data }, { status });
}

export function jsonCreated(
  data: unknown = {},
  message = "Created",
  status = 201,
) {
  return NextResponse.json({ c: status, m: message, d: data }, { status });
}

export function jsonError(message = "Internal Server Error", status = 500) {
  return NextResponse.json({ c: status, m: message, d: null }, { status });
}

export function jsonBadRequest(message = "Bad Request", status = 400) {
  return NextResponse.json({ c: status, m: message, d: null }, { status });
}

export function jsonUnauthorized(message = "Unauthorized", status = 401) {
  return NextResponse.json({ c: status, m: message, d: null }, { status });
}

export function jsonNotFound(message = "Not Found", status = 404) {
  return NextResponse.json({ c: status, m: message, d: null }, { status });
}

export function jsonConflict(message = "Conflict", status = 409) {
  return NextResponse.json({ c: status, m: message, d: null }, { status });
}

export function wrapHandler<Args extends unknown[]>(
  handler: (req: NextRequest, ...args: Args) => Promise<NextResponse>,
) {
  return async (req: NextRequest, ...args: Args) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      console.error("API Handler Error:", error);
      return jsonError("Internal Server Error");
    }
  };
}

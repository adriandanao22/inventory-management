import { wrapHandler, jsonSuccess } from "@/src/lib/api";

export const POST = wrapHandler(async () => {
  const response = jsonSuccess("Logout Success");
  response.cookies.set("auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
});

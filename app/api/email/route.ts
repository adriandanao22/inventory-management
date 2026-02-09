import { sendLowStockEmail } from "@/src/lib/resend";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, productName, newStock, lowStockLimit } = await req.json();
  await sendLowStockEmail(email, productName, newStock, lowStockLimit);

  return NextResponse.json({ message: "Low stock email sent" });
}
export async function GET() {
  return Response.json({ message: "Email API is working" });
}
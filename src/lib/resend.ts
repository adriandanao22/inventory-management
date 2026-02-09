import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendLowStockEmail(
  to: string,
  productName: string,
  currentStock: number,
  threshold: number
) {
  await resend.emails.send({
    from: "Inventory Alerts <onboarding@resend.dev>",
    to,
    subject: `Low Stock Alert: ${productName}`,
    html: `
      <h2>Low Stock Alert</h2>
      <p><strong>${productName}</strong> has dropped to <strong>${currentStock} units</strong>.</p>
      <p>Your alert threshold is set to <strong>${threshold} units</strong>.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/products">View Products</a></p>
    `
  })
}
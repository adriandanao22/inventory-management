import { jsonBadRequest, jsonSuccess, wrapHandler } from "@/src/lib/api";

export const POST = wrapHandler(async (req: Request) => {
  const { to, message } = await req.json();

  if (!to || !message) {
    return jsonBadRequest("Missing 'to' or 'message' in request body");
  }

  const res = await fetch("https://smsapiph.onrender.com/api/v1/send/sms", {
    method: "POST",
    headers: {
      "x-api-key": process.env.SMS_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ recipient: to, message: message }),
  });

  if (!res.ok) {
    console.log(await res.text());
    return jsonBadRequest("Failed to send SMS");
  }

  return jsonSuccess({ message: "SMS sent successfully" });
});

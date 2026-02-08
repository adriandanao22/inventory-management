import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("notes").select("*");

  if (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json({ c: 500, m: "Error fetching notes", d: [] });
  }

  if (!data) {
    return NextResponse.json({ c: 404, m: "Not found", d: [] });
  }

  return NextResponse.json({ c: 200, m: "Success", d: data });
}
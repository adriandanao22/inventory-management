import { createClient } from "@/src/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { GET } from "@/app/api/me/route";

export async function PUT(req: NextRequest) {
  const supabase = await createClient();

  try {
    const userResponse = await GET();
    const user = await userResponse.json();
    
    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json({ c: 400, m: "No file uploaded", d: null });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ c: 400, m: "Invalid File Type", d: null });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ c: 400, m: "File size exceeds 5MB", d: null });
    }

    const ext = file.name.split(".").pop();
    const filePath = `${user.d?.user?.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(
      filePath, file, {
        upsert: true,
        contentType: file.type,
      }
    )

    if (uploadError) {
      return NextResponse.json({ c: 500, m: uploadError.message, d: uploadError });
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    
    const { error: updateError } = await supabase
      .from("users")
      .update({ avatar_url: urlData.publicUrl })
      .eq("id", user.d?.user?.id);

    if (updateError) {
      return NextResponse.json({ c: 500, m: updateError.message, d: updateError });
    }

    return NextResponse.json({ c: 200, m: "Avatar updated successfully", d: { avatarUrl: urlData.publicUrl } });
  } catch (error) {
    return NextResponse.json({ c: 500, m: "Internal Server Error", d: error });
  }
}
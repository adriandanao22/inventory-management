import { createClient } from "@/src/lib/supabase/server";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/me/route";
import {
  wrapHandler,
  jsonBadRequest,
  jsonError,
  jsonSuccess,
} from "@/src/lib/api";

export const PUT = wrapHandler(async (req: NextRequest) => {
  const supabase = await createClient();

  const userResponse = await GET(req);
  const user = await userResponse.json();

  const formData = await req.formData();
  const file = formData.get("avatar") as File | null;
  if (!file) return jsonBadRequest("No file uploaded");

  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.type))
    return jsonBadRequest("Invalid File Type");

  if (file.size > 5 * 1024 * 1024)
    return jsonBadRequest("File size exceeds 5MB");

  const ext = file.name.split(".").pop();
  const filePath = `${user.d?.user?.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) return jsonError(uploadError.message);

  const { data: urlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from("users")
    .update({ avatar_url: urlData.publicUrl })
    .eq("id", user.d?.user?.id);

  if (updateError) return jsonError(updateError.message);

  return jsonSuccess(
    { avatarUrl: urlData.publicUrl },
    "Avatar Updated Successfully",
  );
});

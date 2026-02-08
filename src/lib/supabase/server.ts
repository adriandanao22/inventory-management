import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return (await cookieStore).getAll();
        },
        async setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(async ({ name, value, options }) => {
              (await cookieStore).set(name, value, options as CookieOptions);
            });
          } catch (error) {
            // Handle errors silently in read-only contexts
            console.error("Cookie set error:", error);
          }
        },
      },
    }
  );
}
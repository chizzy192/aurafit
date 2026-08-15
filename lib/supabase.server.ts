// src/lib/supabase.server.ts
//
// Server-only Supabase helpers. Keep this file out of client component imports
// because it depends on `next/headers`.

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Server component / route handler usage — respects the signed-in user's
 * session via cookies, so RLS policies apply correctly.
 */
export async function getServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // setAll called from a Server Component with no writable cookie
          // store — safe to ignore if you have middleware refreshing sessions.
        }
      },
    },
  });
}

/**
 * Admin client — bypasses RLS entirely. Use ONLY in trusted server contexts
 * (e.g. a worker downloading a user's garment image to forward to YouCam).
 * Never import this into anything that ships to the browser.
 */
export function getAdminSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(SUPABASE_URL, serviceKey);
}
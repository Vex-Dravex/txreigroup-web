import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  const headersList = await headers();
  const referer = headersList.get("referer");
  const origin = referer ? new URL(referer).origin : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return NextResponse.redirect(new URL("/", origin));
}

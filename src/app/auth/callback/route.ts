import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/app";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Successfully exchanged code for session
      // Check if user has completed onboarding
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Check onboarding status
        const { data: onboardingData } = await supabase
          .from('user_onboarding')
          .select('completed')
          .eq('user_id', user.id)
          .single();

        // If user hasn't completed onboarding, redirect to onboarding
        if (!onboardingData || !onboardingData.completed) {
          return NextResponse.redirect(new URL("/onboarding", requestUrl.origin));
        }
      }

      // User has completed onboarding, proceed to intended destination
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  // If there's an error or no code, redirect to login
  return NextResponse.redirect(new URL("/login?error=invalid_token", requestUrl.origin));
}


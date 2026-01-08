"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ProfileRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/login");
        return;
      }

      router.replace(`/app/profile/${data.user.id}`);
    };

    loadProfile();
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Loading your profile…
      </div>
    </div>
  );
}

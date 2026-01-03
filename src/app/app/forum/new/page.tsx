import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppHeader from "../../components/AppHeader";
import NewPostForm from "./NewPostForm";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type Profile = {
  id: string;
  role: "admin" | "investor" | "wholesaler" | "contractor";
  display_name: string | null;
  avatar_url: string | null;
};

export default async function NewPostPage() {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login");

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name, avatar_url")
    .eq("id", authData.user.id)
    .single();

  const profileData = profile as Profile | null;
  const userRole = profileData?.role || "investor";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <AppHeader
        userRole={userRole}
        currentPage="forum"
        avatarUrl={profileData?.avatar_url || null}
        displayName={profileData?.display_name || null}
        email={authData.user.email}
      />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Create New Post</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Share your thoughts with the community
          </p>
        </div>

        <NewPostForm />
      </div>
    </div>
  );
}


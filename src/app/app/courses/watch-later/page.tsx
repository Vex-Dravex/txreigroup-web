import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppHeader from "../../components/AppHeader";
import { getPrimaryRole, getUserRoles } from "@/lib/roles";

export const dynamic = "force-dynamic";

type Profile = {
  id: string;
  role: "admin" | "investor" | "wholesaler" | "contractor" | "vendor";
  display_name: string | null;
  avatar_url: string | null;
};

type WatchLaterItem = {
  id: string;
  created_at: string;
  education_videos: {
    id: string;
    title: string;
    description: string | null;
    level: string;
    topics: string[];
  } | null;
};

export default async function WatchLaterPage() {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name, avatar_url")
    .eq("id", authData.user.id)
    .single();

  const profileData = profile as Profile | null;
  const roles = await getUserRoles(
    supabase,
    authData.user.id,
    profileData?.role || "investor"
  );
  const primaryRole = getPrimaryRole(roles, profileData?.role || "investor");

  const { data: watchLater, error } = await supabase
    .from("education_watch_later")
    .select(
      "id, created_at, education_videos:video_id (id, title, description, level, topics)"
    )
    .eq("user_id", authData.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching watch later list:", error);
  }

  const watchLaterData = (watchLater as WatchLaterItem[]) || [];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <AppHeader
        userRole={primaryRole}
        currentPage="courses"
        avatarUrl={profileData?.avatar_url || null}
        displayName={profileData?.display_name || null}
        email={authData.user.email}
      />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">
              Education Center
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              Watch Later List
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Your saved lessons to revisit.
            </p>
          </div>
          <Link
            href="/app/courses"
            className="rounded-full border border-zinc-300 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Back to Education Center
          </Link>
        </div>

        {watchLaterData.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-950">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No saved videos yet. Save a lesson from the player page.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {watchLaterData.map((item) => {
              const video = item.education_videos;
              if (!video) return null;
              return (
                <Link
                  key={item.id}
                  href={`/app/courses/videos/${video.id}`}
                  className="block rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      {video.title}
                    </h2>
                    <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white dark:bg-zinc-800">
                      {video.level}
                    </span>
                  </div>
                  {video.description && (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {video.description}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                    {video.topics.map((topic) => (
                      <span
                        key={topic}
                        className="rounded-full border border-zinc-200 bg-white px-3 py-1 dark:border-zinc-700 dark:bg-zinc-900"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

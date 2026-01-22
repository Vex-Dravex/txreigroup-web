import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppHeader from "../../components/AppHeader";
import { getPrimaryRole, getUserRoles, hasRole } from "@/lib/roles";
import { deleteEducationVideo, setEducationVideoPublished } from "./actions";

export const dynamic = "force-dynamic";

type Profile = {
  id: string;
  role: "admin" | "investor" | "wholesaler" | "contractor" | "vendor";
  display_name: string | null;
  avatar_url: string | null;
};

type EducationVideo = {
  id: string;
  title: string;
  description: string | null;
  level: string;
  topics: string[];
  is_published: boolean;
  created_at: string;
};

export default async function AdminVideosPage() {
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
  if (!hasRole(roles, "admin")) {
    redirect("/app");
  }

  const primaryRole = getPrimaryRole(roles, profileData?.role || "investor");

  const { data: videos, error } = await supabase
    .from("education_videos")
    .select("id, title, description, level, topics, is_published, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching education videos:", error);
  }

  const videosData = (videos as EducationVideo[]) || [];

  return (
    <div className="w-full">
      <AppHeader
        userRole={primaryRole}
        currentPage="admin"
        avatarUrl={profileData?.avatar_url || null}
        displayName={profileData?.display_name || null}
        email={authData.user.email}
      />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">
              Education Center
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              Manage education videos
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Publish, edit, and organize your training library.
            </p>
          </div>
          <Link
            href="/app/admin/videos/new"
            className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
          >
            Add new video
          </Link>
        </div>

        {videosData.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white/50 backdrop-blur-xl p-12 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-900/50">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No education videos yet. Upload your first video to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {videosData.map((video) => (
              <div
                key={video.id}
                className="rounded-2xl border border-zinc-200 bg-white/50 backdrop-blur-xl p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/50"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {video.title}
                      </h2>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                          video.is_published
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                            : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}
                      >
                        {video.is_published ? "Published" : "Draft"}
                      </span>
                    </div>
                    {video.description && (
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        {video.description}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                      <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800">
                        {video.level}
                      </span>
                      {video.topics.map((topic) => (
                        <span
                          key={topic}
                          className="rounded-full border border-zinc-200 bg-white/50 backdrop-blur-xl px-3 py-1 dark:border-zinc-700 dark:bg-zinc-900"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/app/admin/videos/${video.id}`}
                      className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      Edit
                    </Link>
                    <form action={setEducationVideoPublished}>
                      <input type="hidden" name="id" value={video.id} />
                      <input
                        type="hidden"
                        name="publish"
                        value={video.is_published ? "false" : "true"}
                      />
                      <button
                        type="submit"
                        className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
                          video.is_published
                            ? "border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                            : "bg-emerald-600 text-white hover:bg-emerald-500"
                        }`}
                      >
                        {video.is_published ? "Unpublish" : "Publish"}
                      </button>
                    </form>
                    <form action={deleteEducationVideo}>
                      <input type="hidden" name="id" value={video.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-red-700 hover:bg-red-100 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppHeader from "../../../components/AppHeader";
import { getPrimaryRole, getUserRoles, hasRole } from "@/lib/roles";
import VideoEditForm from "./VideoEditForm";

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
  video_url: string;
};

export default async function AdminVideoEditPage({
  params,
}: {
  params: { id: string };
}) {
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

  const { data: video, error } = await supabase
    .from("education_videos")
    .select("id, title, description, level, topics, video_url")
    .eq("id", params.id)
    .single();

  if (error || !video) {
    redirect("/app/admin/videos");
  }

  const videoData = video as EducationVideo;

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
              Edit education video
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Update the file or refine the lesson metadata.
            </p>
          </div>
          <Link
            href="/app/admin/videos"
            className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Back to manager
          </Link>
        </div>

        <VideoEditForm video={videoData} />
      </div>
    </div>
  );
}

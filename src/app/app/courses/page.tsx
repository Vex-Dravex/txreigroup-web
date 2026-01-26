import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppHeader from "../components/AppHeader";
import { getPrimaryRole, getUserRoles } from "@/lib/roles";
import EducationCenterClient from "./EducationCenterClient";
import { CoursesScrollRestorationProvider } from "@/lib/scrollRestoration";
import { getWatchLaterVideos } from "./watchLaterActions";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type Course = {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  required_tier: "free" | "investor_basic" | "investor_pro" | "contractor_basic" | "contractor_featured";
  estimated_duration_minutes: number | null;
  instructor_name: string | null;
  created_at: string;
};

type EducationVideo = {
  id: string;
  title: string;
  description: string | null;
  topics: string[];
  level: string;
  video_url: string;
  thumbnail_url: string | null;
  created_at: string;
};

type Profile = {
  id: string;
  role: "admin" | "investor" | "wholesaler" | "contractor" | "vendor";
  display_name: string | null;
  avatar_url: string | null;
};

export default async function CoursesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login?mode=signup");

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name, avatar_url")
    .eq("id", authData.user.id)
    .single();

  const profileData = profile as Profile | null;
  const roles = await getUserRoles(supabase, authData.user.id, profileData?.role || "investor");
  const userRole = getPrimaryRole(roles, profileData?.role || "investor");

  // Fetch published courses (RLS will filter by tier access)
  let coursesQuery = supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  // Admins can see all (including unpublished), but for now we'll just show published
  const { data: courses, error } = await coursesQuery;

  if (error) {
    console.error("Error fetching courses:", error);
  }

  const coursesData = (courses as Course[]) || [];

  const { data: educationVideos, error: educationError } = await supabase
    .from("education_videos")
    .select("id, title, description, topics, level, video_url, thumbnail_url, created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (educationError) {
    console.error("Error fetching education videos:", educationError);
  }

  const educationVideosData = (educationVideos as EducationVideo[]) || [];

  const tierDisplayNames: Record<string, string> = {
    free: "Free",
    investor_basic: "Investor Basic",
    investor_pro: "Investor Pro",
    contractor_basic: "Contractor Basic",
    contractor_featured: "Contractor Featured",
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const courseVideos = coursesData.map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    duration: formatDuration(course.estimated_duration_minutes),
    topics: ["Wholesale Real Estate"],
    thumbnailUrl: course.thumbnail_url,
    href: `/app/courses/${course.id}`,
    badge: tierDisplayNames[course.required_tier],
  }));

  // Fetch watch later videos
  const watchLaterVideos = await getWatchLaterVideos();

  return (
    <CoursesScrollRestorationProvider>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 selection:bg-amber-500/30">
        <div className="noise-overlay fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" />

        {/* Background Gradient Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-amber-500/5 blur-[120px]" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
        </div>

        <div className="relative z-10">
          <AppHeader
            userRole={userRole}
            currentPage="courses"
            avatarUrl={profileData?.avatar_url || null}
            displayName={profileData?.display_name || null}
            email={authData.user.email}
          />
          <EducationCenterClient
            courseVideos={courseVideos}
            educationVideos={educationVideosData}
            watchLaterVideos={watchLaterVideos}
          />
        </div>
      </div>
    </CoursesScrollRestorationProvider>
  );
}

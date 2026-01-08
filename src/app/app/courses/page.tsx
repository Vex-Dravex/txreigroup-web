import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import AppHeader from "../components/AppHeader";
import { getPrimaryRole, getUserRoles } from "@/lib/roles";

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

type Profile = {
  id: string;
  role: "admin" | "investor" | "wholesaler" | "contractor" | "vendor";
  display_name: string | null;
  avatar_url: string | null;
};

export default async function CoursesPage() {
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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <AppHeader
        userRole={userRole}
        currentPage="courses"
        avatarUrl={profileData?.avatar_url || null}
        displayName={profileData?.display_name || null}
        email={authData.user.email}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Education Center</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Learn real estate investing strategies and techniques
          </p>
        </div>

        {coursesData.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-zinc-600 dark:text-zinc-400">No courses available at this time.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {coursesData.map((course) => (
              <Link
                key={course.id}
                href={`/app/courses/${course.id}`}
                className="group rounded-lg border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
              >
                {course.thumbnail_url && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-zinc-200 dark:bg-zinc-800">
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="mb-2 flex items-start justify-between">
                    <h2 className="text-lg font-semibold text-zinc-900 group-hover:text-zinc-700 dark:text-zinc-50 dark:group-hover:text-zinc-200">
                      {course.title}
                    </h2>
                    <span className="ml-2 inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {tierDisplayNames[course.required_tier]}
                    </span>
                  </div>

                  {course.description && (
                    <p className="mb-4 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {course.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    {course.instructor_name && (
                      <span>By {course.instructor_name}</span>
                    )}
                    {course.estimated_duration_minutes && (
                      <span>{formatDuration(course.estimated_duration_minutes)}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

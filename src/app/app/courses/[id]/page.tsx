import { redirect, notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

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

type CourseModule = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  display_order: number;
  course_lessons: {
    id: string;
    module_id: string;
    title: string;
    duration_minutes: number | null;
    display_order: number;
    is_preview: boolean;
  }[];
};

type UserProgress = {
  lesson_id: string;
  completed_at: string | null;
  progress_percentage: number;
};

type Profile = {
  id: string;
  role: "admin" | "investor" | "wholesaler" | "contractor";
};

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login");

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  const profileData = profile as Profile | null;

  // Fetch course
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("*")
    .eq("id", params.id)
    .single();

  if (courseError || !course) {
    notFound();
  }

  const courseData = course as Course;

  // Fetch modules with lessons
  const { data: modules } = await supabase
    .from("course_modules")
    .select(`
      *,
      course_lessons (
        id,
        module_id,
        title,
        duration_minutes,
        display_order,
        is_preview
      )
    `)
    .eq("course_id", params.id)
    .order("display_order", { ascending: true });

  // Fetch user progress
  const { data: progress } = await supabase
    .from("user_course_progress")
    .select("lesson_id, completed_at, progress_percentage")
    .eq("user_id", authData.user.id)
    .eq("course_id", params.id);

  const modulesData = (modules as CourseModule[]) || [];
  const progressData = (progress as UserProgress[]) || [];

  // Create progress map
  const progressMap = new Map(
    progressData.map((p) => [p.lesson_id, { completed: !!p.completed_at, progress: p.progress_percentage }])
  );

  // Calculate overall course progress
  const allLessons = modulesData.flatMap((m) => m.course_lessons);
  const completedLessons = allLessons.filter((l) => progressMap.get(l.id)?.completed).length;
  const overallProgress = allLessons.length > 0 ? Math.round((completedLessons / allLessons.length) * 100) : 0;

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
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/app/courses"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back to Courses
          </Link>
        </div>

        <div className="mb-8">
          {courseData.thumbnail_url && (
            <div className="mb-6 aspect-video w-full overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-800">
              <img
                src={courseData.thumbnail_url}
                alt={courseData.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{courseData.title}</h1>
                <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {tierDisplayNames[courseData.required_tier]}
                </span>
              </div>
              {courseData.instructor_name && (
                <p className="text-zinc-600 dark:text-zinc-400">By {courseData.instructor_name}</p>
              )}
            </div>
          </div>

          {courseData.description && (
            <p className="mb-6 text-zinc-700 dark:text-zinc-300">{courseData.description}</p>
          )}

          {/* Progress Bar */}
          {overallProgress > 0 && (
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-900 dark:text-zinc-50">Course Progress</span>
                <span className="text-zinc-600 dark:text-zinc-400">{overallProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div
                  className="h-full bg-zinc-900 transition-all dark:bg-zinc-50"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            {courseData.estimated_duration_minutes && (
              <span>⏱ {formatDuration(courseData.estimated_duration_minutes)}</span>
            )}
            <span>📚 {allLessons.length} lessons</span>
            <span>📦 {modulesData.length} modules</span>
          </div>
        </div>

        {/* Modules and Lessons */}
        <div className="space-y-6">
          {modulesData.map((module) => (
            <div
              key={module.id}
              className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <h2 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">{module.title}</h2>
              {module.description && (
                <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">{module.description}</p>
              )}

              <div className="space-y-2">
                {module.course_lessons
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((lesson) => {
                    const lessonProgress = progressMap.get(lesson.id);
                    const isCompleted = lessonProgress?.completed || false;

                    return (
                      <Link
                        key={lesson.id}
                        href={`/app/courses/${params.id}/lessons/${lesson.id}`}
                        className="flex items-center justify-between rounded-md border border-zinc-200 p-3 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                      >
                        <div className="flex items-center gap-3">
                          {isCompleted ? (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                              <svg
                                className="h-4 w-4 text-green-600 dark:text-green-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          ) : (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-zinc-300 dark:border-zinc-700">
                              <div className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-zinc-900 dark:text-zinc-50">{lesson.title}</span>
                              {lesson.is_preview && (
                                <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                  Preview
                                </span>
                              )}
                            </div>
                            {lesson.duration_minutes && (
                              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                {formatDuration(lesson.duration_minutes)}
                              </span>
                            )}
                          </div>
                        </div>
                        <svg
                          className="h-5 w-5 text-zinc-400 dark:text-zinc-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        {modulesData.length === 0 && (
          <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-zinc-600 dark:text-zinc-400">No modules available for this course yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}


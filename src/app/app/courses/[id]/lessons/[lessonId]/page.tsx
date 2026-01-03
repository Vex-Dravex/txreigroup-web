import { redirect, notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { updateLessonProgress, markLessonComplete } from "./actions";
import LessonContent from "./LessonContent";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type Lesson = {
  id: string;
  module_id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  display_order: number;
  is_preview: boolean;
  course_modules: {
    id: string;
    course_id: string;
    title: string;
    display_order: number;
    courses: {
      id: string;
      title: string;
    } | null;
  } | null;
};

type LessonProgress = {
  id: string;
  completed_at: string | null;
  progress_percentage: number;
  last_accessed_at: string;
};

type Profile = {
  id: string;
  role: "admin" | "investor" | "wholesaler" | "contractor";
};

export default async function LessonPage({
  params,
}: {
  params: { id: string; lessonId: string };
}) {
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

  // Fetch lesson with module and course info
  const { data: lesson, error: lessonError } = await supabase
    .from("course_lessons")
    .select(`
      *,
      course_modules:module_id (
        id,
        course_id,
        title,
        display_order,
        courses:course_id (
          id,
          title
        )
      )
    `)
    .eq("id", params.lessonId)
    .single();

  if (lessonError || !lesson) {
    notFound();
  }

  const lessonData = lesson as Lesson;

  // Verify lesson belongs to the course
  // Handle course_modules as array (Supabase returns arrays for relations)
  const courseModules = Array.isArray(lessonData.course_modules) 
    ? lessonData.course_modules[0] 
    : lessonData.course_modules;
  
  if (!courseModules || courseModules.course_id !== params.id) {
    notFound();
  }

  // Fetch user progress for this lesson
  const { data: progress } = await supabase
    .from("user_course_progress")
    .select("*")
    .eq("user_id", authData.user.id)
    .eq("lesson_id", params.lessonId)
    .single();

  const progressData = progress as LessonProgress | null;

  // Get all lessons in the course for navigation
  const { data: allLessons } = await supabase
    .from("course_lessons")
    .select(`
      id,
      module_id,
      title,
      display_order,
      course_modules:module_id (
        course_id,
        display_order
      )
    `)
    .eq("course_modules.course_id", params.id)
    .order("course_modules.display_order", { ascending: true })
    .order("display_order", { ascending: true });

  const allLessonsData = ((allLessons || []) as Array<{
    id: string;
    module_id: string;
    title: string;
    display_order: number;
    course_modules: { course_id: string; display_order: number }[] | { course_id: string; display_order: number } | null;
  }>).map((lesson) => {
    // Normalize course_modules to single object
    const courseModules = Array.isArray(lesson.course_modules) 
      ? lesson.course_modules[0] 
      : lesson.course_modules;
    return {
      ...lesson,
      course_modules: courseModules,
    };
  }) as Array<{
    id: string;
    module_id: string;
    title: string;
    display_order: number;
    course_modules: { course_id: string; display_order: number } | null;
  }>;

  // Find current lesson index and get next/previous
  const currentIndex = allLessonsData.findIndex((l) => l.id === params.lessonId);
  const previousLesson = currentIndex > 0 ? allLessonsData[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessonsData.length - 1 ? allLessonsData[currentIndex + 1] : null;

  const isCompleted = progressData?.completed_at !== null;
  const progressPercentage = progressData?.progress_percentage || 0;

  // Update last accessed time
  if (progressData) {
    await supabase
      .from("user_course_progress")
      .update({ last_accessed_at: new Date().toISOString() })
      .eq("id", progressData.id);
  } else {
    // Create initial progress record
    await supabase.from("user_course_progress").insert({
      user_id: authData.user.id,
      course_id: params.id,
      lesson_id: params.lessonId,
      last_accessed_at: new Date().toISOString(),
      progress_percentage: 0,
    });
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href={`/app/courses/${params.id}`}
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back to Course
          </Link>
        </div>

        <div className="mb-6">
          <div className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
            {lessonData.course_modules?.courses?.title} • {lessonData.course_modules?.title}
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{lessonData.title}</h1>
        </div>

        {/* Progress Bar */}
        {progressPercentage > 0 && (
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-zinc-900 dark:text-zinc-50">Progress</span>
              <span className="text-zinc-600 dark:text-zinc-400">{progressPercentage}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className="h-full bg-zinc-900 transition-all dark:bg-zinc-50"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Video */}
        {lessonData.video_url && (
          <div className="mb-6 aspect-video w-full overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-800">
            <iframe
              src={lessonData.video_url}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Lesson Content */}
        <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <LessonContent
            lessonId={params.lessonId}
            content={lessonData.content}
            isCompleted={isCompleted}
            progressPercentage={progressPercentage}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between border-t border-zinc-200 pt-6 dark:border-zinc-800">
          {previousLesson ? (
            <Link
              href={`/app/courses/${params.id}/lessons/${previousLesson.id}`}
              className="flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </Link>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <Link
              href={`/app/courses/${params.id}/lessons/${nextLesson.id}`}
              className="flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              Next
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}


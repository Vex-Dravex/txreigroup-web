"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Update lesson progress
export async function updateLessonProgress(lessonId: string, progressPercentage: number) {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    throw new Error("Unauthorized");
  }

  // Get course_id from lesson
  const { data: lesson } = await supabase
    .from("course_lessons")
    .select("course_modules:module_id (course_id)")
    .eq("id", lessonId)
    .single();

  if (!lesson || !lesson.course_modules) {
    throw new Error("Lesson not found");
  }

  // Handle course_modules as array (Supabase returns arrays for relations)
  const courseModules = Array.isArray(lesson.course_modules) 
    ? lesson.course_modules[0] 
    : lesson.course_modules;
  const courseId = (courseModules as { course_id: string })?.course_id;

  if (!courseId) {
    throw new Error("Course ID not found");
  }

  // Update or create progress
  const { data: existingProgress } = await supabase
    .from("user_course_progress")
    .select("id")
    .eq("user_id", authData.user.id)
    .eq("lesson_id", lessonId)
    .single();

  if (existingProgress) {
    const { error } = await supabase
      .from("user_course_progress")
      .update({
        progress_percentage: Math.min(100, Math.max(0, progressPercentage)),
        last_accessed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingProgress.id);

    if (error) {
      throw new Error(`Failed to update progress: ${error.message}`);
    }
  } else {
    const { error } = await supabase.from("user_course_progress").insert({
      user_id: authData.user.id,
      course_id: courseId,
      lesson_id: lessonId,
      progress_percentage: Math.min(100, Math.max(0, progressPercentage)),
      last_accessed_at: new Date().toISOString(),
    });

    if (error) {
      throw new Error(`Failed to create progress: ${error.message}`);
    }
  }

  revalidatePath(`/app/courses/${courseId}/lessons/${lessonId}`);
  revalidatePath(`/app/courses/${courseId}`);
}

// Mark lesson as complete
export async function markLessonComplete(lessonId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    throw new Error("Unauthorized");
  }

  // Get course_id from lesson
  const { data: lesson } = await supabase
    .from("course_lessons")
    .select("course_modules:module_id (course_id)")
    .eq("id", lessonId)
    .single();

  if (!lesson || !lesson.course_modules) {
    throw new Error("Lesson not found");
  }

  // Handle course_modules as array (Supabase returns arrays for relations)
  const courseModules = Array.isArray(lesson.course_modules) 
    ? lesson.course_modules[0] 
    : lesson.course_modules;
  const courseId = (courseModules as { course_id: string })?.course_id;

  if (!courseId) {
    throw new Error("Course ID not found");
  }

  // Update or create progress with 100% and completed_at
  const { data: existingProgress } = await supabase
    .from("user_course_progress")
    .select("id")
    .eq("user_id", authData.user.id)
    .eq("lesson_id", lessonId)
    .single();

  if (existingProgress) {
    const { error } = await supabase
      .from("user_course_progress")
      .update({
        progress_percentage: 100,
        completed_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingProgress.id);

    if (error) {
      throw new Error(`Failed to mark complete: ${error.message}`);
    }
  } else {
    const { error } = await supabase.from("user_course_progress").insert({
      user_id: authData.user.id,
      course_id: courseId,
      lesson_id: lessonId,
      progress_percentage: 100,
      completed_at: new Date().toISOString(),
      last_accessed_at: new Date().toISOString(),
    });

    if (error) {
      throw new Error(`Failed to mark complete: ${error.message}`);
    }
  }

  revalidatePath(`/app/courses/${courseId}/lessons/${lessonId}`);
  revalidatePath(`/app/courses/${courseId}`);
}


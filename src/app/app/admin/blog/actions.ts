'use server'

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const createPostSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
    excerpt: z.string().min(1, "Excerpt is required"),
    content: z.string().min(1, "Content is required"),
    featured_image_url: z.string().url("Invalid URL").optional().or(z.literal("")),
    is_published: z.string().optional(), // We'll look for "on"
});

export async function createPost(prevState: any, formData: FormData) {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "Unauthorized" };
    }

    // Check if admin
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
        return { error: "Unauthorized" };
    }

    const rawData = {
        title: formData.get("title"),
        slug: formData.get("slug"),
        excerpt: formData.get("excerpt"),
        content: formData.get("content"),
        featured_image_url: formData.get("featured_image_url"),
        is_published: formData.get("is_published"),
    };

    const validatedFields = createPostSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { title, slug, excerpt, content, featured_image_url, is_published } = validatedFields.data;

    const { error } = await supabase.from("blog_posts").insert({
        title,
        slug,
        excerpt,
        content,
        featured_image_url: featured_image_url || null,
        author_id: user.id,
        is_published: is_published === "on",
    });

    if (error) {
        console.error("Error creating post:", error);
        return { error: "Failed to create post. Slug might be taken." };
    }

    revalidatePath("/app/blog");
    redirect("/app/blog");
}

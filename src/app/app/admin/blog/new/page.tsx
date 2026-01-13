'use client'

import { useActionState, useState } from "react";
import { createPost } from "../actions";
import { useFormStatus } from "react-dom";
import Image from "next/image";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex w-full justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50 sm:ml-3 sm:w-auto"
        >
            {pending ? "Publishing..." : "Publish Post"}
        </button>
    );
}

export default function NewPostPage() {
    const [state, formAction] = useActionState(createPost, null);
    const [imageUrl, setImageUrl] = useState("");

    // Helper to safely get field errors since state.error can be a string or object
    const fieldErrors = (typeof state?.error === 'object' && state?.error !== null) ? state.error : {};

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
            <div className="border-b border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950 sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <h1 className="text-xl font-bold leading-tight text-zinc-900 dark:text-zinc-50">Create New Post</h1>
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <form action={formAction} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">

                        {/* Main Content Area */}
                        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Title</label>
                                <input
                                    name="title"
                                    type="text"
                                    required
                                    placeholder="Enter a captivating title"
                                    className="mt-1 block w-full rounded-md border border-zinc-300 px-4 py-3 text-lg font-medium shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                    onChange={(e) => {
                                        const slugInput = document.getElementsByName('slug')[0] as HTMLInputElement;
                                        if (!slugInput.value) {
                                            slugInput.value = e.target.value
                                                .toLowerCase()
                                                .replace(/[^a-z0-9]+/g, '-')
                                                .replace(/(^-|-$)+/g, '');
                                        }
                                    }}
                                />
                                {fieldErrors?.title && <p className="mt-1 text-sm text-red-600">{fieldErrors.title}</p>}
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Content</label>
                                <div className="mt-1 rounded-md border border-zinc-300 shadow-sm focus-within:ring-1 focus-within:ring-purple-500 dark:border-zinc-700 dark:bg-zinc-800">
                                    <div className="border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
                                        Markdown Supported
                                    </div>
                                    <textarea
                                        name="content"
                                        rows={20}
                                        required
                                        placeholder="Write your story here..."
                                        className="block w-full border-0 bg-transparent p-4 text-zinc-900 placeholder:text-zinc-400 focus:ring-0 dark:text-white"
                                    />
                                </div>
                                {fieldErrors?.content && <p className="mt-1 text-sm text-red-600">{fieldErrors.content}</p>}
                            </div>
                        </div>

                        {/* Excerpt Card */}
                        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Excerpt</label>
                            <p className="mb-2 text-xs text-zinc-500">A short summary displayed on the blog index page.</p>
                            <textarea
                                name="excerpt"
                                rows={3}
                                required
                                className="block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                            />
                            {fieldErrors?.excerpt && <p className="mt-1 text-sm text-red-600">{fieldErrors.excerpt}</p>}
                        </div>
                    </div>

                    <div className="space-y-6 lg:col-span-1">
                        {/* Publishing Card */}
                        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                            <h3 className="text-base font-semibold leading-6 text-zinc-900 dark:text-zinc-50">Publishing</h3>
                            <div className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Slug</label>
                                    <input
                                        name="slug"
                                        type="text"
                                        required
                                        className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                    />
                                    {fieldErrors?.slug && <p className="mt-1 text-sm text-red-600">{fieldErrors.slug}</p>}
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="is_published"
                                        id="is_published"
                                        className="h-4 w-4 rounded border-zinc-300 text-purple-600 focus:ring-purple-600 dark:border-zinc-700 dark:bg-zinc-800"
                                        defaultChecked
                                    />
                                    <label htmlFor="is_published" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Publish immediately</label>
                                </div>

                                <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
                                    <SubmitButton />
                                </div>
                            </div>
                        </div>

                        {/* Featured Image Card */}
                        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                            <h3 className="text-base font-semibold leading-6 text-zinc-900 dark:text-zinc-50">Featured Image</h3>
                            <div className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Image URL</label>
                                    <input
                                        name="featured_image_url"
                                        type="url"
                                        placeholder="https://..."
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                    />
                                </div>

                                <div className="relative aspect-video w-full overflow-hidden rounded-md border border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
                                    {imageUrl ? (
                                        <Image
                                            src={imageUrl}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                            onError={() => setImageUrl("")} // Reset on error
                                        />
                                    ) : (
                                        <div className="flex h-full w-full flex-col items-center justify-center text-zinc-400">
                                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="mt-2 text-xs">Enter URL to preview</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {typeof state?.error === 'string' && (
                        <div className="col-span-full rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            {state.error}
                        </div>
                    )}
                </form>
            </main>
        </div>
    );
}

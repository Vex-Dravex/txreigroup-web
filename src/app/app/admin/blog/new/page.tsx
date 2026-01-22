'use client'

import { useActionState, useState } from "react";
import { createPost } from "../actions";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import Link from "next/link";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] hover:from-purple-500 hover:to-indigo-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {pending ? (
                <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Publishing...</span>
                </>
            ) : (
                <>
                    <span>Publish Post</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </>
            )}
        </button>
    );
}

export default function NewPostPage() {
    const [state, formAction] = useActionState(createPost, null);
    const [imageUrl, setImageUrl] = useState("");

    // Helper to safely get field errors since state.error can be a string or object
    const fieldErrors = (typeof state?.error === 'object' && state?.error !== null) ? state.error : {};

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black selection:bg-purple-500/30">
            {/* Sticky Header */}
            <div className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 px-4 py-4 backdrop-blur-xl dark:border-zinc-800 dark:bg-black/80 sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-[1600px] items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/app/blog"
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-50"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Create New Post</h1>
                            <p className="hidden text-xs text-zinc-500 sm:block">Drafting a new investor insight</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="hidden rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 sm:block"
                        >
                            Cancel
                        </button>
                        {/* We could duplicate the submit button here ideally, but for now it's in the form */}
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
                <form action={formAction} className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Left Column: Content */}
                    <div className="space-y-6 lg:col-span-8">
                        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white/50 backdrop-blur-xl shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                                <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Post Content</h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">Title</label>
                                        <input
                                            name="title"
                                            type="text"
                                            required
                                            placeholder="Enter a captivating title..."
                                            className="mt-2 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-lg font-bold shadow-sm transition-all placeholder:text-zinc-400 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:bg-black"
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
                                        {fieldErrors?.title && <p className="mt-1 text-sm font-medium text-red-500">{fieldErrors.title}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
                                            Content <span className="text-xs font-normal text-zinc-400">(Markdown Supported)</span>
                                        </label>
                                        <div className="mt-2 overflow-hidden rounded-xl border border-zinc-200 bg-white/50 backdrop-blur-xl shadow-sm focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-500/10 dark:border-zinc-700 dark:bg-zinc-800">
                                            <textarea
                                                name="content"
                                                rows={25}
                                                required
                                                placeholder="# Write your amazing story here..."
                                                className="block w-full border-0 bg-transparent p-4 font-mono text-sm leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:ring-0 dark:text-zinc-300"
                                            />
                                        </div>
                                        {fieldErrors?.content && <p className="mt-1 text-sm font-medium text-red-500">{fieldErrors.content}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white/50 backdrop-blur-xl shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                                <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Excerpt</h2>
                            </div>
                            <div className="p-6">
                                <label className="mb-2 block text-sm font-bold text-zinc-700 dark:text-zinc-300">Short Summary</label>
                                <p className="mb-3 text-xs text-zinc-500">This text will be displayed on the blog index page card.</p>
                                <textarea
                                    name="excerpt"
                                    rows={3}
                                    required
                                    className="block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm shadow-sm transition-all focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:bg-black"
                                />
                                {fieldErrors?.excerpt && <p className="mt-1 text-sm font-medium text-red-500">{fieldErrors.excerpt}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Settings & Meta */}
                    <div className="space-y-6 lg:col-span-4">
                        <div className="sticky top-24 space-y-6">
                            {/* Publishing Card */}
                            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white/50 backdrop-blur-xl shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                                    <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Publish Settings</h2>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">URL Slug</label>
                                        <input
                                            name="slug"
                                            type="text"
                                            required
                                            className="mt-2 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-mono text-zinc-600 shadow-sm transition-all focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:focus:bg-black"
                                        />
                                        {fieldErrors?.slug && <p className="mt-1 text-sm font-medium text-red-500">{fieldErrors.slug}</p>}
                                    </div>

                                    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
                                        <input
                                            type="checkbox"
                                            name="is_published"
                                            id="is_published"
                                            className="h-5 w-5 rounded border-zinc-300 text-purple-600 focus:ring-purple-600 dark:border-zinc-600 dark:bg-zinc-700"
                                            defaultChecked
                                        />
                                        <label htmlFor="is_published" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 select-none cursor-pointer">Publish immediately</label>
                                    </div>

                                    <SubmitButton />
                                </div>
                            </div>

                            {/* Featured Image Card */}
                            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white/50 backdrop-blur-xl shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                                    <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Featured Image</h2>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">Image URL</label>
                                        <input
                                            name="featured_image_url"
                                            type="url"
                                            placeholder="https://..."
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            className="mt-2 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm shadow-sm transition-all focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:bg-black"
                                        />
                                    </div>

                                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-black/50">
                                        {imageUrl ? (
                                            <Image
                                                src={imageUrl}
                                                alt="Preview"
                                                fill
                                                className="object-cover transition-opacity duration-300"
                                                onError={() => setImageUrl("")} // Reset on error
                                            />
                                        ) : (
                                            <div className="flex h-full w-full flex-col items-center justify-center text-zinc-400">
                                                <svg className="h-8 w-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className="mt-2 text-xs font-medium">Enter URL to preview</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {typeof state?.error === 'string' && (
                        <div className="col-span-full rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                            Error: {state.error}
                        </div>
                    )}
                </form>
            </main>
        </div>
    );
}

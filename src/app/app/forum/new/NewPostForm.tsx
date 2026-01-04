"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPost } from "../actions";
import { FORUM_TOPICS } from "../topics";

export default function NewPostForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState(FORUM_TOPICS[0].slug);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [mentions, setMentions] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setContent(text);

    // Extract hashtags (#tag)
    const hashtagMatches = text.match(/#\w+/g) || [];
    setHashtags([...new Set(hashtagMatches.map((tag) => tag.substring(1)))]);

    // Extract mentions (@username)
    const mentionMatches = text.match(/@\w+/g) || [];
    setMentions([...new Set(mentionMatches.map((mention) => mention.substring(1)))]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(files);
      
      // Create previews
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("topic", topic);
      formData.append("hashtags", JSON.stringify(hashtags));
      formData.append("mentions", JSON.stringify(mentions));
      
      images.forEach((image) => {
        formData.append("images", image);
      });

      await createPost(formData);
      router.push("/app/forum");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          placeholder="Enter post title..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Topic
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          {FORUM_TOPICS.map((forumTopic) => (
            <button
              type="button"
              key={forumTopic.slug}
              onClick={() => setTopic(forumTopic.slug)}
              className={`flex items-start gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                topic === forumTopic.slug
                  ? "border-blue-500 bg-blue-50 text-blue-900 dark:border-blue-500 dark:bg-blue-900/30 dark:text-blue-100"
                  : "border-zinc-300 bg-white text-zinc-800 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              }`}
            >
              <div
                className={`mt-1 h-2 w-2 rounded-full ${
                  topic === forumTopic.slug ? "bg-blue-500" : "bg-zinc-300 dark:bg-zinc-700"
                }`}
              />
              <div>
                <div className="font-medium">{forumTopic.label}</div>
                {forumTopic.description && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{forumTopic.description}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={handleContentChange}
          required
          rows={10}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          placeholder="Write your post... Use #hashtags for keywords and @username to mention users"
        />
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Tip: Use #hashtags for keywords and @username to mention other users
        </p>
      </div>

      {/* Hashtags Preview */}
      {hashtags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Hashtags
          </label>
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag, idx) => (
              <span
                key={idx}
                className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Mentions Preview */}
      {mentions.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Mentions
          </label>
          <div className="flex flex-wrap gap-2">
            {mentions.map((mention, idx) => (
              <span
                key={idx}
                className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
              >
                @{mention}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Image Upload */}
      <div>
        <label htmlFor="images" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Images (optional)
        </label>
        <input
          id="images"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
        
        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            {imagePreviews.map((preview, idx) => (
              <div key={idx} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-32 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 rounded-full bg-red-500 text-white p-1 hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          {loading ? "Posting..." : "Create Post"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

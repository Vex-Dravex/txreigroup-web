"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createPost } from "../actions";
import { FORUM_TOPICS } from "../topics";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut" as any,
    },
  },
};

const topicColors: Record<string, string> = {
  "creative-finance": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  "subto": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  "wholesale": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  "private-lending": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  "deal-structuring": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 border-pink-200 dark:border-pink-800",
};

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formatting helpers
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
      const newImages = [...images, ...files];
      setImages(newImages);

      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...newPreviews]);
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
      setLoading(false);
    }
  };

  return (
    <motion.form
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {/* Topic Section */}
      <motion.div variants={itemVariants} className="space-y-3">
        <label className="text-sm font-bold text-zinc-900 dark:text-zinc-100 ml-1">
          Select a Topic
        </label>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FORUM_TOPICS.map((forumTopic) => {
            const isSelected = topic === forumTopic.slug;
            const colorClass = topicColors[forumTopic.slug] || "bg-zinc-100 text-zinc-700 border-zinc-200";

            return (
              <div
                key={forumTopic.slug}
                onClick={() => setTopic(forumTopic.slug)}
                className={`relative cursor-pointer rounded-xl border p-4 transition-all duration-200 hover:shadow-md ${isSelected
                  ? `ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-black ${colorClass}`
                  : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-800"
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? "opacity-100" : "text-zinc-500 dark:text-zinc-400"}`}>
                    {forumTopic.label}
                  </span>
                  {isSelected && (
                    <motion.div
                      layoutId="check"
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </motion.div>
                  )}
                </div>
                <p className={`text-sm leading-snug ${isSelected ? "opacity-90" : "text-zinc-500 dark:text-zinc-400"}`}>
                  {forumTopic.description}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Main Content Fields */}
      <motion.div variants={itemVariants} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-bold text-zinc-900 dark:text-zinc-100 ml-1">
            Post Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-50 dark:focus:bg-black dark:focus:border-blue-500"
            placeholder="Give your post a clear, engaging title..."
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-bold text-zinc-900 dark:text-zinc-100 ml-1">
            Content
          </label>
          <div className="relative">
            <textarea
              id="content"
              value={content}
              onChange={handleContentChange}
              required
              rows={12}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-50 dark:focus:bg-black dark:focus:border-blue-500 resize-y"
              placeholder="What's on your mind? Share your deal structure, ask for advice, or post an update..."
            />
            {/* Helper Text / Counters */}
            <div className="absolute bottom-3 right-3 flex items-center gap-3">
              <span className="text-xs font-medium text-zinc-400 bg-white/50 dark:bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm">
                {content.length} chars
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 px-1">
            {/* Dynamic Hashtag Preview */}
            <AnimatePresence>
              {hashtags.length > 0 && (
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-xs font-medium text-zinc-400">Tags:</span>
                  <div className="flex flex-wrap gap-1">
                    {hashtags.map((tag) => (
                      <motion.span
                        key={tag}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-0.5 rounded-full"
                      >
                        #{tag}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Media Upload */}
      <motion.div variants={itemVariants} className="space-y-3">
        <label className="text-sm font-bold text-zinc-900 dark:text-zinc-100 ml-1">
          Add Media
        </label>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 py-10 text-center hover:border-blue-500 hover:bg-blue-50/50 dark:border-zinc-700 dark:bg-zinc-900/30 dark:hover:border-blue-500 dark:hover:bg-blue-900/10 transition-all duration-200"
        >
          <div className="mb-3 rounded-full bg-zinc-100 p-4 group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300 dark:bg-zinc-800 dark:group-hover:bg-blue-900/30">
            <svg className="h-6 w-6 text-zinc-400 group-hover:text-blue-600 dark:text-zinc-500 dark:group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-blue-700 dark:group-hover:text-blue-400">
            Click to upload images
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
            SVG, PNG, JPG or GIF (max. 5MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        {/* Preview Grid */}
        <AnimatePresence>
          {imagePreviews.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 pt-4"
            >
              {imagePreviews.map((preview, idx) => (
                <motion.div
                  key={idx}
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="group relative aspect-video overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700"
                >
                  <img
                    src={preview}
                    alt={`Preview ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(idx);
                    }}
                    className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-lg transition-all hover:scale-110 group-hover:opacity-100"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100 dark:bg-red-900/10 dark:border-red-900/20 dark:text-red-400"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <motion.div variants={itemVariants} className="flex items-center gap-4 border-t border-zinc-100 pt-6 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl px-6 py-2.5 text-sm font-bold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !title.trim() || !content.trim()}
          className="ml-auto flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 hover:from-blue-500 hover:to-indigo-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>Posting...</span>
            </>
          ) : (
            <>
              <span>Post to Forum</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </>
          )}
        </button>
      </motion.div>
    </motion.form>
  );
}

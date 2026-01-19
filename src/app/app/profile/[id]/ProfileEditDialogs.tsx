"use client";

import { useState, useEffect } from "react";
import { updateProfile } from "./actions";
import { motion, Reorder } from "framer-motion";
import Image from "next/image";

type EditProps = {
  profileId: string;
  currentUrl: string | null;
};

export function ProfileEditAvatar({ profileId, currentUrl }: EditProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="absolute -right-3 -bottom-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-white shadow transition-transform duration-200 hover:-translate-y-0.5 hover:scale-105 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
        aria-label="Edit profile photo"
      >
        <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-950">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Update Profile Photo</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-sm font-semibold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Close
              </button>
            </div>
            <form action={updateProfile.bind(null, profileId)} encType="multipart/form-data" className="space-y-4">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">Drag & drop an image</span>
                <span className="mt-1 text-xs">or click to upload</span>
                <input name="avatarFile" type="file" accept="image/*" className="hidden" />
              </label>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="avatarUrl">
                  Or paste image URL
                </label>
                <input
                  id="avatarUrl"
                  name="avatarUrl"
                  type="url"
                  placeholder="https://..."
                  defaultValue={currentUrl || ""}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                Save Photo
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function ProfileEditBanner({ profileId, currentUrl }: EditProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-zinc-800 shadow hover:bg-white dark:bg-zinc-900/80 dark:text-zinc-100"
      >
        Edit Banner
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-950">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Update Banner Image</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-sm font-semibold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Close
              </button>
            </div>
            <form action={updateProfile.bind(null, profileId)} encType="multipart/form-data" className="space-y-4">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">Drag & drop an image</span>
                <span className="mt-1 text-xs">or click to upload</span>
                <input name="bannerFile" type="file" accept="image/*" className="hidden" />
              </label>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="bannerUrl">
                  Or paste image URL
                </label>
                <input
                  id="bannerUrl"
                  name="bannerUrl"
                  type="url"
                  placeholder="https://..."
                  defaultValue={currentUrl || ""}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                Save Banner
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function ProfileEditBio({ profileId, currentBio }: { profileId: string; currentBio: string | null }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
      >
        Edit Bio
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-950">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Update Bio</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-sm font-semibold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Close
              </button>
            </div>
            <form action={updateProfile.bind(null, profileId)} className="space-y-4">
              <textarea
                name="bio"
                rows={5}
                defaultValue={currentBio || ""}
                placeholder="Share your background, markets, and focus areas..."
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
              <button
                type="submit"
                className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                Save Bio
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// --- Image Uploader Component ---
type ImageItem = {
  id: string;
  url: string;
  file?: File;
  type: "existing" | "new";
};

function ImageUploader({
  initialImages = [],
  onChange,
}: {
  initialImages?: string[];
  onChange: (items: ImageItem[]) => void;
}) {
  const [items, setItems] = useState<ImageItem[]>([]);

  useEffect(() => {
    if (items.length === 0 && initialImages.length > 0) {
      const initialItems: ImageItem[] = initialImages.map((url) => ({
        id: url, // Use URL as ID for existing
        url,
        type: "existing",
      }));
      setItems(initialItems);
      onChange(initialItems);
    }
  }, [initialImages]); // Run once on mount/change

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newItems: ImageItem[] = Array.from(files).map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file), // Preview URL
      file,
      type: "new",
    }));

    const updated = [...items, ...newItems];
    setItems(updated);
    onChange(updated);
  };

  const handleRemove = (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    onChange(updated);
  };

  const handleReorder = (newOrder: ImageItem[]) => {
    setItems(newOrder);
    onChange(newOrder);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Photos</label>

        {items.length > 0 && (
          <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-2">
            {items.map((item) => (
              <Reorder.Item key={item.id} value={item} className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-zinc-900 cursor-grab active:cursor-grabbing">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-zinc-200 dark:bg-zinc-800 relative">
                  <img src={item.url} alt="Preview" className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs text-zinc-500">{item.file ? item.file.name : "Existing Image"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => handleRemove(item.id)} className="p-1 text-zinc-400 hover:text-red-500">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                  <div className="p-1 text-zinc-300">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                  </div>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 transition-colors">
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">Add Photos</span>
          <span className="mt-1 text-xs">Drag & drop or click to upload</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>
    </div>
  );
}

export function CreateShowcasePostDialog({ profileId }: { profileId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<ImageItem[]>([]);

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setIsOpen(true)}
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Post to Showcase
      </motion.button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-950">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Create Showcase Post</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-sm font-semibold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Close
              </button>
            </div>
            <form action={async (formData) => {
              const { createPortfolioItem } = await import("./actions");

              // Append files manually in correct order
              formData.delete("images");
              const files = items.filter(i => i.type === 'new').map(i => i.file!);
              if (files.length === 0) return; // Or show error

              files.forEach(f => formData.append("images", f));

              await createPortfolioItem(profileId, formData);
              setIsOpen(false);
              setItems([]); // Reset
            }} className="space-y-4">

              <ImageUploader onChange={setItems} />

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="category">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  defaultValue=""
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  required
                >
                  <option value="" disabled>Select a category</option>
                  <option value="renovation_showcase">Renovation Showcase</option>
                  <option value="before_after">Before & After</option>
                  <option value="project_update">Project Update</option>
                  <option value="completed_deal">Completed Deal</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="caption">
                  Caption
                </label>
                <textarea
                  id="caption"
                  name="caption"
                  rows={3}
                  placeholder="Tell us about this project..."
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                Post to Showcase
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function EditShowcasePostDialog({
  item,
  profileId,
  open,
  onOpenChange
}: {
  item: any;
  profileId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [items, setItems] = useState<ImageItem[]>([]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-950">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Edit Showcase Post</h3>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-sm font-semibold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Close
          </button>
        </div>
        <form action={async (formData) => {
          const { updatePortfolioItem } = await import("./actions");

          // Construct payload
          const newFiles = items.filter(i => i.type === 'new').map(i => i.file!);
          const imageOrder = items.map(i => {
            if (i.type === 'existing') return `existing:${i.url}`;
            // For new files, we need their index in the newFiles array
            const index = newFiles.indexOf(i.file!);
            return `new:${index}`;
          });

          formData.set("imageOrder", JSON.stringify(imageOrder));

          // Clean and set images
          formData.delete("images");
          newFiles.forEach(f => formData.append("images", f));
          // Remove legacy hidden input if present
          formData.delete("existingImages");

          await updatePortfolioItem(profileId, item.id, formData);
          onOpenChange(false);
        }} className="space-y-4">

          <ImageUploader
            initialImages={item.images || [item.image_url]}
            onChange={setItems}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              name="category"
              defaultValue={item.category}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              required
            >
              <option value="" disabled>Select a category</option>
              <option value="renovation_showcase">Renovation Showcase</option>
              <option value="before_after">Before & After</option>
              <option value="project_update">Project Update</option>
              <option value="completed_deal">Completed Deal</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="caption">
              Caption
            </label>
            <textarea
              id="caption"
              name="caption"
              rows={3}
              defaultValue={item.caption || ""}
              placeholder="Tell us about this project..."
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-950">
        <h3 className="mb-2 text-lg font-bold text-zinc-900 dark:text-zinc-50">Delete Post?</h3>
        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
          This action cannot be undone. Are you sure you want to delete this post?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

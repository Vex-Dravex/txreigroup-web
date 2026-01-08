"use client";

import { useState } from "react";
import { updateProfile } from "./actions";

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

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type ProfileMenuProps = {
  avatarUrl: string | null;
  displayName: string | null;
  email: string | null;
};

export default function ProfileMenu({ avatarUrl, displayName, email }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : email
      ? email[0].toUpperCase()
      : "U";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-medium text-sm hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
        aria-label="Profile menu"
        aria-expanded={isOpen}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName || "Profile"}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-zinc-950 ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {displayName && (
              <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{displayName}</p>
                {email && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{email}</p>
                )}
              </div>
            )}
            <Link
              href="/app"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Dashboard
            </Link>
            <Link
              href="/app/profile"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              My Profile
            </Link>
            <Link
              href="/app/account"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Account
            </Link>
            <Link
              href="/app/support"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Support
            </Link>
            <div className="border-t border-zinc-200 dark:border-zinc-800">
              <form action="/logout" method="POST">
                <button
                  type="submit"
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

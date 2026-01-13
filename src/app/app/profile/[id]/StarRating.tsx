"use client";

import { useState } from "react";

type StarRatingProps = {
    name: string;
    defaultValue?: number;
    required?: boolean;
    readonly?: boolean;
    size?: "sm" | "md" | "lg";
};

export function StarRating({ name, defaultValue = 0, required = false, readonly = false, size = "md" }: StarRatingProps) {
    const [rating, setRating] = useState(defaultValue);
    const [hoverRating, setHoverRating] = useState(0);

    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
    };

    const starSize = sizeClasses[size];
    const displayRating = readonly ? rating : (hoverRating || rating);

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onClick={() => !readonly && setRating(star)}
                    onMouseEnter={() => !readonly && setHoverRating(star)}
                    onMouseLeave={() => !readonly && setHoverRating(0)}
                    className={`${readonly ? "cursor-default" : "cursor-pointer transition-transform hover:scale-110"} focus:outline-none`}
                    aria-label={`Rate ${star} stars`}
                >
                    <svg
                        className={`${starSize} ${star <= displayRating
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700"
                            }`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                        />
                    </svg>
                </button>
            ))}
            {!readonly && (
                <input
                    type="hidden"
                    name={name}
                    value={rating}
                    required={required}
                />
            )}
            {!readonly && rating > 0 && (
                <span className="ml-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {rating} {rating === 1 ? "star" : "stars"}
                </span>
            )}
        </div>
    );
}

type StarDisplayProps = {
    rating: number;
    size?: "sm" | "md" | "lg";
    showCount?: boolean;
};

export function StarDisplay({ rating, size = "sm", showCount = false }: StarDisplayProps) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
    };

    const starSize = sizeClasses[size];

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={`${starSize} ${star <= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700"
                        }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                    />
                </svg>
            ))}
            {showCount && (
                <span className="ml-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
}

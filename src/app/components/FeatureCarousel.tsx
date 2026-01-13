'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface FeatureSlide {
  id: number;
  title: string;
  description: string;
  image: string;
  category: 'investors' | 'wholesalers' | 'vendors' | 'transaction-services';
}

const features: FeatureSlide[] = [
  {
    id: 1,
    title: 'Off Market MLS',
    description: 'Access exclusive wholesale deals vetted by our team. Browse verified properties with detailed analytics, insurance estimates, and comprehensive property information.',
    image: '/off-market-mls.png',
    category: 'investors',
  },
  {
    id: 2,
    title: 'Vendor Marketplace',
    description: 'Connect with verified contractors and vendors. Find trusted professionals for your investment projects with detailed portfolios and verification status.',
    image: '/vendor-page.png',
    category: 'vendors',
  },
  {
    id: 3,
    title: 'Deal Submission',
    description: 'Wholesalers can easily submit deals for approval. Streamlined process with automated insurance estimates and comprehensive deal management tools.',
    image: '/deal-submission-page.png',
    category: 'wholesalers',
  },
  {
    id: 4,
    title: 'Education Center',
    description: 'Comprehensive courses and lessons to advance your real estate investing knowledge. Track your progress and learn from industry experts.',
    image: '/screenshots/courses.png', // Placeholder - user needs to add actual screenshot
    category: 'investors',
  },
  {
    id: 5,
    title: 'Community Forum',
    description: 'Engage with the community through discussions, share insights, and network with other investors, wholesalers, and vendors in the industry.',
    image: '/screenshots/forum.png', // Placeholder - user needs to add actual screenshot
    category: 'investors',
  },
  {
    id: 6,
    title: 'Transaction Services',
    description: 'Comprehensive transaction management tools for all your real estate investment needs. Streamline your workflow and manage deals efficiently.',
    image: '/screenshots/transactions.png', // Placeholder - user needs to add actual screenshot
    category: 'transaction-services',
  },
];

export default function FeatureCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length);
    }, 10000); // Change slide every 10 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume autoplay after manual navigation
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % features.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const currentFeature = features[currentIndex];

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-950">
        {/* Slide Content */}
        <div className="relative aspect-video w-full">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {features.map((feature) => (
              <div
                key={feature.id}
                className="min-w-full flex-shrink-0"
              >
                <div className="grid h-full grid-cols-1 gap-8 p-8 md:grid-cols-2 md:p-12">
                  {/* Image Side */}
                  <div className="relative flex items-center justify-center overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
                    <div className="relative h-full w-full min-h-[300px]">
                      {feature.image.startsWith('/screenshots/') ? (
                        /* Placeholder for screenshot - user should replace with actual images */
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900">
                          <div className="text-center">
                            <svg
                              className="mx-auto h-24 w-24 text-zinc-400 dark:text-zinc-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                              Screenshot: {feature.title}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <Image
                          src={feature.image}
                          alt={feature.title}
                          fill
                          className="object-contain"
                        />
                      )}
                    </div>
                  </div>

                  {/* Text Side */}
                  <div className="flex flex-col justify-center space-y-4">
                    <div className="inline-flex w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {feature.category.replace('-', ' ')}
                    </div>
                    <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                      {feature.title}
                    </h3>
                    <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg transition-all hover:bg-white hover:scale-110 dark:bg-zinc-800/90 dark:hover:bg-zinc-800"
          aria-label="Previous slide"
        >
          <svg
            className="h-6 w-6 text-zinc-900 dark:text-zinc-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg transition-all hover:bg-white hover:scale-110 dark:bg-zinc-800/90 dark:hover:bg-zinc-800"
          aria-label="Next slide"
        >
          <svg
            className="h-6 w-6 text-zinc-900 dark:text-zinc-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${index === currentIndex
                ? 'w-8 bg-zinc-900 dark:bg-zinc-50'
                : 'w-2 bg-zinc-400 hover:bg-zinc-600 dark:bg-zinc-600 dark:hover:bg-zinc-400'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


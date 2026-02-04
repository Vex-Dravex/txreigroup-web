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
    title: 'Creative Marketplace',
    description: 'Access exclusive wholesale deals vetted by our team. Browse verified properties with detailed analytics, insurance estimates, and comprehensive property information.',
    image: '/creative marketplace ss.png',
    category: 'investors',
  },
  {
    id: 2,
    title: 'Vendor Marketplace',
    description: 'Connect with verified contractors and vendors. Find trusted professionals for your investment projects with detailed portfolios and verification status.',
    image: '/Vendors marketplace ss.png',
    category: 'vendors',
  },
  {
    id: 3,
    title: 'Deal Submission',
    description: 'Submit your wholesale deals and let our professional disposition team handle the sale on our exclusive marketplace. Spend less time finding buyers and more time locking up your next big deal.',
    image: '/Deal Submission page ss.png',
    category: 'wholesalers',
  },
  {
    id: 4,
    title: 'Transaction Services',
    description: 'Partner with our verified Title, Escrow, and Funding partners to streamline the closing process on your creative finance deals and ensure a seamless transaction for every party involved.',
    image: '/TransAction Services ss.png',
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
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white shadow-xl dark:bg-zinc-950/40 backdrop-blur-md">
        {/* Slide Content */}
        <div className="relative w-full min-h-[550px] md:min-h-[500px]">
          <div
            className="flex h-full transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1)"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {features.map((feature) => (
              <div
                key={feature.id}
                className="min-w-full flex-shrink-0"
              >
                <div className="flex flex-col items-center justify-center h-full gap-4 px-3 py-6 md:p-12 text-center">
                  {/* Category Badge */}
                  <div className="inline-flex rounded-lg bg-blue-500/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    {feature.category.replace('-', ' ')}
                  </div>

                  {/* Text Header */}
                  <h3 className="text-xl md:text-3xl font-black tracking-tighter text-zinc-950 dark:text-zinc-50 font-syne leading-none px-2">
                    {feature.title}
                  </h3>

                  <div className="relative w-full max-w-sm md:max-w-2xl group/slide-img">
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                      <img
                        src={`${feature.image}?v=5`}
                        alt={feature.title}
                        className="h-full w-full object-contain transition-transform duration-1000 group-hover/slide-img:scale-105"
                      />
                    </div>
                  </div>

                  {/* Description Box - Text wrapping fixed */}
                  <p className="w-full max-w-[320px] md:max-w-2xl mx-auto text-sm md:text-base leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium whitespace-normal">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 md:p-3 shadow-lg transition-all hover:bg-white hover:scale-110 dark:bg-zinc-800/90 dark:hover:bg-zinc-800 z-10"
          aria-label="Previous slide"
        >
          <svg
            className="h-4 w-4 md:h-6 md:w-6 text-zinc-900 dark:text-zinc-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={goToNext}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 md:p-3 shadow-lg transition-all hover:bg-white hover:scale-110 dark:bg-zinc-800/90 dark:hover:bg-zinc-800 z-10"
          aria-label="Next slide"
        >
          <svg
            className="h-4 w-4 md:h-6 md:w-6 text-zinc-900 dark:text-zinc-50"
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


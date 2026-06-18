import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Instagram } from 'lucide-react';
import { StoryHighlight } from '../lib/api';

interface InstagramStoriesProps {
  stories: StoryHighlight[];
  loading?: boolean;
  className?: string;
}

/**
 * Instagram Stories/Highlights Component
 * Displays a responsive carousel of Instagram story highlights
 */
export function InstagramStories({
  stories,
  loading = false,
  className = '',
}: InstagramStoriesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Responsive items per page
  const getItemsPerPage = () => {
    if (typeof window === 'undefined') return 6;
    const width = window.innerWidth;
    if (width < 640) return 3; // mobile
    if (width < 1024) return 4; // tablet
    return 6; // desktop
  };

  const [itemsPerPage] = React.useState(getItemsPerPage());

  const maxIndex = Math.max(0, stories.length - itemsPerPage);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const visibleStories = stories.slice(currentIndex, currentIndex + itemsPerPage);

  // Loading skeleton
  if (loading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (stories.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex flex-col items-center justify-center py-8 px-4 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-pink-100 dark:border-gray-700">
          <Instagram className="w-12 h-12 text-pink-400 mb-3" />
          <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
            Siga nosso Instagram
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
            Confira as últimas novidades, dicas e momentos da nossa comunidade
          </p>
          <a
            href="https://instagram.com/espalhemelodiasoficial"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
          >
            <Instagram className="w-4 h-4" />
            Siga agora
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="relative">
        {/* Main Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {visibleStories.map((story) => (
            <a
              key={story.id}
              href={story.link || '#'}
              className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <img
                src={story.image_url}
                alt={story.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                <span className="text-white text-sm font-medium">{story.title}</span>
              </div>
            </a>
          ))}
        </div>

        {/* Navigation Arrows (shown if more stories exist) */}
        {stories.length > itemsPerPage && (
          <>
            {currentIndex > 0 && (
              <button
                onClick={handlePrev}
                className="absolute -left-4 sm:-left-5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-10"
                aria-label="Previous stories"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {currentIndex < maxIndex && (
              <button
                onClick={handleNext}
                className="absolute -right-4 sm:-right-5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-10"
                aria-label="Next stories"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Pagination Indicators */}
      {stories.length > itemsPerPage && (
        <div className="flex items-center justify-center gap-1 mt-4">
          {Array.from({ length: Math.ceil(stories.length / itemsPerPage) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i * itemsPerPage)}
              className={`h-2 rounded-full transition-all ${
                i === Math.floor(currentIndex / itemsPerPage)
                  ? 'w-6 bg-pink-500'
                  : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Instagram className="w-5 h-5 text-pink-500" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Siga{' '}
          <a
            href="https://instagram.com/espalhemelodiasoficial"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-pink-600 dark:text-pink-400 hover:underline"
          >
            @espalhemelodiasoficial
          </a>
          {' '}para mais histórias
        </p>
      </div>
    </div>
  );
}

export default InstagramStories;

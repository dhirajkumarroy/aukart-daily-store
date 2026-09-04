import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export default function CategoryFilter({ categories = [], activeCategory = "all" }) {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScrollability = () => {
    const el = scrollContainerRef.current;
    if (el) {
      const hasOverflow = el.scrollWidth > el.clientWidth;
      setShowLeftArrow(el.scrollLeft > 10);
      setShowRightArrow(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, [categories]);

  // Scroll active item into view smoothly on mount or activeCategory change
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      const activeElement = el.querySelector('[data-active="true"]');
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
    checkScrollability();
  }, [activeCategory, categories]);

  const scroll = (direction) => {
    const el = scrollContainerRef.current;
    if (el) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScrollability, 300);
    }
  };

  return (
    <div className="relative max-w-7xl mx-auto py-2.5 px-4 sm:px-6 lg:px-8">
      {/* Left Scroll Button */}
      {showLeftArrow && (
        <button
          type="button"
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/95 border border-neutral-200/80 shadow-md flex items-center justify-center text-neutral-600 hover:text-neutral-950 hover:scale-105 transition-all cursor-pointer backdrop-blur-sm"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Categories Scrollable Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollability}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1 justify-start sm:justify-center"
      >
        {/* All Products Pill */}
        <Link
          to="/"
          data-active={activeCategory.toLowerCase() === 'all'}
          className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full tracking-wide transition-all duration-200 cursor-pointer ${
            activeCategory.toLowerCase() === "all"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 ring-2 ring-emerald-600/30 scale-[1.02]"
              : "bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 border border-neutral-200/80 hover:border-neutral-300"
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 ${activeCategory.toLowerCase() === "all" ? "text-white" : "text-emerald-600"}`} />
          <span>All Products</span>
        </Link>

        {/* Dynamic Category Pills */}
        {categories.map((category) => {
          const isActive = activeCategory.toLowerCase() === category.name.toLowerCase();
          return (
            <Link
              key={category.id}
              to={`/category/${category.name.toLowerCase()}`}
              data-active={isActive}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full tracking-wide transition-all duration-200 cursor-pointer capitalize whitespace-nowrap ${
                isActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 ring-2 ring-emerald-600/30 scale-[1.02]"
                  : "bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 border border-neutral-200/80 hover:border-neutral-300"
              }`}
            >
              <span>{category.name}</span>
              {category.subcategories?.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                  isActive ? "bg-emerald-700/80 text-white" : "bg-neutral-100 text-neutral-500"
                }`}>
                  {category.subcategories.length}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Right Scroll Button */}
      {showRightArrow && (
        <button
          type="button"
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/95 border border-neutral-200/80 shadow-md flex items-center justify-center text-neutral-600 hover:text-neutral-950 hover:scale-105 transition-all cursor-pointer backdrop-blur-sm"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}


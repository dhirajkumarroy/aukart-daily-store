import React, { useState, useEffect, useRef } from 'react';
import { Flame, Sparkles, Tag, ShoppingBag, X, Zap, TrendingUp, Star, Gift, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchPriceSegments } from '../utils/api';

function getIconForFragment(title, maxPrice) {
  const lower = (title || '').toLowerCase();
  if (lower.includes('trend')) return TrendingUp;
  if (lower.includes('top deal') || lower.includes('deal') || lower.includes('steal')) return Flame;
  if (lower.includes('rated') || lower.includes('best') || lower.includes('star')) return Star;
  if (lower.includes('new') || lower.includes('fresh')) return Sparkles;
  if (lower.includes('gift')) return Gift;
  if (maxPrice && maxPrice > 0) return Zap;
  return Tag;
}

const PALETTES = [
  {
    bg: 'bg-amber-50/90 hover:bg-amber-100/90 text-amber-950 border-amber-200/80',
    activeBg: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20 border-orange-400',
    badge: 'bg-amber-500 text-white',
    activeBadge: 'bg-white/20 text-white',
    iconColor: 'text-amber-600'
  },
  {
    bg: 'bg-rose-50/90 hover:bg-rose-100/90 text-rose-950 border-rose-200/80',
    activeBg: 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/20 border-rose-400',
    badge: 'bg-rose-500 text-white',
    activeBadge: 'bg-white/20 text-white',
    iconColor: 'text-rose-600'
  },
  {
    bg: 'bg-emerald-50/90 hover:bg-emerald-100/90 text-emerald-950 border-emerald-200/80',
    activeBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 border-emerald-500',
    badge: 'bg-emerald-600 text-white',
    activeBadge: 'bg-white/20 text-white',
    iconColor: 'text-emerald-600'
  },
  {
    bg: 'bg-blue-50/90 hover:bg-blue-100/90 text-blue-950 border-blue-200/80',
    activeBg: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20 border-blue-500',
    badge: 'bg-blue-600 text-white',
    activeBadge: 'bg-white/20 text-white',
    iconColor: 'text-blue-600'
  },
  {
    bg: 'bg-purple-50/90 hover:bg-purple-100/90 text-purple-950 border-purple-200/80',
    activeBg: 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md shadow-purple-600/20 border-purple-500',
    badge: 'bg-purple-600 text-white',
    activeBadge: 'bg-white/20 text-white',
    iconColor: 'text-purple-600'
  }
];

export default function BudgetStore({ activeFilter, onSelectFragment }) {
  const [fragments, setFragments] = useState([]);
  const [loading, setLoading] = useState(true);
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
    async function loadFragments() {
      try {
        const data = await fetchPriceSegments();
        setFragments(data);
      } catch (err) {
        console.error('Error fetching dynamic deal fragments:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFragments();
  }, []);

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, [fragments]);

  const scroll = (direction) => {
    const el = scrollContainerRef.current;
    if (el) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScrollability, 300);
    }
  };

  if (!loading && fragments.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-b from-neutral-50/70 to-white border-b border-neutral-100/80 py-3.5 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto relative flex items-center">
        
        {/* Left Scroll Arrow */}
        {showLeftArrow && (
          <button
            type="button"
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/95 border border-neutral-200/80 shadow-md flex items-center justify-center text-neutral-600 hover:text-neutral-950 hover:scale-105 transition-all cursor-pointer backdrop-blur-sm"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Horizontal Chips Scroll Container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollability}
          className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 w-full"
        >
          {/* Quick All Deals Tab */}
          <button
            onClick={() => onSelectFragment(null)}
            className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border ${
              !activeFilter
                ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                : 'bg-white text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 border-neutral-200'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${!activeFilter ? 'text-amber-400' : 'text-neutral-400'}`} />
            <span>All Deals</span>
          </button>

          {/* Dynamic Deal Chips */}
          {fragments.map((fragment, index) => {
            const theme = PALETTES[index % PALETTES.length];
            const Icon = getIconForFragment(fragment.title, fragment.maxPrice);

            // Determine if this chip is currently selected
            const isSelected = activeFilter && (
              (activeFilter.id === fragment.id) ||
              (activeFilter.label === fragment.title) ||
              (fragment.maxPrice > 0 && activeFilter.label === `Under ₹${fragment.maxPrice}`)
            );

            return (
              <button
                key={fragment.id}
                onClick={() => {
                  if (isSelected) {
                    onSelectFragment(null); // toggle off
                  } else {
                    let queryType = 'price';
                    let queryValue = fragment.maxPrice;
                    const lowerTitle = (fragment.title || '').toLowerCase();

                    if (lowerTitle.includes('top deal') || lowerTitle.includes('discount')) {
                      queryType = 'collection';
                      queryValue = 'top_deals';
                    } else if (lowerTitle.includes('trend')) {
                      queryType = 'collection';
                      queryValue = 'trending';
                    } else if (lowerTitle.includes('rated') || lowerTitle.includes('star')) {
                      queryType = 'collection';
                      queryValue = 'top_rated';
                    } else if (lowerTitle.includes('new') || lowerTitle.includes('fresh')) {
                      queryType = 'collection';
                      queryValue = 'new_arrivals';
                    } else if (fragment.maxPrice > 0) {
                      queryType = 'price';
                      queryValue = fragment.maxPrice;
                    }

                    onSelectFragment({
                      id: fragment.id,
                      type: queryType,
                      value: queryValue,
                      label: fragment.title
                    });
                  }
                }}
                className={`flex-shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border whitespace-nowrap group ${
                  isSelected
                    ? `${theme.activeBg} scale-[1.02]`
                    : `${theme.bg} hover:shadow-sm`
                }`}
              >
                <Icon className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${
                  isSelected ? 'text-white' : theme.iconColor
                }`} />

                <span>{fragment.title}</span>

                {fragment.badge && (
                  <span className={`text-[9px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded-md ${
                    isSelected ? theme.activeBadge : theme.badge
                  }`}>
                    {fragment.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Scroll Arrow */}
        {showRightArrow && (
          <button
            type="button"
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/95 border border-neutral-200/80 shadow-md flex items-center justify-center text-neutral-600 hover:text-neutral-950 hover:scale-105 transition-all cursor-pointer backdrop-blur-sm"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

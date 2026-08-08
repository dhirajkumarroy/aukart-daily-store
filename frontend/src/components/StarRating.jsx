import React from 'react';
import { Star, StarHalf } from 'lucide-react';

export default function StarRating({ rating, className = "" }) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const decimal = rating % 1;
  const hasHalfStar = decimal >= 0.3 && decimal <= 0.7;
  const isAlmostFull = decimal > 0.7;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
      );
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(
        <StarHalf key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
      );
    } else if (i === fullStars + 1 && isAlmostFull) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
      );
    } else {
      stars.push(
        <Star key={i} className="w-4 h-4 text-neutral-300" />
      );
    }
  }

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {stars}
    </div>
  );
}

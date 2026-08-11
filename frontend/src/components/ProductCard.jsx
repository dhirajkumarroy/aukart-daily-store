import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { formatDiscount } from '../utils/formatters';

export default function ProductCard({ product }) {
  const { slug, title, imageUrl, image, price, originalPrice, discount, rating, reviewCount, category } = product;
  const imgSource = imageUrl || image;
  const displayDiscount = formatDiscount(discount);

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden card-hover flex flex-col h-full">
      <Link to={`/product/${slug}`} className="relative aspect-video sm:aspect-square overflow-hidden bg-neutral-50 block">
        {displayDiscount && (
          <span className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full z-10 shadow-sm">
            {displayDiscount}
          </span>
        )}
        <img 
          src={imgSource} 
          alt={title} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'; // fallback high-quality headset
          }}
        />
      </Link>

      <div className="p-5 flex flex-col flex-grow">
        <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 mb-1.5 block">
          {category}
        </span>

        <Link to={`/product/${slug}`} className="hover:text-emerald-600 transition-colors duration-200">
          <h3 className="font-semibold text-neutral-900 text-base line-clamp-2 leading-tight mb-2 min-h-[2.5rem]">
            {title}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mb-4">
          <StarRating rating={rating} />
          <span className="text-xs text-neutral-400 font-medium">({reviewCount})</span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-xs text-neutral-400 line-through leading-none font-medium">{originalPrice}</span>
            <span className="text-xl font-bold text-neutral-900 leading-tight mt-0.5">{price}</span>
          </div>

          <Link 
            to={`/product/${slug}`}
            className="inline-flex items-center justify-center px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs rounded-lg transition-colors duration-250 cursor-pointer shadow-sm"
          >
            View Deal
          </Link>
        </div>
      </div>
    </div>
  );
}

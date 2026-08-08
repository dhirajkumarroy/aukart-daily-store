import React from 'react';
import { Link } from 'react-router-dom';

export default function CategoryFilter({ categories, activeCategory = "all" }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5 my-8">
      <Link
        to="/"
        className={`px-5 py-2.5 text-xs font-semibold rounded-full tracking-wide transition-all duration-200 cursor-pointer ${
          activeCategory === "all"
            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
            : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 border border-neutral-100"
        }`}
      >
        All Products
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          to={`/category/${category.name.toLowerCase()}`}
          className={`px-5 py-2.5 text-xs font-semibold rounded-full tracking-wide transition-all duration-200 cursor-pointer capitalize ${
            activeCategory.toLowerCase() === category.name.toLowerCase()
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
              : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 border border-neutral-100"
          }`}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}

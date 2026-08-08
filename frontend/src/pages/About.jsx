import React from 'react';
import SEO from '../components/SEO';
import { ShieldCheck, Heart, Search } from 'lucide-react';

export default function About() {
  return (
    <>
      <SEO 
        title="About Us - Our Mission & Curation Process | AuKart Daily"
        description="Discover how we research, evaluate, and handpick daily-use products for our catalog. Learn about our selection standards and affiliate transparency."
        canonicalUrl="https://aukart.in/about"
      />

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-neutral-900 tracking-tight mb-4">
            About AuKart Daily
          </h1>
          <p className="text-base text-neutral-500 max-w-xl mx-auto">
            We simplify daily essentials shopping by analyzing product choices to showcase only top-rated, best value deals.
          </p>
        </div>

        <div className="prose prose-neutral max-w-none mb-16">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">How We Work</h2>
          <p className="text-sm text-neutral-600 leading-relaxed mb-6">
            Shopping online can be overwhelming. With millions of choices, fake reviews, and fluctuating prices, finding a reliable product at a fair price is harder than ever. 
            At AuKart Daily, we do the research for you. Our catalog is manually curated by product enthusiasts who check rating averages, read historical user feedback, and look for genuine discounts.
          </p>

          <p className="text-sm text-neutral-600 leading-relaxed">
            By focusing on simplicity, transparency, and trust, we aim to build a clean directory where you can check details and make purchase decisions quickly and confidently on Amazon.
          </p>
        </div>

        {/* Core Values grid */}
        <h2 className="text-xl font-bold text-neutral-900 mb-6 text-center">Our Core Pillars</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100/60">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-neutral-900 text-sm mb-2">Thorough Curation</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              We filter out low-rated items, spammy listings, and deals that seem too good to be true, displaying only high-quality options.
            </p>
          </div>

          <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100/60">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-neutral-900 text-sm mb-2">Trust & Safety</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              We redirect you directly to Amazon's secure site for checkout. Your details and payment details remain completely secure.
            </p>
          </div>

          <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100/60">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-neutral-900 text-sm mb-2">Affiliate Honesty</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              We earn a small commission on purchases made via our links, which helps maintain our independent research—at no extra cost to you.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

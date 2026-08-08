import React from 'react';
import SEO from '../components/SEO';
import { Scale, Info } from 'lucide-react';

export default function Disclosure() {
  return (
    <>
      <SEO 
        title="Affiliate Disclosure | AuKart Daily"
        description="Read our FTC compliance and affiliate disclosure statement. Understand our partnership with Amazon and how product pricing is handled."
        canonicalUrl="https://aukart.in/disclosure"
      />

      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            Affiliate Disclosure
          </h1>
        </div>

        <div className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-6 mb-8 flex gap-4">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 mb-1">Mandatory FTC Disclosure</p>
            <p className="text-sm text-amber-700 font-medium leading-relaxed">
              "As an Amazon Associate, we earn from qualifying purchases. Prices and availability are subject to change."
            </p>
          </div>
        </div>

        <div className="prose prose-neutral text-sm text-neutral-600 leading-relaxed space-y-6">
          <p>
            This website (AuKart Daily) is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.in or Amazon.com.
          </p>
          <h2 className="text-base font-bold text-neutral-950 pt-2">What This Means For You</h2>
          <p>
            When you click on a "Buy on Amazon" link or button featured on our website, you will be redirected to the Amazon product page using a unique affiliate tracking link. If you complete a purchase within 24 hours of clicking the link, we receive a small referral commission from Amazon.
          </p>
          <p className="font-semibold text-neutral-900">
            Crucially, this commission comes at absolutely zero additional cost to you. The prices you pay on Amazon are exactly the same whether you use our link or search for the product directly.
          </p>

          <h2 className="text-base font-bold text-neutral-950 pt-2">Pricing and Product Availability</h2>
          <p>
            Please note that the prices, discounts, and availability displayed on this website are static representations cached from our local product data file. Amazon's actual prices and availability change frequently. The absolute final pricing is determined by Amazon at the time of your checkout on their site.
          </p>

          <h2 className="text-base font-bold text-neutral-950 pt-2">Our Commitment</h2>
          <p>
            We only recommend products that we believe offer real value, have high ratings, and positive customer feedback. Our goal is to provide a curated, helpful dashboard, not to push low-quality products for commissions. Your trust is our most valuable asset.
          </p>
        </div>
      </div>
    </>
  );
}

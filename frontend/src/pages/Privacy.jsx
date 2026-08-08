import React from 'react';
import SEO from '../components/SEO';
import { ShieldCheck, Info } from 'lucide-react';

export default function Privacy() {
  return (
    <>
      <SEO 
        title="Privacy Policy | AuKart Daily"
        description="Read our privacy policy regarding outbound affiliate links, data collection, and cookie usage."
        canonicalUrl="https://aukart.in/privacy"
      />

      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            Privacy Policy
          </h1>
        </div>

        <div className="bg-emerald-50/30 border border-emerald-100 rounded-2xl p-6 mb-8 flex gap-4">
          <Info className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-800 mb-1">Affiliate Listing Directory Notice</p>
            <p className="text-sm text-emerald-700 font-medium leading-relaxed">
              This site curates product recommendation deals and refers customers to Amazon. We do not store, process, or ask for user payment credentials, credit card details, or delivery address information.
            </p>
          </div>
        </div>

        <div className="prose prose-neutral text-sm text-neutral-600 leading-relaxed space-y-6">
          <p>
            At AuKart Daily, accessible from our public web pages, one of our main priorities is the privacy of our visitors. This Privacy Policy document outlines the types of information collected and recorded by AuKart Daily and how we use it.
          </p>

          <h2 className="text-base font-bold text-neutral-950 pt-2">1. Outbound Affiliate Links & Cookies</h2>
          <p>
            We list curated product recommendations on this website. When you click on any <strong>"Buy on Amazon"</strong> button or product title, you are redirected to Amazon via an outbound affiliate link.
          </p>
          <p>
            These external merchant platforms (like Amazon Associates) use cookies and tracking beacons to verify that a referral originated from AuKart Daily. This cookie tracks the referral for a duration of 24 hours to attribute referral commissions. These cookies are set and managed entirely by Amazon in accordance with their own privacy guidelines.
          </p>

          <h2 className="text-base font-bold text-neutral-950 pt-2">2. Information We Do NOT Collect</h2>
          <p>
            Because we operate as a static affiliate catalog, we do not require user registrations, newsletters, or payment processing gates:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>We do <strong>not</strong> collect or store credit card numbers, billing addresses, or user names.</li>
            <li>We do <strong>not</strong> host user profile dashboards or customer account registrations.</li>
            <li>We do <strong>not</strong> send marketing emails or store personal mailing lists.</li>
          </ul>

          <h2 className="text-base font-bold text-neutral-950 pt-2">3. Server Log Metrics & Click Tracking</h2>
          <p>
            AuKart Daily utilizes standard anonymous logging procedures. Our backend database counts the number of outbound redirects to measure which product recommendations are popular.
          </p>
          <p>
            This logs the product's slug, referrer link (if any), and user agent details to prevent bot-scraping rate abuses. None of this data is linked to any personally identifiable information.
          </p>

          <h2 className="text-base font-bold text-neutral-950 pt-2">4. Third-Party Privacy Policies</h2>
          <p>
            AuKart Daily's Privacy Policy does not apply to other advertisers or websites. Thus, we advise you to consult the respective Privacy Policies of these third-party ad servers (e.g., Amazon Associates Policy) for more detailed information.
          </p>

          <h2 className="text-base font-bold text-neutral-950 pt-2">5. Consent</h2>
          <p>
            By using our website, you agree to the terms outlined in this Privacy Policy.
          </p>
        </div>
      </div>
    </>
  );
}

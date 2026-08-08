import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Loader2, ShoppingBag } from 'lucide-react';
import { logProductClick } from '../utils/api';

export default function Redirect() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');

  useEffect(() => {
    let active = true;

    async function handleRedirect() {
      try {
        // Construct display title from slug for presentation
        const cleanTitle = slug
          .split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        setTitle(cleanTitle);

        // Post to backend redirect click counter API
        const { affiliateLink } = await logProductClick(slug);
        
        if (!active) return;

        // Perform redirect after 800ms
        const timer = setTimeout(() => {
          window.location.href = affiliateLink;
        }, 800);

        return () => clearTimeout(timer);
      } catch (err) {
        console.error('Redirect failed:', err);
        if (active) {
          setError('Failed to resolve redirect. The product link might be offline.');
          setTimeout(() => {
            navigate('/');
          }, 3000);
        }
      }
    }

    handleRedirect();

    return () => {
      active = false;
    };
  }, [slug, navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-neutral-900 mb-1">Redirect Failed</h2>
        <p className="text-sm text-neutral-500 mb-2">{error}</p>
        <p className="text-xs text-neutral-400">Returning you to the homepage...</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Redirecting you to Amazon...</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-6 animate-pulse">
          <ShoppingBag className="w-8 h-8" />
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            Redirecting to Amazon
          </h2>
        </div>

        <p className="text-sm text-neutral-500 max-w-sm leading-relaxed mb-1.5">
          Opening "{title}" in Amazon. Please wait...
        </p>
        <p className="text-[10px] text-neutral-400">
          As an Amazon Associate, we earn from qualifying purchases.
        </p>
      </div>
    </>
  );
}

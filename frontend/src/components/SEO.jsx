import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, canonicalUrl, image, type = 'website' }) {
  const defaultTitle = 'AuKart Daily — Everyday Essentials, Handpicked for You';
  const defaultDescription = 'Save time and money with our curated daily-use products. Real prices, verified ratings, and direct Amazon affiliate links.';
  const siteUrl = 'https://aukart.in';
  
  const seoTitle = title || defaultTitle;
  const seoDescription = description || defaultDescription;
  const seoCanonical = canonicalUrl || siteUrl;
  const seoImage = image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';

  return (
    <Helmet>
      {/* Search Engine general meta tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={seoCanonical} />

      {/* Open Graph tags for Facebook/Social platforms */}
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={seoCanonical} />
      <meta property="og:image" content={seoImage} />

      {/* Twitter Cards tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
    </Helmet>
  );
}

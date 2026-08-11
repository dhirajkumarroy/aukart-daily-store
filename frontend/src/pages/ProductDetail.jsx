import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { ChevronRight, Home, ExternalLink, ShieldCheck, RefreshCw, Award, Loader2 } from 'lucide-react';
import StarRating from '../components/StarRating';
import { fetchProduct, logProductClick } from '../utils/api';
import { formatDiscount, formatPrice } from '../utils/formatters';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProduct(slug);
        if (!data) {
          setError('Product not found');
        } else {
          setProduct(data);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Make sure the backend server is running.');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm text-neutral-500 font-medium">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          {error === 'Product not found' ? 'Product Not Found' : 'Error Loading Product'}
        </h2>
        <p className="text-neutral-500 mb-6 max-w-md mx-auto">{error}</p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
        >
          Return to Homepage
        </Link>
      </div>
    );
  }

  const {
    title,
    price,
    originalPrice,
    discount,
    category,
    imageUrl,
    description,
    rating,
    reviewCount
  } = product;

  const displayDiscount = formatDiscount(discount);
  const displayPrice = formatPrice(price);
  const displayOriginalPrice = formatPrice(originalPrice);

  // Calculate savings numerical value for display
  const rawPrice = parseFloat(String(price).replace(/[^\d.]/g, ''));
  const rawOriginal = originalPrice ? parseFloat(String(originalPrice).replace(/[^\d.]/g, '')) : NaN;
  const savings = !isNaN(rawPrice) && !isNaN(rawOriginal) && rawOriginal > rawPrice ? (rawOriginal - rawPrice) : 0;

  return (
    <>
      <SEO 
        title={`${title} | AuKart Daily`}
        description={description || `${title} at only ${price} (down from ${originalPrice || price}, saving ${discount || '0%'}). Learn more details and buy on Amazon.`}
        canonicalUrl={`https://aukart.in/product/${slug}`}
        image={imageUrl}
      />

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": title,
          "image": imageUrl,
          "description": description || `Buy ${title} at the best price.`,
          "sku": slug,
          "offers": {
            "@type": "Offer",
            "url": `https://aukart.in/product/${slug}`,
            "priceCurrency": "INR",
            "price": price.replace(/[^\d]/g, ''),
            "availability": "https://schema.org/InStock"
          },
          ...(rating ? {
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": rating,
              "reviewCount": reviewCount || 1
            }
          } : {})
        })}
      </script>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-neutral-400 mb-8 border-b border-neutral-100 pb-4">
          <Link to="/" className="hover:text-emerald-600 flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" />
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/category/${category.toLowerCase()}`} className="hover:text-emerald-600 capitalize transition-colors">
            {category}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-neutral-500 truncate max-w-[200px] sm:max-w-sm">{title}</span>
        </nav>

        {/* Product Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
          {/* Left Column: Image Card */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-neutral-100 overflow-hidden shadow-sm p-4 sm:p-6">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-100/50">
              {displayDiscount && (
                <span className="absolute top-4 left-4 bg-emerald-500 text-white text-xs font-extrabold px-3 py-1.5 rounded-full z-10 shadow-md">
                  {displayDiscount}
                </span>
              )}
              <img 
                src={imageUrl} 
                alt={title} 
                loading="lazy"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'; // fallback
                }}
              />
            </div>
            
            <p className="text-[10px] text-neutral-400 text-center mt-4 italic">
              * Product images are mock representatives. Clicking "Buy on Amazon" will open the retail product listing.
            </p>
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="lg:col-span-6 flex flex-col h-full justify-center">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-md">
                {category}
              </span>
              {product.featured && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                  <Award className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  Top Rated
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight leading-snug mb-4">
              {title}
            </h1>

            {/* Ratings & Reviews */}
            <div className="flex items-center gap-3 border-b border-neutral-100 pb-5 mb-5">
              <StarRating rating={rating || 0} />
              <span className="text-sm font-semibold text-neutral-800">{rating || 'N/A'} out of 5</span>
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-300"></span>
              <span className="text-xs text-neutral-500 font-medium">{(reviewCount || 0).toLocaleString()} ratings</span>
            </div>

            {/* Price Block */}
            <div className="bg-neutral-50 rounded-2xl p-5 mb-6 border border-neutral-100">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-3xl font-black text-neutral-950">{displayPrice}</span>
                {displayOriginalPrice && (
                  <span className="text-sm text-neutral-400 line-through font-semibold">{displayOriginalPrice}</span>
                )}
              </div>
              
              {savings > 0 && (
                <p className="text-xs font-semibold text-emerald-600">
                  You Save: ₹{savings.toLocaleString()} {displayDiscount ? `(${displayDiscount})` : ''}
                </p>
              )}
              
              <p className="text-[10px] text-neutral-400 mt-2">
                As an Amazon Associate, we earn from qualifying purchases. Prices and availability are subject to change.
              </p>
            </div>

            {/* Primary CTA */}
            <a 
              href={product.affiliateLink || `/go/${slug}`}
              target="_blank"
              rel="nofollow sponsored noopener"
              onClick={() => {
                logProductClick(slug).catch(() => {});
              }}
              className="inline-flex items-center justify-center gap-2 w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base rounded-2xl transition-all duration-200 shadow-md shadow-emerald-600/10 cursor-pointer text-center"
            >
              Buy on Amazon
              <ExternalLink className="w-4 h-4 sm:w-5 h-5" />
            </a>

            {/* Quality Seals */}
            <div className="grid grid-cols-2 gap-4 mt-8 border-t border-neutral-100 pt-6">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">Verified Seller</h4>
                  <p className="text-[10px] text-neutral-400">Fulfilled by Amazon partners</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">Price Protection</h4>
                  <p className="text-[10px] text-neutral-400">Real-time discount checks</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Description Section */}
        {description && (
          <section className="border-t border-neutral-100 pt-10 mb-16">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Product Overview</h2>
            <div className="bg-neutral-50/50 rounded-2xl p-6 border border-neutral-100/50">
              <p className="text-sm text-neutral-600 leading-relaxed max-w-4xl whitespace-pre-line">
                {description}
              </p>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

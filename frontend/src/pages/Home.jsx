import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { Sparkles, ArrowRight, X, Loader2 } from 'lucide-react';
import CategoryFilter from '../components/CategoryFilter';
import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../utils/api';

export default function Home({ categories }) {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q') || '';

  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/admin', { replace: true });
      return;
    }

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch products matching search query
        const mainData = await fetchProducts({ search: searchQuery });
        setProducts(mainData);

        // Fetch featured deals if not performing a search query
        if (!searchQuery) {
          const featuredData = await fetchProducts({ featured: true });
          setFeaturedProducts(featuredData);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Make sure your PostgreSQL database and Express server are running.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [searchQuery]);

  return (
    <>
      <SEO 
        title="AuKart Daily — Everyday Essentials, Handpicked for You"
        description="Discover everyday essentials curated for you. Browse high-quality home, electronics, and sports gear deals with verified Amazon reviews."
        canonicalUrl="https://aukart.in/"
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-radial from-slate-50 to-white py-16 sm:py-24 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold tracking-wide mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Handpicked Quality Products</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-neutral-900 tracking-tight leading-none mb-6">
            Everyday Essentials, <span className="text-emerald-600">Handpicked for You</span>
          </h1>
          <p className="max-w-xl mx-auto text-base sm:text-lg text-neutral-500 font-medium leading-relaxed mb-8">
            Save time and money with our curated daily-use products. Real prices, verified ratings, and direct Amazon affiliate links.
          </p>
          <div className="flex justify-center gap-4">
            <a 
              href="#all-products" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-md shadow-emerald-600/10 cursor-pointer"
            >
              Explore Products
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error Notification */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center max-w-lg mx-auto mb-8">
            <p className="text-red-800 text-sm font-semibold mb-3">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-650 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Search Results Header */}
        {searchQuery && !error && (
          <div className="mb-8 flex items-center justify-between border-b border-neutral-100 pb-5">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-neutral-950">
                Search Results for "{searchQuery}"
              </h2>
              {!loading && (
                <span className="bg-neutral-100 text-neutral-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {products.length}
                </span>
              )}
            </div>
            <Link 
              to="/" 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-emerald-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear search
            </Link>
          </div>
        )}

        {/* Loader Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-sm text-neutral-500 font-medium">Fetching curated deals...</p>
          </div>
        )}

        {/* Featured Products */}
        {!loading && !error && !searchQuery && featuredProducts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-2.5 mb-6">
              <span className="w-2.5 h-6 bg-emerald-500 rounded-sm"></span>
              <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Featured Deals</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Category Filter and Product Grid */}
        {!loading && !error && (
          <section id="all-products" className="scroll-mt-20">
            {!searchQuery && (
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2.5 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600">Product Finder</span>
                </div>
                <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">Browse All Handpicked Deals</h2>
                <CategoryFilter categories={categories} activeCategory="all" />
              </div>
            )}

            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-neutral-50 rounded-3xl border border-neutral-100/60 max-w-lg mx-auto">
                <p className="text-neutral-900 font-semibold text-lg mb-1">No products found</p>
                <p className="text-neutral-500 text-sm mb-6 px-6">We couldn't find any products matching your query. Try checking your spelling or clear the search.</p>
                <Link 
                  to="/" 
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-850 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Clear Search & View All
                </Link>
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}

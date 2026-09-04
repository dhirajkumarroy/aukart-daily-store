import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { Sparkles, ArrowRight, X, Loader2, Tag } from 'lucide-react';
import CategoryFilter from '../components/CategoryFilter';
import BudgetStore from '../components/BudgetStore';
import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../utils/api';

export default function Home({ categories }) {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q') || '';
  const maxPriceParam = queryParams.get('maxPrice') || null;
  const collectionParam = queryParams.get('collection') || null;

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
        // Fetch products matching search query and/or price segment / collection
        const mainData = await fetchProducts({ 
          search: searchQuery,
          maxPrice: maxPriceParam,
          collection: collectionParam 
        });
        setProducts(mainData);

        // Fetch featured deals if not performing a search or price/collection filter query
        if (!searchQuery && !maxPriceParam && !collectionParam) {
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
  }, [searchQuery, maxPriceParam, collectionParam]);

  const handleSelectFragment = (fragment) => {
    const params = new URLSearchParams(location.search);
    params.delete('maxPrice');
    params.delete('collection');

    if (fragment) {
      if (fragment.type === 'collection') {
        params.set('collection', fragment.value);
      } else if (fragment.type === 'price') {
        params.set('maxPrice', fragment.value);
      }
    }

    const newSearch = params.toString();
    navigate(newSearch ? `/?${newSearch}` : '/', { replace: true });
  };

  // Determine active filter object for BudgetStore component
  const activeFilter = maxPriceParam 
    ? { id: 'price', label: `Under ₹${maxPriceParam}` }
    : collectionParam 
      ? { id: collectionParam, label: collectionParam.replace('_', ' ').toUpperCase() }
      : null;

  const activeFilterTitle = maxPriceParam
    ? `Deals Under ₹${maxPriceParam}`
    : collectionParam === 'trending'
      ? 'Trending Deals'
      : collectionParam === 'top_deals'
        ? 'Top Discount Deals'
        : collectionParam === 'top_rated'
          ? 'Top Rated 4+ Star Products'
          : collectionParam === 'new_arrivals'
            ? 'New Arrivals'
            : collectionParam;

  return (
    <>
      <SEO 
        title="AuKart Daily — Everyday Essentials, Handpicked for You"
        description="Discover everyday essentials curated for you. Browse high-quality home, electronics, and sports gear deals with verified Amazon reviews."
        canonicalUrl="https://aukart.in/"
      />

      {/* 1. Sub-Nav Interactive Deal Fragments Ribbon (Under ₹99, Top Deals, Trending, etc.) */}
      {!searchQuery && (
        <BudgetStore 
          activeFilter={activeFilter} 
          onSelectFragment={handleSelectFragment} 
        />
      )}

      {/* 2. Category Filter Pills */}
      {!searchQuery && !activeFilter && (
        <div className="border-b border-neutral-100 bg-white">
          <CategoryFilter categories={categories} activeCategory="all" />
        </div>
      )}

      {/* 3. Main Products Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Active Filter Status Banner */}
        {activeFilter && !error && (
          <div className="mb-8 flex items-center justify-between bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-6 bg-emerald-500 rounded-sm"></span>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-neutral-950 capitalize">
                  {activeFilterTitle}
                </h2>
                <p className="text-xs text-emerald-800">
                  Showing all matching handpicked products
                </p>
              </div>
              {!loading && (
                <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full ml-2">
                  {products.length} {products.length === 1 ? 'deal' : 'deals'}
                </span>
              )}
            </div>
            <button
              onClick={() => handleSelectFragment(null)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-red-600 bg-white hover:bg-red-50 border border-neutral-200 hover:border-red-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <X className="w-3.5 h-3.5" />
              <span>Show All Products</span>
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
        {!loading && !error && !searchQuery && !activeFilter && featuredProducts.length > 0 && (
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

        {/* Main Product Grid Section */}
        {!loading && !error && (
          <section id="all-products" className="scroll-mt-20">
            {!searchQuery && !activeFilter && (
              <div className="flex items-center justify-between mb-6 border-b border-neutral-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-6 bg-emerald-500 rounded-sm"></span>
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">All Curated Products</h2>
                </div>
                <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">
                  {products.length} {products.length === 1 ? 'item' : 'items'}
                </span>
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
                <p className="text-neutral-500 text-sm mb-6 px-6">
                  {activeFilter 
                    ? `No products found matching ${activeFilterTitle}. Try checking other collections.`
                    : "We couldn't find any products matching your query."}
                </p>
                <button 
                  onClick={() => handleSelectFragment(null)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-850 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  View All Products
                </button>
              </div>
            )}
          </section>
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
        {!loading && !error && !searchQuery && !maxPriceParam && featuredProducts.length > 0 && (
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
            {!searchQuery && !maxPriceParam && (
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
                <p className="text-neutral-500 text-sm mb-6 px-6">
                  {maxPriceParam 
                    ? `No products found under ₹${maxPriceParam}. Try checking other price stores.`
                    : "We couldn't find any products matching your query."}
                </p>
                <button 
                  onClick={() => handleSelectMaxPrice(null)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-850 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  View All Products
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}

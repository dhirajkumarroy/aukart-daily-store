import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { ChevronRight, Home, X, Loader2 } from 'lucide-react';
import CategoryFilter from '../components/CategoryFilter';
import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../utils/api';

export default function Category({ categories }) {
  const { categorySlug } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q') || '';

  const activeCategory = categorySlug ? categorySlug.toLowerCase() : 'all';
  const categoryDisplayName = activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      setSelectedSubcategory('all'); // Reset subcategory when main category changes
      try {
        const data = await fetchProducts({ category: activeCategory, search: searchQuery });
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products by category:', err);
        setError('Failed to load products for this category. Make sure the backend server is running.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeCategory, searchQuery]);

  // Read subcategories from master category configuration
  const currentCategoryObj = categories.find(c => c.name.toLowerCase() === activeCategory.toLowerCase());
  const subcategories = currentCategoryObj ? currentCategoryObj.subcategories.map(s => s.name) : [];

  // Filter products by subcategory
  const displayedProducts = selectedSubcategory === 'all'
    ? products
    : products.filter(p => p.subcategory && p.subcategory.toLowerCase() === selectedSubcategory.toLowerCase());

  return (
    <>
      <SEO 
        title={`${categoryDisplayName} Deals | AuKart Daily`}
        description={`Find the best deals on ${activeCategory} essentials. Curated daily products with verified reviews and direct Amazon affiliate redirects.`}
        canonicalUrl={`https://aukart.in/category/${activeCategory}`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-neutral-400 mb-6">
          <Link to="/" className="hover:text-emerald-600 flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" />
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-neutral-500 capitalize">{activeCategory}</span>
        </nav>

        {/* Category Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mb-2 capitalize">
            {categoryDisplayName} Deals
          </h1>
          <p className="text-sm text-neutral-500 max-w-md mx-auto">
            Discover verified deals on top-quality {activeCategory} items. All prices and discounts are updated and direct.
          </p>
          <CategoryFilter categories={categories} activeCategory={activeCategory} />
        </div>

        {/* Subcategory Pills */}
        {!loading && !error && subcategories.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8 border-b border-neutral-100 pb-6">
            <button
              onClick={() => setSelectedSubcategory('all')}
              className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all duration-200 cursor-pointer ${
                selectedSubcategory === 'all'
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm"
                  : "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              All {categoryDisplayName}
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubcategory(sub)}
                className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all duration-200 cursor-pointer capitalize ${
                  selectedSubcategory.toLowerCase() === sub.toLowerCase()
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm"
                    : "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

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

        {/* Search status nested in Category */}
        {searchQuery && !loading && !error && (
          <div className="mb-8 flex items-center justify-between border-b border-neutral-100 pb-5">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-neutral-950">
                Searching for "{searchQuery}" in {categoryDisplayName}
              </h2>
              <span className="bg-neutral-100 text-neutral-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {displayedProducts.length}
              </span>
            </div>
            <Link 
              to={`/category/${activeCategory}`} 
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
            <p className="text-sm text-neutral-500 font-medium">Fetching category deals...</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          displayedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedProducts.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-neutral-50 rounded-3xl border border-neutral-100/60 max-w-lg mx-auto">
              <p className="text-neutral-900 font-semibold text-lg mb-1">No products found</p>
              {searchQuery ? (
                <>
                  <p className="text-neutral-500 text-sm mb-6 px-6">We couldn't find any items matching your query within the {activeCategory} category.</p>
                  <Link 
                    to={`/category/${activeCategory}`} 
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-850 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Clear Category Search
                  </Link>
                </>
              ) : (
                <p className="text-neutral-500 text-sm px-6">There are currently no products in the {activeCategory} category. Check back soon!</p>
              )}
            </div>
          )
        )}
      </div>
    </>
  );
}

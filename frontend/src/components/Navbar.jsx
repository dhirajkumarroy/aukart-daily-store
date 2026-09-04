import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  ShoppingBag, 
  ExternalLink, 
  Layers, 
  LogOut, 
  ChevronDown, 
  Menu, 
  X, 
  Grid, 
  Sparkles,
  ArrowRight,
  Tag,
  Flame
} from 'lucide-react';

const MAX_VISIBLE_NAV_CATEGORIES = 4;

export default function Navbar({ categories = [] }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract current search query from URL
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('q') || '';

  const [searchVal, setSearchVal] = useState(initialSearch);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [allCategoriesOpen, setAllCategoriesOpen] = useState(false);

  const moreDropdownRef = useRef(null);
  const allCategoriesRef = useRef(null);

  // Keep input in sync with URL changes
  useEffect(() => {
    setSearchVal(initialSearch);
  }, [initialSearch]);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
    setAllCategoriesOpen(false);
  }, [location.pathname, location.search]);

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target)) {
        setMoreDropdownOpen(false);
      }
      if (allCategoriesRef.current && !allCategoriesRef.current.contains(event.target)) {
        setAllCategoriesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchVal(val);

    const isProductOrContentPage = 
      location.pathname.startsWith('/product/') || 
      location.pathname === '/about' || 
      location.pathname === '/disclosure' ||
      location.pathname === '/privacy';

    const targetPath = isProductOrContentPage ? '/' : location.pathname;

    if (val.trim()) {
      navigate(`${targetPath}?q=${encodeURIComponent(val)}`, { replace: true });
    } else {
      navigate(targetPath, { replace: true });
    }
  };

  const clearSearch = () => {
    setSearchVal('');
    const isProductOrContentPage = 
      location.pathname.startsWith('/product/') || 
      location.pathname === '/about' || 
      location.pathname === '/disclosure' ||
      location.pathname === '/privacy';
    navigate(isProductOrContentPage ? '/' : location.pathname, { replace: true });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.target.querySelector('input')?.blur();
  };

  // Determine active category slug from current path
  const currentCategorySlug = location.pathname.startsWith('/category/') 
    ? decodeURIComponent(location.pathname.replace('/category/', '')).toLowerCase() 
    : '';

  // Split categories for desktop nav
  const visibleCategories = categories.slice(0, MAX_VISIBLE_NAV_CATEGORIES);
  const overflowCategories = categories.slice(MAX_VISIBLE_NAV_CATEGORIES);

  const isAdminPage = location.pathname.startsWith('/admin') || location.pathname === '/login';

  if (isAdminPage) {
    const isLoggedIn = !!localStorage.getItem('adminToken');
    return (
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-neutral-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Admin Logo */}
            <Link to="/admin" className="flex items-center gap-2.5 flex-shrink-0 cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex items-baseline gap-1.5 leading-none">
                <span className="font-extrabold text-lg text-neutral-900 tracking-tight">
                  Au<span className="text-emerald-600">Kart</span>
                </span>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Daily
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full ml-1">
                  Admin
                </span>
              </div>
            </Link>

            {/* Navigation links & Actions */}
            <div className="flex items-center gap-3 sm:gap-4 text-sm font-semibold">
              <Link 
                to="/" 
                target="_blank"
                className="inline-flex items-center gap-1.5 text-neutral-500 hover:text-emerald-600 transition-colors cursor-pointer text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-neutral-50"
              >
                <span>View Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              {isLoggedIn && (
                <Link 
                  to="/admin/categories" 
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    location.pathname === '/admin/categories'
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 border border-neutral-200/60'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Category Manager</span>
                </Link>
              )}

              {isLoggedIn && (
                <button
                  onClick={() => {
                    localStorage.removeItem('adminToken');
                    navigate('/login');
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer border border-red-100"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-neutral-100 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
            
            {/* 1. Left: Brand Logo & Mobile Trigger */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 -ml-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link to="/" className="flex items-center gap-2 flex-shrink-0 cursor-pointer group">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:bg-emerald-700 transition-colors">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-x-1.5 leading-none">
                  <span className="font-extrabold text-lg text-neutral-900 tracking-tight">
                    Au<span className="text-emerald-600">Kart</span>
                  </span>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Daily
                  </span>
                </div>
              </Link>
            </div>

            {/* 2. Middle: Desktop Navigation with Scaling Categories */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-semibold">
              <Link 
                to="/" 
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  location.pathname === '/' && !location.search
                    ? 'text-emerald-700 bg-emerald-50 font-bold'
                    : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50'
                }`}
              >
                Home
              </Link>

              {/* All Categories Dropdown Button */}
              <div className="relative" ref={allCategoriesRef}>
                <button
                  type="button"
                  onClick={() => {
                    setAllCategoriesOpen(!allCategoriesOpen);
                    setMoreDropdownOpen(false);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    allCategoriesOpen
                      ? 'bg-emerald-50 text-emerald-700 font-bold'
                      : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50'
                  }`}
                >
                  <Grid className="w-4 h-4 text-emerald-600" />
                  <span>Categories</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${allCategoriesOpen ? 'rotate-180 text-emerald-600' : 'text-neutral-400'}`} />
                </button>

                {/* All Categories Popover Menu */}
                {allCategoriesOpen && (
                  <div className="absolute left-0 mt-2 w-72 max-h-96 overflow-y-auto bg-white rounded-2xl shadow-xl border border-neutral-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-neutral-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">All Categories</span>
                      <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {categories.length} Total
                      </span>
                    </div>
                    <div className="py-1">
                      {categories.map((cat) => {
                        const isActive = currentCategorySlug === cat.name.toLowerCase();
                        return (
                          <Link
                            key={cat.id}
                            to={`/category/${cat.name.toLowerCase()}`}
                            onClick={() => setAllCategoriesOpen(false)}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 font-bold'
                                : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <Tag className="w-3.5 h-3.5 text-neutral-400" />
                              {cat.name}
                            </span>
                            {cat.subcategories?.length > 0 && (
                              <span className="text-[10px] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded-md">
                                {cat.subcategories.length}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Primary Visible Category Quick Tabs */}
              {visibleCategories.map((category) => {
                const isActive = currentCategorySlug === category.name.toLowerCase();
                return (
                  <Link 
                    key={category.id} 
                    to={`/category/${category.name.toLowerCase()}`}
                    className={`px-3 py-1.5 rounded-lg transition-colors capitalize cursor-pointer whitespace-nowrap ${
                      isActive 
                        ? 'text-emerald-700 bg-emerald-50 font-bold' 
                        : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50'
                    }`}
                  >
                    {category.name}
                  </Link>
                );
              })}

              {/* "More ▾" Overflow Dropdown for Scalability */}
              {overflowCategories.length > 0 && (
                <div className="relative" ref={moreDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setMoreDropdownOpen(!moreDropdownOpen);
                      setAllCategoriesOpen(false);
                    }}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      moreDropdownOpen
                        ? 'bg-neutral-100 text-neutral-900 font-bold'
                        : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50'
                    }`}
                  >
                    <span>More</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {moreDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-neutral-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-1.5 text-[11px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-100">
                        More Categories
                      </div>
                      <div className="py-1">
                        {overflowCategories.map((cat) => {
                          const isActive = currentCategorySlug === cat.name.toLowerCase();
                          return (
                            <Link
                              key={cat.id}
                              to={`/category/${cat.name.toLowerCase()}`}
                              onClick={() => setMoreDropdownOpen(false)}
                              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-700 font-bold'
                                  : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950'
                              }`}
                            >
                              <span>{cat.name}</span>
                              <ChevronDown className="w-3 h-3 -rotate-90 text-neutral-300" />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Link 
                to="/about" 
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  location.pathname === '/about'
                    ? 'text-emerald-700 bg-emerald-50 font-bold'
                    : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50'
                }`}
              >
                About
              </Link>
            </nav>

            {/* 3. Right: Universal Search Bar */}
            <form onSubmit={handleSubmit} className="relative w-full max-w-[200px] sm:max-w-xs lg:max-w-sm">
              <input
                type="text"
                placeholder="Search products..."
                value={searchVal}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-8 py-2 border border-neutral-200 rounded-xl bg-neutral-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs sm:text-sm transition-all placeholder-neutral-400 text-neutral-800"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              {searchVal && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-200/60 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>
        </div>
      </header>

      {/* 4. Mobile Drawer (Responsive Overlay) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl z-50 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-250">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-neutral-100">
                <Link 
                  to="/" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-extrabold text-base text-neutral-900">
                      Au<span className="text-emerald-600">Kart</span>
                    </span>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase">
                      Daily
                    </span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Links */}
              <div className="p-4 space-y-1">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    location.pathname === '/' && !location.search
                      ? 'bg-emerald-50 text-emerald-700 font-bold'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Home</span>
                </Link>

                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    location.pathname === '/about'
                      ? 'bg-emerald-50 text-emerald-700 font-bold'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <ExternalLink className="w-4 h-4 text-neutral-400" />
                  <span>About Us</span>
                </Link>
              </div>

              {/* Category Explorer */}
              <div className="px-4 py-2 border-t border-neutral-100">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Shop Categories
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {categories.length}
                  </span>
                </div>

                <div className="space-y-1">
                  {categories.map((cat) => {
                    const isActive = currentCategorySlug === cat.name.toLowerCase();
                    return (
                      <Link
                        key={cat.id}
                        to={`/category/${cat.name.toLowerCase()}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                          isActive
                            ? 'bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-600/20'
                            : 'text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Tag className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                          {cat.name}
                        </span>
                        <ArrowRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-neutral-300'}`} />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-neutral-100 bg-neutral-50/50">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white border border-neutral-200 rounded-xl text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition-colors shadow-sm"
              >
                <span>Admin Login</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, ExternalLink, Layers, LogOut } from 'lucide-react';

export default function Navbar({ categories }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract current search query from URL
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('q') || '';

  const [searchVal, setSearchVal] = useState(initialSearch);

  // Keep input in sync with URL changes
  useEffect(() => {
    setSearchVal(initialSearch);
  }, [initialSearch]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchVal(val);

    // If typing on sub-content or product details, push to homepage search, else maintain active route search
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

  const handleSubmit = (e) => {
    e.preventDefault();
    e.target.querySelector('input')?.blur();
  };

  const isAdminPage = location.pathname.startsWith('/admin') || location.pathname === '/login';

  if (isAdminPage) {
    const isLoggedIn = !!localStorage.getItem('adminToken');
    return (
      <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-neutral-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
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
            <div className="flex items-center gap-4 text-sm font-semibold">
              <Link 
                to="/" 
                target="_blank"
                className="inline-flex items-center gap-1 text-neutral-500 hover:text-emerald-600 transition-colors cursor-pointer text-xs font-semibold px-2 py-1"
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
                  Category Manager
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
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-neutral-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
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

          {/* Navigation Links - Hidden on Mobile */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link to="/" className="text-neutral-500 hover:text-emerald-600 transition-colors">
              Home
            </Link>
            {categories && categories.map((category) => (
              <Link 
                key={category.id} 
                to={`/category/${category.name.toLowerCase()}`}
                className="text-neutral-500 hover:text-emerald-600 transition-colors capitalize cursor-pointer"
              >
                {category.name}
              </Link>
            ))}
            <Link to="/about" className="text-neutral-500 hover:text-emerald-600 transition-colors cursor-pointer">
              About
            </Link>
          </nav>

          {/* Search bar */}
          <form onSubmit={handleSubmit} className="relative w-full max-w-[180px] sm:max-w-xs md:max-w-sm">
            <input
              type="text"
              placeholder="Search products..."
              value={searchVal}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-xl bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all placeholder-neutral-400 text-neutral-800"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          </form>
        </div>
      </div>
    </header>
  );
}

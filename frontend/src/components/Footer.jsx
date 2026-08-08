import { Link, useLocation } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  const isAdminPage = location.pathname.startsWith('/admin') || location.pathname === '/login';
  if (isAdminPage) return null;

  return (
    <footer className="bg-neutral-50 border-t border-neutral-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-b border-neutral-200/60 pb-8">
          <div>
            <h4 className="font-semibold text-neutral-900 text-sm mb-2">Affiliate Disclosure</h4>
            <p className="text-xs text-neutral-500 leading-relaxed max-w-xl">
              As an Amazon Associate, we earn from qualifying purchases. Prices and availability are subject to change. Some links on this page are affiliate links, meaning we may receive a small commission if you click them and make a purchase, at no extra cost to you.
            </p>
          </div>

          <div className="flex flex-wrap md:justify-end gap-x-6 gap-y-3 text-xs font-semibold text-neutral-500">
            <Link to="/" className="hover:text-emerald-600 transition-colors cursor-pointer">Home</Link>
            <Link to="/about" className="hover:text-emerald-600 transition-colors cursor-pointer">About Us</Link>
            <Link to="/disclosure" className="hover:text-emerald-600 transition-colors cursor-pointer">Affiliate Disclosure</Link>
            <Link to="/privacy" className="hover:text-emerald-600 transition-colors cursor-pointer">Privacy Policy</Link>
            <Link to="/admin" className="hover:text-emerald-600 transition-colors cursor-pointer">Admin Panel</Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 text-xs text-neutral-400">
          <p>© {currentYear} AuKart Daily. All rights reserved.</p>
          <p>Designed for clean, fast shopping experiences.</p>
        </div>
      </div>
    </footer>
  );
}

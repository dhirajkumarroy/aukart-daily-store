import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Plus, LogOut, BarChart3, Edit, Trash2, Loader2, ArrowUpRight, Eye } from 'lucide-react';
import { fetchAnalytics, deleteProduct } from '../utils/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    async function loadStats() {
      try {
        const data = await fetchAnalytics(token);
        setProducts(data);
      } catch (err) {
        console.error('Error loading analytics:', err);
        setError('Session expired or unauthorized. Please log in again.');
        localStorage.removeItem('adminToken');
        setTimeout(() => navigate('/login'), 2000);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the product "${title}"?`)) {
      return;
    }

    try {
      await deleteProduct(id, token);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete product. Please try again.');
    }
  };

  // Aggregated totals
  const totalProducts = products.length;
  const totalClicks = products.reduce((acc, p) => acc + p.totalClicks, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm text-neutral-500 font-medium">Loading Dashboard metrics...</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | AuKart Daily</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-100 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Admin Console</h1>
            <p className="text-sm text-neutral-500 mt-1">Monitor click metrics and manage product deals catalog.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link 
              to="/admin/product/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-600/10 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Products</span>
              <BarChart3 className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-4xl font-black text-neutral-950">{totalProducts}</p>
          </div>

          <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Outbound Clicks</span>
              <ArrowUpRight className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-4xl font-black text-neutral-950">{totalClicks}</p>
          </div>
        </div>

        {/* Error Notification */}
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-center max-w-md mx-auto">
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-neutral-50 rounded-3xl border border-neutral-100/60 max-w-md mx-auto">
            <p className="text-neutral-900 font-semibold text-base mb-1">No products found in database</p>
            <p className="text-neutral-500 text-xs mb-6 px-6">Get started by uploading your very first product deal.</p>
            <Link 
              to="/admin/product/new" 
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add First Product
            </Link>
          </div>
        ) : (
          /* Products List Table */
          <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-100 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Product details</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-center">7D Clicks</th>
                    <th className="px-6 py-4 text-center">30D Clicks</th>
                    <th className="px-6 py-4 text-center">Total Clicks</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-sm">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-neutral-50/50 transition-colors">
                      {/* Product info details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <Link 
                            to={`/product/${product.slug}`}
                            className="w-12 h-12 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0 border border-neutral-200/50 block hover:opacity-80 transition-opacity"
                          >
                            <img 
                              src={product.imageUrl} 
                              alt="" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100';
                              }}
                            />
                          </Link>
                          <div>
                            <Link 
                              to={`/product/${product.slug}`} 
                              className="font-bold text-neutral-900 hover:text-emerald-600 line-clamp-1 block transition-colors"
                            >
                              {product.title}
                            </Link>
                            <span className="text-xs text-neutral-400 font-medium block mt-0.5">{product.slug}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category tag */}
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold uppercase tracking-wide text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                          {product.category}
                        </span>
                      </td>

                      {/* 7D Clicks count */}
                      <td className="px-6 py-4 text-center font-semibold text-neutral-700">
                        {product.clicksLast7Days.toLocaleString()}
                      </td>

                      {/* 30D Clicks count */}
                      <td className="px-6 py-4 text-center font-semibold text-neutral-700">
                        {product.clicksLast30Days.toLocaleString()}
                      </td>

                      {/* Total clicks */}
                      <td className="px-6 py-4 text-center font-extrabold text-neutral-900">
                        {product.totalClicks.toLocaleString()}
                      </td>

                      {/* Actions link list */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            to={`/product/${product.slug}`}
                            target="_blank"
                            className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                            title="View Public Page"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          
                          <Link 
                            to={`/admin/product/edit/${product.id}`}
                            className="p-2 text-neutral-400 hover:text-emerald-600 transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          <button 
                            onClick={() => handleDelete(product.id, product.title)}
                            className="p-2 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Plus, 
  BarChart3, 
  Edit, 
  Trash2, 
  Loader2, 
  ArrowUpRight, 
  Eye, 
  RotateCcw, 
  AlertTriangle,
  Archive,
  CheckCircle2,
  Cloud,
  FileSpreadsheet
} from 'lucide-react';
import { 
  fetchAnalytics, 
  softDeleteProduct, 
  restoreProduct, 
  hardDeleteProduct 
} from '../utils/api';

import Swal from 'sweetalert2';
import BulkImportModal from '../components/BulkImportModal';
import { formatPrice } from '../utils/formatters';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'trash'
  const [actionLoading, setActionLoading] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const token = localStorage.getItem('adminToken');

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await fetchAnalytics(token);
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Session expired or unauthorized. Please log in again.');
      localStorage.removeItem('adminToken');
      setTimeout(() => navigate('/login'), 2000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    loadStats();
  }, [token, navigate]);

  // Soft Delete Handler
  const handleSoftDelete = async (id, title) => {
    const result = await Swal.fire({
      title: 'Move to Trash?',
      text: `"${title}" will be hidden from the public store, but you can restore it anytime.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d97706',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, move to trash',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    setActionLoading(id);
    try {
      await softDeleteProduct(id, token);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, isDeleted: true, deletedAt: new Date().toISOString() } : p));
      Swal.fire({
        title: 'Moved to Trash!',
        text: `"${title}" has been moved to trash.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('Soft delete error:', err);
      Swal.fire('Error', 'Failed to move product to trash. Please try again.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Restore Handler
  const handleRestore = async (id, title) => {
    const result = await Swal.fire({
      title: 'Restore Product?',
      text: `"${title}" will become active and visible on the public store again.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, restore product',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    setActionLoading(id);
    try {
      await restoreProduct(id, token);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, isDeleted: false, deletedAt: null } : p));
      Swal.fire({
        title: 'Restored!',
        text: `"${title}" is now active in your catalog.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('Restore error:', err);
      Swal.fire('Error', 'Failed to restore product. Please try again.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Hard Delete Handler (DB & Cloudinary destruction)
  const handleHardDelete = async (id, title, hasCloudinaryImage) => {
    const result = await Swal.fire({
      title: 'Permanently Delete?',
      html: hasCloudinaryImage
        ? `<p class="text-sm text-neutral-600 mb-2">Are you sure you want to permanently delete <strong>"${title}"</strong>?</p><ul class="text-xs text-left text-red-600 space-y-1 list-disc pl-4"><li>Deletes record & click analytics from database forever</li><li>Permanently deletes hosted image from Cloudinary</li></ul><p class="text-xs text-neutral-400 mt-3 font-semibold">This action CANNOT be undone.</p>`
        : `<p class="text-sm text-neutral-600 mb-2">Are you sure you want to permanently delete <strong>"${title}"</strong> from the database?</p><p class="text-xs text-red-600 font-semibold">This action CANNOT be undone.</p>`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete permanently',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    setActionLoading(id);
    try {
      await hardDeleteProduct(id, token);
      setProducts(prev => prev.filter(p => p.id !== id));
      Swal.fire({
        title: 'Permanently Deleted!',
        text: hasCloudinaryImage
          ? `"${title}" and its Cloudinary image have been permanently deleted.`
          : `"${title}" has been permanently deleted.`,
        icon: 'success',
        timer: 2500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('Hard delete error:', err);
      Swal.fire('Error', 'Failed to permanently delete product. Please try again.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter products by tab
  const activeProducts = products.filter(p => !p.isDeleted);
  const trashedProducts = products.filter(p => p.isDeleted);
  const displayedProducts = activeTab === 'active' ? activeProducts : trashedProducts;

  // Aggregated totals
  const totalActive = activeProducts.length;
  const totalTrash = trashedProducts.length;
  const totalClicks = activeProducts.reduce((acc, p) => acc + (p.totalClicks || 0), 0);

  if (loading && products.length === 0) {
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
            <p className="text-sm text-neutral-500 mt-1">
              Manage products, Cloudinary media assets, and monitor referral click metrics.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Import Excel / CSV
            </button>

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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Active Products</span>
              <BarChart3 className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-4xl font-black text-neutral-950">{totalActive}</p>
          </div>

          <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">In Trash / Soft Deleted</span>
              <Archive className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-4xl font-black text-neutral-950">{totalTrash}</p>
          </div>

          <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Active Outbound Clicks</span>
              <ArrowUpRight className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-4xl font-black text-neutral-950">{totalClicks.toLocaleString()}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 mb-6 border-b border-neutral-100 pb-3">
          <button
            onClick={() => setActiveTab('active')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 border border-neutral-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Active Catalog ({totalActive})
          </button>

          <button
            onClick={() => setActiveTab('trash')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'trash'
                ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/20'
                : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 border border-neutral-100'
            }`}
          >
            <Archive className="w-4 h-4" />
            Trash / Archived ({totalTrash})
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-center max-w-md mx-auto mb-6">
            {error}
          </div>
        )}

        {displayedProducts.length === 0 ? (
          <div className="text-center py-16 bg-neutral-50 rounded-3xl border border-neutral-100/60 max-w-md mx-auto">
            {activeTab === 'active' ? (
              <>
                <p className="text-neutral-900 font-semibold text-base mb-1">No active products found</p>
                <p className="text-neutral-500 text-xs mb-6 px-6">Get started by uploading your very first product deal.</p>
                <Link 
                  to="/admin/product/new" 
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add First Product
                </Link>
              </>
            ) : (
              <>
                <p className="text-neutral-900 font-semibold text-base mb-1">Trash is empty</p>
                <p className="text-neutral-500 text-xs px-6">When you soft delete products, they will appear here where you can restore or permanently delete them.</p>
              </>
            )}
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
                    <th className="px-6 py-4">Cloudinary Asset</th>
                    <th className="px-6 py-4 text-center">Total Clicks</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-sm">
                  {displayedProducts.map((product) => {
                    const isBusy = actionLoading === product.id;
                    const hasCloudinary = Boolean(product.imagePublicId);

                    return (
                      <tr key={product.id} className="hover:bg-neutral-50/50 transition-colors">
                        {/* Product info details */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0 border border-neutral-200/50">
                              <img 
                                src={product.imageUrl} 
                                alt="" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100';
                                }}
                              />
                            </div>
                            <div>
                              <span className="font-bold text-neutral-900 line-clamp-1 block">
                                {product.title}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-neutral-400 font-medium">{product.slug}</span>
                                {product.price && (
                                  <span className="text-xs font-semibold text-emerald-700">{formatPrice(product.price)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category tag */}
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold uppercase tracking-wide text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                            {product.category}
                          </span>
                        </td>

                        {/* Cloudinary info */}
                        <td className="px-6 py-4">
                          {hasCloudinary ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1 rounded-md" title={`Public ID: ${product.imagePublicId}`}>
                              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                              Cloudinary Synced
                            </span>
                          ) : (
                            <span className="text-xs text-neutral-400 italic">
                              External URL
                            </span>
                          )}
                        </td>

                        {/* Total clicks */}
                        <td className="px-6 py-4 text-center font-extrabold text-neutral-900">
                          {(product.totalClicks || 0).toLocaleString()}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 text-center">
                          {product.isDeleted ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                              Trashed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              Active
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          {isBusy ? (
                            <Loader2 className="w-4 h-4 animate-spin text-neutral-400 inline-block" />
                          ) : activeTab === 'active' ? (
                            /* Active Products Actions */
                            <div className="flex items-center justify-end gap-1">
                              <Link 
                                to={`/product/${product.slug}`}
                                target="_blank"
                                className="p-2 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                                title="View Public Page"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              
                              <Link 
                                to={`/admin/product/edit/${product.slug}`}
                                className="p-2 text-neutral-400 hover:text-emerald-600 transition-colors cursor-pointer"
                                title="Edit Product & Image"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>

                              <button 
                                onClick={() => handleSoftDelete(product.id, product.title)}
                                className="p-2 text-neutral-400 hover:text-amber-600 transition-colors cursor-pointer"
                                title="Move to Trash (Soft Delete)"
                              >
                                <Archive className="w-4 h-4" />
                              </button>

                              <button 
                                onClick={() => handleHardDelete(product.id, product.title, hasCloudinary)}
                                className="p-2 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                                title="Permanent Delete (Hard Delete from DB & Cloudinary)"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            /* Trashed Products Actions */
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleRestore(product.id, product.title)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                                title="Restore product to live catalog"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Restore
                              </button>

                              <button 
                                onClick={() => handleHardDelete(product.id, product.title, hasCloudinary)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                                title="Permanently delete product and Cloudinary image"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Hard Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Product Import Modal */}
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          loadStats();
          setIsImportModalOpen(false);
        }}
        token={token}
      />
    </>
  );
}

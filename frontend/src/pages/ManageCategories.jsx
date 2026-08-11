import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Loader2, Plus, Trash2, AlertCircle } from 'lucide-react';
import { 
  fetchMasterCategories, 
  createMasterCategory, 
  deleteMasterCategory, 
  createMasterSubcategory, 
  deleteMasterSubcategory 
} from '../utils/api';
import Swal from 'sweetalert2';

export default function ManageCategories() {
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form input states
  const [newCatName, setNewCatName] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [creatingSubcategory, setCreatingSubcategory] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Fetch categories master list
  async function loadCategories() {
    try {
      const list = await fetchMasterCategories();
      setCategories(list);
      // Select first category by default in the subcategory form dropdown
      if (list.length > 0) {
        setSelectedCatId(list[0].id);
      }
    } catch (err) {
      console.error('Error loading master categories:', err);
      setError('Failed to fetch categories list.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadCategories();
    }
  }, [token]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setCreatingCategory(true);
    setError(null);
    try {
      await createMasterCategory(newCatName.trim(), token);
      setNewCatName('');
      await loadCategories();
    } catch (err) {
      console.error('Error adding category:', err);
      setError(err.message || 'Failed to create category.');
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleAddSubcategory = async (e) => {
    e.preventDefault();
    if (!newSubName.trim() || !selectedCatId) return;

    setCreatingSubcategory(true);
    setError(null);
    try {
      await createMasterSubcategory(newSubName.trim(), selectedCatId, token);
      setNewSubName('');
      await loadCategories();
    } catch (err) {
      console.error('Error adding subcategory:', err);
      setError(err.message || 'Failed to create subcategory.');
    } finally {
      setCreatingSubcategory(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    const result = await Swal.fire({
      title: 'Delete Category?',
      text: `Are you sure you want to delete "${name}"? This will delete all its subcategories!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      await deleteMasterCategory(id, token);
      await loadCategories();
      Swal.fire({
        title: 'Deleted!',
        text: `Category "${name}" deleted.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('Error deleting category:', err);
      Swal.fire('Error', 'Failed to delete category.', 'error');
    }
  };

  const handleDeleteSubcategory = async (id, name) => {
    const result = await Swal.fire({
      title: 'Delete Subcategory?',
      text: `Are you sure you want to delete subcategory "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      await deleteMasterSubcategory(id, token);
      await loadCategories();
      Swal.fire({
        title: 'Deleted!',
        text: `Subcategory "${name}" deleted.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('Error deleting subcategory:', err);
      Swal.fire('Error', 'Failed to delete subcategory.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm text-neutral-500 font-medium">Loading category manager...</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Manage Categories | AuKart Daily Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back navigation */}
        <Link 
          to="/admin" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-emerald-600 transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Admin Console
        </Link>

        {/* Title */}
        <div className="border-b border-neutral-100 pb-6 mb-8">
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Category Manager</h1>
          <p className="text-sm text-neutral-500 mt-1">Configure structural categories and subcategories used in filtering and search.</p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex gap-2.5 items-start mb-8 text-sm max-w-2xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left panel: Category columns list */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-neutral-900 mb-4">Active Categories & Subcategories</h2>
            {categories.length === 0 ? (
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-8 text-center text-sm text-neutral-550">
                No categories found. Use the forms on the right to define your website structure.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {categories.map((cat) => (
                  <div key={cat.id} className="bg-white border border-neutral-200/70 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-3">
                        <span className="font-extrabold text-neutral-900 capitalize text-base">{cat.name}</span>
                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="p-1.5 text-neutral-450 hover:text-red-650 transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Subcategories list */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Subcategories</span>
                        {cat.subcategories.length === 0 ? (
                          <p className="text-xs text-neutral-400 italic">No subcategories defined</p>
                        ) : (
                          <div className="flex flex-col gap-1 mt-1">
                            {cat.subcategories.map((sub) => (
                              <div key={sub.id} className="flex items-center justify-between text-xs bg-neutral-50 px-2.5 py-1.5 rounded-lg border border-neutral-100/50">
                                <span className="text-neutral-700 capitalize font-medium">{sub.name}</span>
                                <button
                                  onClick={() => handleDeleteSubcategory(sub.id, sub.name)}
                                  className="text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                                  title="Delete Subcategory"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right panel: creation forms */}
          <div className="space-y-6">
            {/* Add Category Form */}
            <div className="bg-white border border-neutral-200/70 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-neutral-900 text-sm mb-4">Add New Category</h3>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide mb-1.5">Category Name*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kitchen, Home Decor"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={creatingCategory}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-900/60 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  {creatingCategory ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  Create Category
                </button>
              </form>
            </div>

            {/* Add Subcategory Form */}
            <div className="bg-white border border-neutral-200/70 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-neutral-900 text-sm mb-4">Add New Subcategory</h3>
              <form onSubmit={handleAddSubcategory} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide mb-1.5">Parent Category*</label>
                  <select
                    value={selectedCatId}
                    onChange={(e) => setSelectedCatId(e.target.value)}
                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs transition-all capitalize"
                    disabled={categories.length === 0}
                  >
                    {categories.length === 0 ? (
                      <option>No Categories Available</option>
                    ) : (
                      categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide mb-1.5">Subcategory Name*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Blenders, Rugs"
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs transition-all"
                    disabled={categories.length === 0}
                  />
                </div>
                <button
                  type="submit"
                  disabled={creatingSubcategory || categories.length === 0}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-900/60 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  {creatingSubcategory ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  Create Subcategory
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Upload, Loader2, Save, AlertCircle } from 'lucide-react';
import { createProduct, updateProduct, fetchProduct, uploadImage, fetchMasterCategories } from '../utils/api';

export default function ProductForm() {
  const { slug: urlSlug } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');
  const isEditMode = !!urlSlug;

  const [productId, setProductId] = useState('');
  const [categoriesList, setCategoriesList] = useState([]); // holds categories structure: { id, name, subcategories: [] }

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    price: '',
    originalPrice: '',
    discount: '',
    category: '',
    subcategory: '',
    affiliateLink: '',
    rating: 4.5,
    reviewCount: 0,
    featured: false,
    description: '',
    imageUrl: ''
  });

  const [loading, setLoading] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(isEditMode);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState(null);

  // Authentication check
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Load existing master categories on mount to populate Select inputs
  useEffect(() => {
    async function loadCategoriesList() {
      try {
        const list = await fetchMasterCategories();
        setCategoriesList(list);
      } catch (err) {
        console.error('Error fetching master categories list:', err);
      }
    }
    loadCategoriesList();
  }, []);

  // Load product if in Edit Mode
  useEffect(() => {
    if (!isEditMode || !token) return;

    async function getProductDetails() {
      try {
        const data = await fetchProduct(urlSlug);
        if (!data) {
          setError('Product not found');
          return;
        }
        setProductId(data.id);
        setFormData({
          title: data.title,
          slug: data.slug,
          price: data.price,
          originalPrice: data.originalPrice || '',
          discount: data.discount || '',
          category: data.category.toLowerCase(),
          subcategory: data.subcategory ? data.subcategory.toLowerCase() : '',
          affiliateLink: data.affiliateLink,
          rating: data.rating || 4.5,
          reviewCount: data.reviewCount || 0,
          featured: data.featured || false,
          description: data.description || '',
          imageUrl: data.imageUrl || ''
        });
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to fetch product details.');
      } finally {
        setFetchingProduct(false);
      }
    }

    getProductDetails();
  }, [urlSlug, isEditMode, token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategorySelectChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, category: val, subcategory: '' }));
  };

  const handleSubcategorySelectChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, subcategory: val }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);

    try {
      const data = await uploadImage(file, token);
      setFormData(prev => ({
        ...prev,
        imageUrl: data.imageUrl
      }));
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image. Make sure backend is running.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const categoryVal = formData.category.toLowerCase();
    const subcategoryVal = formData.subcategory.toLowerCase();

    if (!categoryVal) {
      setError('Category is required');
      setLoading(false);
      return;
    }

    // Prepare inputs matching the backend schema
    const payload = {
      ...formData,
      category: categoryVal,
      subcategory: subcategoryVal || null,
      rating: parseFloat(formData.rating) || null,
      reviewCount: parseInt(formData.reviewCount, 10) || null,
      originalPrice: formData.originalPrice || null,
      discount: formData.discount || null,
      description: formData.description || null,
      slug: formData.slug || undefined
    };

    try {
      if (isEditMode) {
        await updateProduct(productId, payload, token);
      } else {
        await createProduct(payload, token);
      }
      navigate('/admin');
    } catch (err) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save product. Double check inputs and connection.');
    } finally {
      setLoading(false);
    }
  };

  // Find subcategories belonging to the active selected category object
  const selectedCategoryObj = categoriesList.find(c => c.name.toLowerCase() === formData.category.toLowerCase());
  const availableSubcategories = selectedCategoryObj ? selectedCategoryObj.subcategories.map(s => s.name.toLowerCase()) : [];

  if (fetchingProduct) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm text-neutral-500 font-medium">Fetching product data...</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isEditMode ? 'Edit Product' : 'Add New Product'} | AuKart Daily</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Back navigation */}
        <Link 
          to="/admin" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-emerald-600 transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Admin Console
        </Link>

        {/* Title */}
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight mb-8">
          {isEditMode ? 'Edit Product Deal' : 'Add New Product Deal'}
        </h1>

        {/* Error notification */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex gap-2.5 items-start mb-8 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-650" />
            <span>{error}</span>
          </div>
        )}

        {categoriesList.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-6 text-center max-w-lg mx-auto">
            <p className="font-bold mb-2">No categories defined yet</p>
            <p className="text-xs mb-4">You need to create categories in the Category Manager before adding products.</p>
            <Link 
              to="/admin/categories"
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all"
            >
              Go to Category Manager
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title & Category Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Product Title*</label>
                <input
                  type="text"
                  required
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Study Table Laptop Desk"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                />
              </div>
              
              {/* Category Select Dropdown */}
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Category*</label>
                <select
                  value={formData.category}
                  onChange={handleCategorySelectChange}
                  required
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all capitalize"
                >
                  <option value="">-- Select Category --</option>
                  {categoriesList.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subcategory Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                  Subcategory <span className="text-[10px] text-neutral-400 font-medium">(Optional)</span>
                </label>
                <select
                  value={formData.subcategory}
                  disabled={!formData.category}
                  onChange={handleSubcategorySelectChange}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all capitalize disabled:bg-neutral-50 disabled:text-neutral-400"
                >
                  <option value="">-- Select Subcategory --</option>
                  {availableSubcategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              {/* Custom Slug */}
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                  Custom Slug <span className="text-neutral-400 text-[10px] font-medium">(Optional - auto-generated from title if blank)</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="e.g. nilkar-study-table"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                />
              </div>
            </div>

            {/* Pricing Block */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Current Price*</label>
                <input
                  type="text"
                  required
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. ₹449"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Original Price</label>
                <input
                  type="text"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  placeholder="e.g. ₹899"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Discount Text</label>
                <input
                  type="text"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  placeholder="e.g. 50% off"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                />
              </div>
            </div>

            {/* Rating & Review count */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Rating (0 - 5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Review Count</label>
                <input
                  type="number"
                  min="0"
                  name="reviewCount"
                  value={formData.reviewCount}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                />
              </div>
              <div className="flex items-center pt-8">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Featured Deal</span>
                </label>
              </div>
            </div>

            {/* Affiliate URL */}
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Amazon Affiliate URL*</label>
              <input
                type="url"
                required
                name="affiliateLink"
                value={formData.affiliateLink}
                onChange={handleChange}
                placeholder="https://amazon.in/dp/example"
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
              />
            </div>

            {/* Image Uploader & Preview */}
            <div className="border border-neutral-100 rounded-2xl p-6 bg-neutral-50/50">
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Product Image*</label>
              
              <div className="flex flex-col sm:flex-row items-center gap-6 mt-4">
                <div className="w-28 h-28 rounded-xl bg-white border border-neutral-200 overflow-hidden flex-shrink-0 flex items-center justify-center relative shadow-sm">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-neutral-300">No Image</span>
                  )}
                </div>

                <div className="w-full sm:w-auto">
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button
                      type="button"
                      disabled={uploadingImage}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-850 disabled:bg-neutral-900/60 text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading Image...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Choose File
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-2">
                    Supports PNG, JPG, JPEG up to 5MB. Saves directly to Cloudinary.
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-neutral-200/50">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide mb-1.5">Direct Image URL Override</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Description block */}
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Description Overview</label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe product highlights..."
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
              ></textarea>
            </div>

            {/* Submit Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-neutral-100">
              <Link
                to="/admin"
                className="px-5 py-3 text-xs font-bold text-neutral-500 hover:bg-neutral-50 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </Link>
              
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-650/60 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Deal
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}

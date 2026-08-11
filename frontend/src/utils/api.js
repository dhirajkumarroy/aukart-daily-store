const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function fetchProducts({ category, subcategory, search, featured } = {}) {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (subcategory) params.append('subcategory', subcategory);
  if (search) params.append('search', search);
  if (featured) params.append('featured', featured);

  const res = await fetch(`${API_URL}/api/products?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProduct(slug) {
  const res = await fetch(`${API_URL}/api/products/${slug}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch product details');
  }
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_URL}/api/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function logProductClick(slug) {
  const res = await fetch(`${API_URL}/api/products/click/${slug}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) throw new Error('Failed to log click redirect');
  return res.json(); // returns { affiliateLink }
}

// ==========================================
// ADMIN API CALLS
// ==========================================

export async function loginAdmin(email, password) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to authenticate admin');
  }
  return res.json(); // returns { token }
}

export async function fetchAnalytics(token) {
  const res = await fetch(`${API_URL}/api/analytics`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to fetch analytics data');
  return res.json();
}

export async function createProduct(productData, token) {
  const res = await fetch(`${API_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(productData)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to create product');
  }
  return res.json();
}

export async function updateProduct(id, productData, token) {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(productData)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to update product');
  }
  return res.json();
}

export async function deleteProduct(id, token) {
  return softDeleteProduct(id, token);
}

export async function softDeleteProduct(id, token) {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to soft delete product');
  }
  return res.json();
}

export async function restoreProduct(id, token) {
  const res = await fetch(`${API_URL}/api/products/${id}/restore`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to restore product');
  }
  return res.json();
}

export async function hardDeleteProduct(id, token) {
  const res = await fetch(`${API_URL}/api/products/${id}/hard`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to permanently delete product and Cloudinary image');
  }
  return res.json();
}

export async function uploadImage(file, token) {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to upload image file to Cloudinary');
  }
  return res.json(); // returns { imageUrl, publicId }
}

export async function fetchMasterCategories() {
  const res = await fetch(`${API_URL}/api/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories list');
  return res.json();
}

export async function createMasterCategory(name, token) {
  const res = await fetch(`${API_URL}/api/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to create category');
  }
  return res.json();
}

export async function deleteMasterCategory(id, token) {
  const res = await fetch(`${API_URL}/api/categories/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to delete category');
  return res.json();
}

export async function createMasterSubcategory(name, categoryId, token) {
  const res = await fetch(`${API_URL}/api/categories/subcategory`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name, categoryId })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to create subcategory');
  }
  return res.json();
}

export async function deleteMasterSubcategory(id, token) {
  const res = await fetch(`${API_URL}/api/categories/subcategory/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to delete subcategory');
  return res.json();
}

export async function importProductsBulk(file, token) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/api/products/import`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to import spreadsheet');
  }

  return res.json();
}

export async function downloadImportTemplate() {
  const res = await fetch(`${API_URL}/api/products/import/template`);
  if (!res.ok) throw new Error('Failed to download template');
  
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'aukart_products_template.csv';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

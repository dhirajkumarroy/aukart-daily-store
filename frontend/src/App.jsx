import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Category from './pages/Category';
import ProductDetail from './pages/ProductDetail';
import Redirect from './pages/Redirect';
import About from './pages/About';
import Disclosure from './pages/Disclosure';
import Privacy from './pages/Privacy';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ProductForm from './pages/ProductForm';
import ManageCategories from './pages/ManageCategories';
import { fetchCategories } from './utils/api';

// Helper component to scroll window to top on route transitions
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    }
    loadCategories();
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar categories={categories} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home categories={categories} />} />
            <Route path="/category/:categorySlug" element={<Category categories={categories} />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/go/:slug" element={<Redirect />} />
            <Route path="/about" element={<About />} />
            <Route path="/disclosure" element={<Disclosure />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/product/new" element={<ProductForm />} />
            <Route path="/admin/product/edit/:slug" element={<ProductForm />} />
            <Route path="/admin/categories" element={<ManageCategories />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;

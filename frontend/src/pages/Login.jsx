import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { loginAdmin } from '../utils/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect to dashboard if session token exists
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await loginAdmin(email, password);
      localStorage.setItem('adminToken', data.token);
      navigate('/admin');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login | AuKart Daily</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-[70vh] flex items-center justify-center px-4 bg-neutral-50/50 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl border border-neutral-100 p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100/50">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Admin System Access</h1>
            <p className="text-xs text-neutral-400 mt-1.5 font-medium">Please enter your database admin credentials</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex gap-2.5 items-start mb-6 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/60 text-white font-bold rounded-xl text-sm transition-colors duration-200 shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2 cursor-pointer mt-8"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

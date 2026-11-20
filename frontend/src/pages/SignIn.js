import React from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';

export default function SignIn() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const requestedPath = params.get('next') || '';
  const destination = /^\/post\/[^/\\?#]+$/.test(requestedPath) ? requestedPath : '/home';

  if (isAuthenticated) return <Navigate to={destination} replace />;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <Link to="/" className="font-spectral text-3xl font-bold">TechBlog</Link>
      <AuthModal isOpen returnTo={destination} onClose={() => navigate(destination === '/home' ? '/' : destination, { replace: true })} />
    </main>
  );
}

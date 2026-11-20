import React from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import ThemeMenu from '../components/ThemeMenu';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';

export default function SignIn() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const requestedPath = params.get('next') || '';
  const destination = /^\/post\/[^/\\?#]+$/.test(requestedPath) ? requestedPath : '/home';

  if (isAuthenticated) return <Navigate to={destination} replace />;

  const back = destination === '/home' ? '/' : destination;
  return (
    <div className="min-h-screen bg-[var(--theme-track)]">
      <header className="border-b border-[var(--theme-line)] bg-[var(--theme-panel)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" className="font-spectral text-3xl font-bold">TechBlog</Link>
          <ThemeMenu />
        </div>
      </header>
      <main className="mx-auto max-w-[30rem] px-4 py-6 sm:py-10">
        <Link to={back} className="mb-4 inline-block text-sm font-medium text-[var(--theme-muted)] hover:underline">
          <span aria-hidden="true">← </span>{back === '/' ? 'Back to stories' : 'Back to article'}
        </Link>
        <AuthModal standalone isOpen returnTo={destination} onClose={() => navigate(back, { replace: true })} />
        <nav aria-label="Legal" className="mt-5 flex justify-center gap-5 text-xs text-[var(--theme-muted)]">
          <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
          <Link to="/terms" className="hover:underline">Terms of Service</Link>
        </nav>
      </main>
    </div>
  );
}

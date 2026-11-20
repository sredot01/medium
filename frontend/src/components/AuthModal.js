import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getGitHubLoginStatus, githubLoginUrl, requestSignup, requestPasswordReset } from '../api/api';

const titles = { signin: 'Welcome back.', signup: 'Join TechBlog.', reset: 'Reset your password' };
const actions = { signin: 'Sign in', signup: 'Send verification link', reset: 'Send reset link' };

export default function AuthModal({ isOpen, onClose, mode: initialMode = 'signin', returnTo = '/home' }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [githubEnabled, setGitHubEnabled] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    setMode(initialMode);
    setError('');
    setNotice('');
    let active = true;
    getGitHubLoginStatus()
      .then(({ data }) => { if (active) setGitHubEnabled(data.enabled === true); })
      .catch(() => { if (active) setGitHubEnabled(false); });
    return () => { active = false; };
  }, [isOpen, initialMode]);

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setNotice('');
    setPassword('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        const result = await login(email, password);
        if (result.success) {
          onClose();
          navigate(returnTo, { replace: true });
        } else {
          setError(result.error);
        }
        return;
      }
      const request = mode === 'signup' ? requestSignup : requestPasswordReset;
      const { data } = await request(email);
      setNotice(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <button type="button" onClick={onClose} aria-label="Close sign-in dialog" className="absolute right-6 top-6 p-2 text-2xl text-gray-600">×</button>
      <div className="w-full max-w-[680px] px-6">
        <h2 id="auth-title" className="mb-8 text-center font-spectral text-[32px] font-bold text-gray-900">{titles[mode]}</h2>
        {githubEnabled && mode !== 'reset' && (
          <a href={githubLoginUrl} className="mb-6 block rounded-full border border-gray-300 px-4 py-3 text-center text-sm font-medium hover:bg-gray-50">
            Continue with GitHub
          </a>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input aria-label="Email" type="email" autoComplete="email" placeholder="Email" value={email} onChange={event => setEmail(event.target.value)} className="w-full rounded border border-gray-300 px-4 py-3" required />
          {mode === 'signin' && (
            <input aria-label="Password" type="password" autoComplete="current-password" placeholder="Password" value={password} onChange={event => setPassword(event.target.value)} className="w-full rounded border border-gray-300 px-4 py-3" required />
          )}
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          {notice && <p role="status" className="text-sm text-green-700">{notice}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-full bg-black px-4 py-3 font-medium text-white hover:bg-gray-900 disabled:opacity-50">
            {loading ? 'Please wait…' : actions[mode]}
          </button>
        </form>
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-green-700">
          {mode === 'signin' ? (
            <>
              <button type="button" disabled={loading} onClick={() => changeMode('reset')} className="hover:underline">Forgot password?</button>
              <button type="button" disabled={loading} onClick={() => changeMode('signup')} className="hover:underline">Create an account</button>
            </>
          ) : (
            <button type="button" disabled={loading} onClick={() => changeMode('signin')} className="hover:underline">Back to sign in</button>
          )}
        </div>
        {mode === 'signup' && (
          <p className="mt-8 text-center text-xs text-gray-500">
            By creating an account, you agree to the <a href="/terms" className="underline">Terms of Service</a> and acknowledge the <a href="/privacy" className="underline">Privacy Policy</a>.
          </p>
        )}
      </div>
    </div>
  );
}

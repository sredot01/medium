import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getGitHubLoginStatus, githubLoginUrl, getGoogleLoginStatus, googleLoginUrl, requestSignup, requestPasswordReset } from '../api/api';

const titles = { signin: 'Welcome back.', signup: 'Join TechBlog.', reset: 'Reset your password' };
const actions = { signin: 'Sign in', signup: 'Send verification link', reset: 'Send reset link' };

export default function AuthModal({ isOpen, onClose, mode: initialMode = 'signin', returnTo = '/home', standalone = false }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [githubEnabled, setGitHubEnabled] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
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
    getGoogleLoginStatus()
      .then(({ data }) => { if (active) setGoogleEnabled(data.enabled === true); })
      .catch(() => { if (active) setGoogleEnabled(false); });
    return () => { active = false; };
  }, [isOpen, initialMode]);

  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!standalone && isOpen && dialog && !dialog.open) dialog.showModal();
    return () => { if (dialog?.open) dialog.close(); };
  }, [isOpen, standalone]);

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

  const showProviders = mode !== 'reset' && (googleEnabled || githubEnabled);
  const panel = (
    <section className="auth-card" aria-labelledby="auth-title">
      {!standalone && <button type="button" onClick={onClose} aria-label="Close sign-in dialog" className="auth-close">×</button>}
      <h1 id="auth-title" className="font-spectral text-4xl font-semibold tracking-tight">{titles[mode]}</h1>
      {mode === 'reset' && <p className="mt-3 text-sm text-[var(--theme-muted)]">Enter your email to receive a password reset link.</p>}
      {showProviders && (
        <div className="mt-6 space-y-2.5">
          {googleEnabled && <a href={googleLoginUrl} className="auth-provider"><span aria-hidden="true" className="auth-provider-mark">G</span>Continue with Google</a>}
          {githubEnabled && <a href={githubLoginUrl} className="auth-provider"><span aria-hidden="true" className="auth-provider-mark">GH</span>Continue with GitHub</a>}
          <div className="auth-divider"><span>or use email</span></div>
        </div>
      )}
      <form onSubmit={handleSubmit} className={'space-y-4 ' + (showProviders ? '' : 'mt-6')}>
        <label className="auth-field">
          Email address
          <input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={event => setEmail(event.target.value)} required />
        </label>
        {mode === 'signin' && (
          <label className="auth-field">
            Password
            <input type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required />
          </label>
        )}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {notice && <p role="status" className="text-sm text-[var(--theme-accent)]">{notice}</p>}
        <button type="submit" disabled={loading} className="landing-primary w-full disabled:opacity-50">
          {loading ? 'Please wait…' : actions[mode]}
        </button>
      </form>
      <div className="mt-5 flex flex-wrap justify-between gap-3 text-sm font-medium text-[var(--theme-accent)]">
        {mode === 'signin' ? (
          <>
            <button type="button" disabled={loading} onClick={() => changeMode('reset')} className="hover:underline">Forgot password?</button>
            <button type="button" disabled={loading} onClick={() => changeMode('signup')} className="hover:underline">Create an account</button>
          </>
        ) : <button type="button" disabled={loading} onClick={() => changeMode('signin')} className="hover:underline">Back to sign in</button>}
      </div>
      {mode === 'signup' && (
        <p className="mt-6 text-xs leading-relaxed text-[var(--theme-muted)]">
          By creating an account, you agree to the <a href="/terms" className="underline">Terms of Service</a> and acknowledge the <a href="/privacy" className="underline">Privacy Policy</a>.
        </p>
      )}
    </section>
  );

  if (standalone) return panel;

  return (
    <dialog ref={dialogRef} className="auth-dialog" aria-labelledby="auth-title" onCancel={event => { event.preventDefault(); onClose(); }}>
      {panel}
    </dialog>
  );
}

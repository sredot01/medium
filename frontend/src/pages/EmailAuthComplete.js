import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { resetPassword, verifySignup } from '../api/api';

export default function EmailAuthComplete({ isSignup = false }) {
  const { hash } = useLocation();
  const token = hash.slice(1);
  const validToken = /^[\w-]{43}$/.test(token);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = isSignup
        ? await verifySignup({ token, name, password })
        : await resetPassword({ token, password });
      setPassword('');
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-lg px-6 py-20">
      <h1 className="mb-6 text-3xl font-bold">{isSignup ? 'Verify your email' : 'Choose a new password'}</h1>
      {validToken && !message && (
        <form onSubmit={submit} className="space-y-4">
          {isSignup && (
            <label className="block">
              Name
              <input className="mt-1 block w-full rounded border p-3" value={name} onChange={e => setName(e.target.value)} autoComplete="name" maxLength={100} required />
            </label>
          )}
          <label className="block">
            New password
            <input className="mt-1 block w-full rounded border p-3" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" minLength={8} required />
          </label>
          {error && <p role="alert" className="text-red-700">{error}</p>}
          <button className="rounded-full bg-black px-5 py-3 text-white disabled:opacity-50" disabled={loading}>
            {loading ? 'Saving…' : isSignup ? 'Create account' : 'Reset password'}
          </button>
        </form>
      )}
      {message && <p role="status">{message}</p>}
      {!validToken && <p role="alert">This link is invalid. Return to TechBlog to request a new one.</p>}
      <Link to="/" className="mt-6 inline-block underline">Back to TechBlog</Link>
    </main>
  );
}

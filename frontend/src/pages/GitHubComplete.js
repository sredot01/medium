import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const messages = {
  expired: 'The GitHub sign-in request expired. Try signing in again.',
  cancelled: 'GitHub sign-in was cancelled.',
  email: 'Verify your primary email address on GitHub and try again.',
  existing: 'An account already uses this email address. Sign in with your existing password.',
  failed: 'GitHub sign-in failed. Please try again.'
};

export default function GitHubComplete({ google = false }) {
  const { completeGitHubLogin, completeGoogleLogin } = useAuth();
  const { search } = useLocation();
  const navigate = useNavigate();
  const reason = new URLSearchParams(search).get('error');
  const [failed, setFailed] = useState(false);

  const provider = google ? 'Google' : 'GitHub';
  const completeLogin = google ? completeGoogleLogin : completeGitHubLogin;
  const exchange = useRef(null);

  useEffect(() => {
    if (reason) return;
    exchange.current ??= completeLogin();
    exchange.current
      .then(() => navigate('/home', { replace: true }))
      .catch(() => setFailed(true));
  }, [reason, completeLogin, navigate]);

  return (
    <main className="mx-auto max-w-lg px-6 py-20" aria-live="polite">
      <p>{failed || reason ? (Object.hasOwn(messages, reason) ? messages[reason] : messages.failed).replaceAll('GitHub', provider) : `Finishing ${provider} sign-in…`}</p>
      {(failed || reason) && <Link className="mt-4 inline-block underline" to="/">Back to the homepage</Link>}
    </main>
  );
}

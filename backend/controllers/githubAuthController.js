const { createHash, randomBytes, timingSafeEqual } = require('node:crypto');
const User = require('../models/User');
const { generateToken } = require('./authController');
const jwt = require('jsonwebtoken');

const flowCookie = '__Host-techblog-github';
const sessionCookie = '__Host-techblog-github-session';
const cookieOptions = { httpOnly: true, secure: true, sameSite: 'lax', path: '/' };
const completionPath = '/auth/github/complete';

function config() {
  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, APP_ORIGIN, JWT_SECRET } = process.env;
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !APP_ORIGIN || !JWT_SECRET) return null;
  const origin = new URL(APP_ORIGIN).origin;
  return {
    origin,
    clientId: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    redirectUri: origin + '/api/auth/github/callback',
    signingKey: JWT_SECRET
  };
}

async function githubJson(url, options) {
  const response = await fetch(url, { ...options, redirect: 'manual' });
  if (!response.ok) {
    const error = new Error('GitHub request failed');
    error.status = response.status;
    throw error;
  }
  return response.json();
}

exports.status = (req, res) => {
  res.set('Cache-Control', 'no-store').json({ enabled: Boolean(config()) });
};

exports.start = (req, res) => {
  res.set('Cache-Control', 'no-store');
  const settings = config();
  if (!settings) return res.status(503).json({ message: 'GitHub sign-in is unavailable.' });

  const state = randomBytes(32).toString('base64url');
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  res.cookie(flowCookie, state + '.' + verifier, { ...cookieOptions, maxAge: 600000 });
  const url = new URL('https://github.com/login/oauth/authorize');
  url.search = new URLSearchParams({
    client_id: settings.clientId,
    redirect_uri: settings.redirectUri,
    scope: 'user:email',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256'
  });
  return res.redirect(url.toString());
};

exports.callback = async (req, res) => {
  res.set({ 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' });
  res.clearCookie(flowCookie, cookieOptions);
  res.clearCookie(sessionCookie, cookieOptions);
  const settings = config();
  const fail = (reason) => res.redirect(303, completionPath + '?error=' + reason);
  const [expectedState, verifier] = (req.cookies[flowCookie] || '').split('.');
  const { code, state } = req.query;
  if (!settings || !verifier || typeof state !== 'string' || !/^[\w-]{43}$/.test(state) ||
      !/^[\w-]{43}$/.test(expectedState) || !timingSafeEqual(Buffer.from(state), Buffer.from(expectedState))) {
    return fail('expired');
  }
  if (typeof code !== 'string' || !code || req.query.error) return fail('cancelled');

  let stage = 'token';
  try {
    const result = await githubJson('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'TechBlog-OAuth' },
      body: new URLSearchParams({
        client_id: settings.clientId,
        client_secret: settings.clientSecret,
        redirect_uri: settings.redirectUri,
        code,
        code_verifier: verifier
      }).toString()
    });
    if (typeof result.access_token !== 'string') {
      const reason = ['bad_verification_code', 'incorrect_client_credentials', 'redirect_uri_mismatch', 'bad_code_verifier'].includes(result.error)
        ? result.error
        : 'token_rejected';
      console.warn('GitHub OAuth token rejected:', reason);
      return fail(reason);
    }
    stage = 'profile';
    const headers = {
      Accept: 'application/vnd.github+json',
      Authorization: 'Bearer ' + result.access_token,
      'User-Agent': 'TechBlog-OAuth'
    };
    const [profile, emails] = await Promise.all([
      githubJson('https://api.github.com/user', { headers }),
      githubJson('https://api.github.com/user/emails', { headers })
    ]);
    if (!Number.isSafeInteger(profile.id) || profile.id <= 0) return fail('failed');
    const email = emails.find(entry => entry.primary && entry.verified)?.email;
    if (!email) return fail('email');

    stage = 'account';
    const id = 'github:' + profile.id;
    let user = User.findById(id);
    if (!user) {
      if (User.findByEmail(email)) return fail('existing');
      user = User.createGitHub({ id, email, name: profile.name || profile.login });
    }

    stage = 'session';
    const ticket = jwt.sign({ sub: user.id, aud: 'github-exchange' }, settings.signingKey, {
      algorithm: 'HS256',
      expiresIn: '60s'
    });
    res.cookie(sessionCookie, ticket, { ...cookieOptions, maxAge: 60000 });
    return res.redirect(303, completionPath);
  } catch (error) {
    const reason = error?.status || ({
      TypeError: 'network',
      SyntaxError: 'response',
      ReferenceError: 'runtime',
      Error: 'internal'
    })[error?.name] || 'unknown';
    console.warn('GitHub OAuth callback failed:', stage, reason);
    return fail(stage + '_failed_' + reason);
  }
};

exports.exchange = (req, res) => {
  res.set('Cache-Control', 'no-store');
  const settings = config();
  if (!settings || req.get('origin') !== settings.origin) return res.sendStatus(403);
  const ticket = req.cookies[sessionCookie];
  res.clearCookie(sessionCookie, cookieOptions);
  try {
    const { sub } = jwt.verify(ticket, settings.signingKey, {
      audience: 'github-exchange',
      algorithms: ['HS256']
    });
    const user = User.findById(sub);
    if (user) {
      return res.json({ data: { user: User.getSafeUser(user), token: generateToken(user.id) } });
    }
  } catch {
    // Missing or expired handoff cookie.
  }
  return res.sendStatus(401);
};

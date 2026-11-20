const { createHash, randomBytes, timingSafeEqual } = require('node:crypto');
const User = require('../models/User');
const { generateToken } = require('./authController');
const jwt = require('jsonwebtoken');

const flowCookie = '__Host-techblog-google';
const sessionCookie = '__Host-techblog-google-session';
const cookieOptions = { httpOnly: true, secure: true, sameSite: 'lax', path: '/' };
const completionPath = '/auth/google/complete';

function config() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_APP_ORIGIN, JWT_SECRET } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_APP_ORIGIN || !JWT_SECRET) return null;
  const origin = new URL(GOOGLE_APP_ORIGIN).origin;
  return {
    origin,
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    redirectUri: origin + '/api/auth/google/callback',
    signingKey: JWT_SECRET
  };
}

async function googleJson(url, options) {
  const response = await fetch(url, { ...options, redirect: 'manual' });
  if (!response.ok) {
    const error = new Error('Google request failed');
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
  if (!settings) return res.status(503).json({ message: 'Google sign-in is unavailable.' });

  const state = randomBytes(32).toString('base64url');
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  res.cookie(flowCookie, state + '.' + verifier, { ...cookieOptions, maxAge: 600000 });
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.search = new URLSearchParams({
    client_id: settings.clientId,
    redirect_uri: settings.redirectUri,
    scope: 'openid email profile',
    response_type: 'code',
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
    const result = await googleJson('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'TechBlog-OAuth' },
      body: new URLSearchParams({
        client_id: settings.clientId,
        client_secret: settings.clientSecret,
        redirect_uri: settings.redirectUri,
        grant_type: 'authorization_code',
        code,
        code_verifier: verifier
      }).toString()
    });
    if (typeof result.access_token !== 'string') return fail('failed');

    stage = 'profile';
    const profile = await googleJson('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: 'Bearer ' + result.access_token }
    });
    if (typeof profile.sub !== 'string' || !profile.sub || profile.sub.length > 255) return fail('failed');
    const email = profile.email;
    if (profile.email_verified !== true || typeof email !== 'string' || !email) return fail('email');

    stage = 'account';
    const id = 'google:' + profile.sub;
    let user = User.findById(id);
    if (!user) {
      if (User.findByEmail(email)) return fail('existing');
      user = User.createOAuth({ id, email, name: profile.name || email.split('@')[0] });
    }

    stage = 'session';
    const ticket = jwt.sign({ sub: user.id, aud: 'google-exchange' }, settings.signingKey, {
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
    console.warn('Google OAuth callback failed:', stage, reason);
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
      audience: 'google-exchange',
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

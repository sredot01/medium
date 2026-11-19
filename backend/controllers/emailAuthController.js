const { createHash, randomBytes, randomUUID } = require('node:crypto');
const bcrypt = require('bcryptjs');
const { getDB, saveDatabase } = require('../config/database');
const User = require('../models/User');

const digest = (value) => createHash('sha256').update(value).digest('hex');
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const tokenPattern = /^[\w-]{43}$/;
const genericMessage = 'If this address is eligible, we’ll email you a link. Check your inbox and spam folder.';
const lifetimes = { signup: 3600000, reset: 1800000 };

function requestEmail(purpose) {
  return async (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (email.length > 254 || !emailPattern.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }
    const { APP_ORIGIN, RESEND_API_KEY, RESEND_FROM, RESEND_REPLY_TO } = process.env;
    if (!APP_ORIGIN || !RESEND_API_KEY || !RESEND_FROM) {
      return res.status(503).json({ message: 'Email is temporarily unavailable.' });
    }
    const user = User.findByEmail(email);
    const accepted = () => res.status(202).json({ message: genericMessage });
    if (purpose === 'signup' ? user : !user || user.password === 'github-oauth-only') return accepted();

    const db = getDB();
    const now = Date.now();
    const token = randomBytes(32).toString('base64url');
    const tokenHash = digest(token);
    db.run('DELETE FROM email_auth_tokens WHERE expires_at <= ?', [now]);
    const inserted = db.exec(`
      INSERT INTO email_auth_tokens (purpose, email, token_hash, expires_at, requested_at, account_version)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT (purpose, email) DO UPDATE SET
        token_hash = excluded.token_hash, expires_at = excluded.expires_at,
        requested_at = excluded.requested_at, account_version = excluded.account_version
      WHERE email_auth_tokens.requested_at <= ?
      RETURNING token_hash
    `, [purpose, email, tokenHash, now + lifetimes[purpose], now,
      user ? digest(user.id + ':' + user.password) : null, now - 60000]);
    if (!inserted.length) return accepted();
    saveDatabase();

    const link = new URL('/auth/email/' + purpose, APP_ORIGIN);
    link.hash = token;
    const title = purpose === 'signup' ? 'Verify your email for TechBlog' : 'Reset your TechBlog password';
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        redirect: 'manual',
        headers: {
          Authorization: 'Bearer ' + RESEND_API_KEY,
          'Content-Type': 'application/json',
          'Idempotency-Key': 'techblog-' + tokenHash
        },
        body: JSON.stringify({
          from: RESEND_FROM,
          to: [email],
          reply_to: RESEND_REPLY_TO,
          subject: title,
          text: title + '\n\n' + link.href +
            '\n\nThis link expires in ' + lifetimes[purpose] / 60000 +
            ' minutes. If you did not request it, you can ignore this email.'
        })
      });
      if (!response.ok) throw new Error('Resend rejected the email');
    } catch {
      db.run('DELETE FROM email_auth_tokens WHERE token_hash = ?', [tokenHash]);
      saveDatabase();
      console.warn('TechBlog email request failed:', purpose);
    }
    return accepted();
  };
}

function completeEmail(purpose) {
  return async (req, res) => {
    const { token, password, name } = req.body || {};
    const invalidLink = () => res.status(400).json({ message: 'This link is invalid or expired. Request a new one.' });
    if (typeof token !== 'string' || !tokenPattern.test(token)) return invalidLink();
    if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password) > 72) {
      return res.status(400).json({ message: 'Use a password with at least 8 characters and at most 72 bytes.' });
    }
    if (purpose === 'signup' && (typeof name !== 'string' || !name.trim() || name.length > 100)) {
      return res.status(400).json({ message: 'Enter a name of up to 100 characters.' });
    }

    const db = getDB();
    const hash = digest(token);
    if (!db.exec('SELECT 1 FROM email_auth_tokens WHERE purpose = ? AND token_hash = ? AND expires_at > ?',
      [purpose, hash, Date.now()]).length) return invalidLink();
    const passwordHash = await bcrypt.hash(password, 10);
    const [entry] = db.exec(`
      DELETE FROM email_auth_tokens WHERE purpose = ? AND token_hash = ? AND expires_at > ?
      RETURNING email, account_version
    `, [purpose, hash, Date.now()]);
    if (!entry) return invalidLink();
    const [[email, accountVersion]] = entry.values;
    const user = User.findByEmail(email);
    const now = new Date().toISOString();
    if (purpose === 'signup' && !user) {
      db.run(`
        INSERT INTO users (id, email, password, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)
      `, [randomUUID(), email, passwordHash, name.trim(), now, now]);
    } else if (purpose === 'reset' && user && accountVersion === digest(user.id + ':' + user.password)) {
      db.run('UPDATE users SET password = ?, updated_at = ?, session_version = session_version + 1 WHERE id = ?', [passwordHash, now, user.id]);
    } else {
      saveDatabase();
      return invalidLink();
    }

    saveDatabase();
    return res.json({ message: purpose === 'signup' ? 'Email verified. You can sign in now.' : 'Password updated. You can sign in now.' });
  };
}

exports.signup = requestEmail('signup');
exports.forgotPassword = requestEmail('reset');
exports.verifyEmail = completeEmail('signup');
exports.resetPassword = completeEmail('reset');

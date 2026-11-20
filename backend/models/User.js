const { getDB, saveDatabase } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Create new user
  static async create(data) {
    const db = getDB();
    const id = Date.now().toString();
    const now = new Date().toISOString();

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    try {
      db.run(`
        INSERT INTO users (id, email, password, name, avatar, bio, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        data.email.toLowerCase(),
        hashedPassword,
        data.name,
        data.avatar || null,
        data.bio || '',
        now,
        now
      ]);

      saveDatabase();
      return User.findById(id);
    } catch (error) {
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  static createGitHub(data) {
    return User.createOAuth(data);
  }

  static createOAuth({ id, email, name }) {
    const now = new Date().toISOString();
    getDB().run(
      'INSERT INTO users (id, email, password, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, email.toLowerCase(), id.startsWith('github:') ? 'github-oauth-only' : 'google-oauth-only', name, now, now]
    );
    saveDatabase();
    return User.findById(id);
  }

  // Find user by ID
  static findById(id) {
    const db = getDB();
    const result = db.exec('SELECT * FROM users WHERE id = ?', [id]);

    if (result.length === 0 || result[0].values.length === 0) return null;
    return User.rowToUser(result[0].values[0]);
  }

  // Find user by email
  static findByEmail(email) {
    const db = getDB();
    const result = db.exec('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);

    if (result.length === 0 || result[0].values.length === 0) return null;
    return User.rowToUser(result[0].values[0]);
  }

  // Get all users
  static findAll() {
    const db = getDB();
    const result = db.exec('SELECT * FROM users ORDER BY created_at DESC');

    if (result.length === 0) return [];
    return result[0].values.map(User.rowToUser);
  }

  // Update user
  static async update(id, data) {
    const existingUser = User.findById(id);
    if (!existingUser) return null;

    const db = getDB();
    const updatedAt = new Date().toISOString();

    // If password is being updated, hash it
    let password = existingUser.password;
    if (data.password) {
      password = await bcrypt.hash(data.password, 10);
    }

    db.run(`
      UPDATE users
      SET name = ?, email = ?, avatar = ?, bio = ?, password = ?, updated_at = ?
      WHERE id = ?
    `, [
      data.name ?? existingUser.name,
      data.email ?? existingUser.email,
      data.avatar ?? existingUser.avatar,
      data.bio ?? existingUser.bio,
      password,
      updatedAt,
      id
    ]);

    saveDatabase();
    return User.findById(id);
  }

  // Delete user
  static delete(id) {
    const db = getDB();
    db.run('DELETE FROM users WHERE id = ?', [id]);
    saveDatabase();
    return true;
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    if (hashedPassword === id.startsWith('github:') ? 'github-oauth-only' : 'google-oauth-only') return false;
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Convert database row to User object
  static rowToUser(row) {
    return {
      id: row[0],
      email: row[1],
      password: row[2], // This should not be sent to frontend
      name: row[3],
      avatar: row[4] || null,
      bio: row[5] || '',
      createdAt: row[6],
      updatedAt: row[7],
      sessionVersion: row[8] ?? 0,
    };
  }

  // Get safe user object (without password)
  static getSafeUser(user) {
    const { password, sessionVersion, ...safeUser } = user;
    return safeUser;
  }
}

module.exports = User;


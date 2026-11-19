const { getDB, saveDatabase } = require('../config/database');

class Like {
  // Add like
  static create(userId, postId) {
    const db = getDB();
    const id = Date.now().toString();
    const now = new Date().toISOString();

    try {
      db.run(`
        INSERT INTO likes (id, user_id, post_id, created_at)
        VALUES (?, ?, ?, ?)
      `, [id, userId, postId, now]);

      saveDatabase();
      return { id, userId, postId, createdAt: now };
    } catch (error) {
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        throw new Error('Already liked');
      }
      throw error;
    }
  }

  // Remove like
  static delete(userId, postId) {
    const db = getDB();
    db.run('DELETE FROM likes WHERE user_id = ? AND post_id = ?', [userId, postId]);
    saveDatabase();
    return true;
  }

  // Get likes count for a post
  static getPostLikesCount(postId) {
    const db = getDB();
    const result = db.exec('SELECT COUNT(*) as count FROM likes WHERE post_id = ?', [postId]);

    if (result.length === 0 || result[0].values.length === 0) return 0;
    return result[0].values[0][0];
  }

  // Check if user liked a post
  static hasUserLiked(userId, postId) {
    const db = getDB();
    const result = db.exec('SELECT COUNT(*) as count FROM likes WHERE user_id = ? AND post_id = ?', [userId, postId]);

    if (result.length === 0 || result[0].values.length === 0) return false;
    return result[0].values[0][0] > 0;
  }

  // Get all likes for a post with user info
  static getPostLikes(postId) {
    const db = getDB();
    const result = db.exec(`
      SELECT l.id, l.user_id, l.created_at, u.name, u.avatar
      FROM likes l
      JOIN users u ON l.user_id = u.id
      WHERE l.post_id = ?
      ORDER BY l.created_at DESC
    `, [postId]);

    if (result.length === 0) return [];
    return result[0].values.map(row => ({
      id: row[0],
      userId: row[1],
      createdAt: row[2],
      user: {
        name: row[3],
        avatar: row[4]
      }
    }));
  }
}

module.exports = Like;


const { getDB, saveDatabase } = require('../config/database');

class Follow {
  // Follow a user
  static create(followerId, followingId) {
    const db = getDB();
    const id = Date.now().toString();
    const now = new Date().toISOString();

    // Can't follow yourself
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    try {
      db.run(`
        INSERT INTO follows (id, follower_id, following_id, created_at)
        VALUES (?, ?, ?, ?)
      `, [id, followerId, followingId, now]);

      saveDatabase();
      return { id, followerId, followingId, createdAt: now };
    } catch (error) {
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        throw new Error('Already following this user');
      }
      throw error;
    }
  }

  // Unfollow a user
  static delete(followerId, followingId) {
    const db = getDB();
    db.run('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [followerId, followingId]);
    saveDatabase();
    return true;
  }

  // Check if user is following another user
  static isFollowing(followerId, followingId) {
    const db = getDB();
    const result = db.exec('SELECT COUNT(*) as count FROM follows WHERE follower_id = ? AND following_id = ?', [followerId, followingId]);

    if (result.length === 0 || result[0].values.length === 0) return false;
    return result[0].values[0][0] > 0;
  }

  // Get followers of a user
  static getFollowers(userId) {
    const db = getDB();
    const result = db.exec(`
      SELECT f.id, f.follower_id, f.created_at, u.name, u.email, u.avatar, u.bio
      FROM follows f
      JOIN users u ON f.follower_id = u.id
      WHERE f.following_id = ?
      ORDER BY f.created_at DESC
    `, [userId]);

    if (result.length === 0) return [];
    return result[0].values.map(row => ({
      id: row[0],
      followerId: row[1],
      createdAt: row[2],
      follower: {
        id: row[1],
        name: row[3],
        email: row[4],
        avatar: row[5],
        bio: row[6]
      }
    }));
  }

  // Get users that a user is following
  static getFollowing(userId) {
    const db = getDB();
    const result = db.exec(`
      SELECT f.id, f.following_id, f.created_at, u.name, u.email, u.avatar, u.bio
      FROM follows f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = ?
      ORDER BY f.created_at DESC
    `, [userId]);

    if (result.length === 0) return [];
    return result[0].values.map(row => ({
      id: row[0],
      followingId: row[1],
      createdAt: row[2],
      following: {
        id: row[1],
        name: row[3],
        email: row[4],
        avatar: row[5],
        bio: row[6]
      }
    }));
  }

  // Get follower count
  static getFollowerCount(userId) {
    const db = getDB();
    const result = db.exec('SELECT COUNT(*) as count FROM follows WHERE following_id = ?', [userId]);

    if (result.length === 0 || result[0].values.length === 0) return 0;
    return result[0].values[0][0];
  }

  // Get following count
  static getFollowingCount(userId) {
    const db = getDB();
    const result = db.exec('SELECT COUNT(*) as count FROM follows WHERE follower_id = ?', [userId]);

    if (result.length === 0 || result[0].values.length === 0) return 0;
    return result[0].values[0][0];
  }
}

module.exports = Follow;


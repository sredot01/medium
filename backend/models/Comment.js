const { getDB, saveDatabase } = require('../config/database');

class Comment {
  // Create comment
  static create(data) {
    const db = getDB();
    const id = Date.now().toString();
    const now = new Date().toISOString();

    db.run(`
      INSERT INTO comments (id, user_id, post_id, content, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, data.userId, data.postId, data.content, now, now]);

    saveDatabase();
    return Comment.findById(id);
  }

  // Find comment by ID
  static findById(id) {
    const db = getDB();
    const result = db.exec(`
      SELECT c.*, u.name as user_name, u.avatar as user_avatar
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [id]);

    if (result.length === 0 || result[0].values.length === 0) return null;
    return Comment.rowToComment(result[0].values[0]);
  }

  // Get all comments for a post
  static getPostComments(postId) {
    const db = getDB();
    const result = db.exec(`
      SELECT c.*, u.name as user_name, u.avatar as user_avatar
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at DESC
    `, [postId]);

    if (result.length === 0) return [];
    return result[0].values.map(Comment.rowToComment);
  }

  // Get comments count for a post
  static getPostCommentsCount(postId) {
    const db = getDB();
    const result = db.exec('SELECT COUNT(*) as count FROM comments WHERE post_id = ?', [postId]);

    if (result.length === 0 || result[0].values.length === 0) return 0;
    return result[0].values[0][0];
  }

  // Update comment
  static update(id, content) {
    const db = getDB();
    const updatedAt = new Date().toISOString();

    db.run(`
      UPDATE comments
      SET content = ?, updated_at = ?
      WHERE id = ?
    `, [content, updatedAt, id]);

    saveDatabase();
    return Comment.findById(id);
  }

  // Delete comment
  static delete(id) {
    const db = getDB();
    db.run('DELETE FROM comments WHERE id = ?', [id]);
    saveDatabase();
    return true;
  }

  // Convert row to comment object
  static rowToComment(row) {
    return {
      id: row[0],
      userId: row[1],
      postId: row[2],
      content: row[3],
      createdAt: row[4],
      updatedAt: row[5],
      user: {
        name: row[6],
        avatar: row[7]
      }
    };
  }
}

module.exports = Comment;


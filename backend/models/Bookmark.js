const { getDB, saveDatabase } = require('../config/database');

class Bookmark {
  // Create a bookmark
  static create(userId, postId) {
    const db = getDB();
    const id = Date.now().toString();
    const now = new Date().toISOString();

    try {
      db.run(`
        INSERT INTO bookmarks (id, user_id, post_id, created_at)
        VALUES (?, ?, ?, ?)
      `, [id, userId, postId, now]);

      saveDatabase();
      return { id, userId, postId, createdAt: now };
    } catch (error) {
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        throw new Error('Post already bookmarked');
      }
      throw error;
    }
  }

  // Delete a bookmark
  static delete(userId, postId) {
    const db = getDB();
    db.run('DELETE FROM bookmarks WHERE user_id = ? AND post_id = ?', [userId, postId]);
    saveDatabase();
    return true;
  }

  // Check if user has bookmarked a post
  static hasBookmarked(userId, postId) {
    const db = getDB();
    const result = db.exec('SELECT COUNT(*) as count FROM bookmarks WHERE user_id = ? AND post_id = ?', [userId, postId]);

    if (result.length === 0 || result[0].values.length === 0) return false;
    return result[0].values[0][0] > 0;
  }

  // Get user's bookmarks with full post details
  static getUserBookmarks(userId) {
    const db = getDB();
    const result = db.exec(`
      SELECT 
        p.id,
        p.slug,
        p.title,
        p.content,
        p.excerpt,
        p.author,
        p.user_id,
        p.category,
        p.cover_image,
        p.created_at,
        p.updated_at,
        p.read_time,
        p.featured
      FROM bookmarks b
      JOIN posts p ON b.post_id = p.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `, [userId]);

    if (result.length === 0) return [];
    
    // Import Post and Like/Comment models for counts
    const Post = require('./Post');
    const Like = require('./Like');
    const Comment = require('./Comment');
    
    return result[0].values.map(row => {
      const postId = row[0];
      return {
        id: postId,
        slug: row[1],
        title: row[2],
        content: row[3],
        excerpt: row[4] || '',
        author: row[5],
        userId: row[6],
        authorAvatar: Post.getUserAvatar(row[6]),
        category: row[7] || '',
        coverImage: row[8] || '',
        createdAt: row[9],
        updatedAt: row[10],
        readTime: row[11],
        featured: row[12] === 1 || row[12] === '1',
        tags: Post.getPostTags(postId),
        likeCount: Like.getPostLikesCount(postId),
        commentCount: Comment.getPostCommentsCount(postId),
      };
    });
  }

  // Get bookmark count for a post
  static getPostBookmarkCount(postId) {
    const db = getDB();
    const result = db.exec('SELECT COUNT(*) as count FROM bookmarks WHERE post_id = ?', [postId]);

    if (result.length === 0 || result[0].values.length === 0) return 0;
    return result[0].values[0][0];
  }
}

module.exports = Bookmark;


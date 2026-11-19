const { getDB, saveDatabase } = require('../config/database');

class Stats {
  // Record a view (when someone lands on the post)
  static recordView(postId, userId = null) {
    const db = getDB();
    const viewId = Date.now().toString();
    const timestamp = new Date().toISOString();

    try {
      db.run(`
        INSERT INTO post_views (id, post_id, user_id, viewed_at)
        VALUES (?, ?, ?, ?)
      `, [viewId, postId, userId, timestamp]);
      
      saveDatabase();
      return { success: true };
    } catch (error) {
      console.error('Error recording view:', error);
      return { success: false, error };
    }
  }

  // Record a read (when someone scrolls through or spends time reading)
  static recordRead(postId, userId = null) {
    const db = getDB();
    const readId = Date.now().toString();
    const timestamp = new Date().toISOString();

    try {
      db.run(`
        INSERT INTO post_reads (id, post_id, user_id, read_at)
        VALUES (?, ?, ?, ?)
      `, [readId, postId, userId, timestamp]);
      
      saveDatabase();
      return { success: true };
    } catch (error) {
      console.error('Error recording read:', error);
      return { success: false, error };
    }
  }

  // Get view count for a post
  static getViewCount(postId) {
    const db = getDB();
    try {
      const result = db.exec(`
        SELECT COUNT(*) as count FROM post_views WHERE post_id = ?
      `, [postId]);
      
      if (result.length > 0 && result[0].values.length > 0) {
        return result[0].values[0][0];
      }
      return 0;
    } catch (error) {
      console.error('Error getting view count:', error);
      return 0;
    }
  }

  // Get read count for a post
  static getReadCount(postId) {
    const db = getDB();
    try {
      const result = db.exec(`
        SELECT COUNT(*) as count FROM post_reads WHERE post_id = ?
      `, [postId]);
      
      if (result.length > 0 && result[0].values.length > 0) {
        return result[0].values[0][0];
      }
      return 0;
    } catch (error) {
      console.error('Error getting read count:', error);
      return 0;
    }
  }

  // Get user's total stats
  static getUserStats(userId) {
    const db = getDB();
    
    try {
      // Get all user's posts
      const postsResult = db.exec(`
        SELECT id FROM posts WHERE user_id = ?
      `, [userId]);

      if (postsResult.length === 0 || postsResult[0].values.length === 0) {
        return {
          totalPosts: 0,
          totalViews: 0,
          totalReads: 0,
          totalLikes: 0,
          totalComments: 0,
        };
      }

      const postIds = postsResult[0].values.map(row => row[0]);
      const postIdsStr = postIds.map(id => `'${id}'`).join(',');

      // Get total views
      const viewsResult = db.exec(`
        SELECT COUNT(*) as count FROM post_views 
        WHERE post_id IN (${postIdsStr})
      `);
      const totalViews = viewsResult.length > 0 ? viewsResult[0].values[0][0] : 0;

      // Get total reads
      const readsResult = db.exec(`
        SELECT COUNT(*) as count FROM post_reads 
        WHERE post_id IN (${postIdsStr})
      `);
      const totalReads = readsResult.length > 0 ? readsResult[0].values[0][0] : 0;

      // Get total likes
      const likesResult = db.exec(`
        SELECT COUNT(*) as count FROM likes 
        WHERE post_id IN (${postIdsStr})
      `);
      const totalLikes = likesResult.length > 0 ? likesResult[0].values[0][0] : 0;

      // Get total comments
      const commentsResult = db.exec(`
        SELECT COUNT(*) as count FROM comments 
        WHERE post_id IN (${postIdsStr})
      `);
      const totalComments = commentsResult.length > 0 ? commentsResult[0].values[0][0] : 0;

      return {
        totalPosts: postIds.length,
        totalViews,
        totalReads,
        totalLikes,
        totalComments,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        totalPosts: 0,
        totalViews: 0,
        totalReads: 0,
        totalLikes: 0,
        totalComments: 0,
      };
    }
  }

  // Get detailed stats for user's posts
  static getUserPostStats(userId) {
    const db = getDB();
    
    try {
      const result = db.exec(`
        SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC
      `, [userId]);

      if (result.length === 0) {
        return [];
      }

      const posts = result[0].values.map(row => {
        const postId = row[0];
        return {
          id: postId,
          slug: row[1],
          title: row[2],
          createdAt: row[9],
          views: Stats.getViewCount(postId),
          reads: Stats.getReadCount(postId),
          likes: Stats.getLikeCount(postId),
          comments: Stats.getCommentCount(postId),
        };
      });

      return posts;
    } catch (error) {
      console.error('Error getting user post stats:', error);
      return [];
    }
  }

  // Helper: Get like count
  static getLikeCount(postId) {
    const db = getDB();
    try {
      const result = db.exec(`
        SELECT COUNT(*) as count FROM likes WHERE post_id = ?
      `, [postId]);
      return result.length > 0 ? result[0].values[0][0] : 0;
    } catch (error) {
      return 0;
    }
  }

  // Helper: Get comment count
  static getCommentCount(postId) {
    const db = getDB();
    try {
      const result = db.exec(`
        SELECT COUNT(*) as count FROM comments WHERE post_id = ?
      `, [postId]);
      return result.length > 0 ? result[0].values[0][0] : 0;
    } catch (error) {
      return 0;
    }
  }

  // Get stats for a specific date range
  static getUserStatsByDateRange(userId, startDate, endDate) {
    const db = getDB();
    
    try {
      // Get user's posts
      const postsResult = db.exec(`
        SELECT id FROM posts WHERE user_id = ?
      `, [userId]);

      if (postsResult.length === 0 || postsResult[0].values.length === 0) {
        return { views: 0, reads: 0 };
      }

      const postIds = postsResult[0].values.map(row => row[0]);
      const postIdsStr = postIds.map(id => `'${id}'`).join(',');

      // Get views in date range
      const viewsResult = db.exec(`
        SELECT COUNT(*) as count FROM post_views 
        WHERE post_id IN (${postIdsStr})
        AND viewed_at >= ? AND viewed_at <= ?
      `, [startDate, endDate]);
      const views = viewsResult.length > 0 ? viewsResult[0].values[0][0] : 0;

      // Get reads in date range
      const readsResult = db.exec(`
        SELECT COUNT(*) as count FROM post_reads 
        WHERE post_id IN (${postIdsStr})
        AND read_at >= ? AND read_at <= ?
      `, [startDate, endDate]);
      const reads = readsResult.length > 0 ? readsResult[0].values[0][0] : 0;

      return { views, reads };
    } catch (error) {
      console.error('Error getting stats by date range:', error);
      return { views: 0, reads: 0 };
    }
  }
}

module.exports = Stats;


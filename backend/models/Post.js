const { getDB, saveDatabase } = require('../config/database');
const slugify = require('slugify');

class Post {
  // Calculate read time based on content (words per minute)
  static calculateReadTime(content) {
    const wordsPerMinute = 200;
    const text = content.replace(/<[^>]*>/g, ''); // Strip HTML tags
    const words = text.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }

  // Get or create tag ID
  static getOrCreateTagId(tagName) {
    const db = getDB();
    const normalized = tagName.trim().toLowerCase();
    
    const result = db.exec('SELECT id FROM tags WHERE LOWER(name) = ?', [normalized]);
    
    if (result.length > 0 && result[0].values.length > 0) {
      return result[0].values[0][0];
    }
    
    try {
      db.run('INSERT OR IGNORE INTO tags (name) VALUES (?)', [tagName.trim()]);
      saveDatabase();
      
      // Get the ID (either just inserted or already existing)
      const newResult = db.exec('SELECT id FROM tags WHERE LOWER(name) = ?', [normalized]);
      if (newResult.length > 0 && newResult[0].values.length > 0) {
        return newResult[0].values[0][0];
      }
    } catch (error) {
      console.warn(`Error creating tag ${tagName}:`, error);
      // Try to get existing tag
      const existingResult = db.exec('SELECT id FROM tags WHERE LOWER(name) = ?', [normalized]);
      if (existingResult.length > 0 && existingResult[0].values.length > 0) {
        return existingResult[0].values[0][0];
      }
    }
    
    throw new Error(`Failed to get or create tag: ${tagName}`);
  }

  // Get tags for a post
  static getPostTags(postId) {
    const db = getDB();
    const result = db.exec(`
      SELECT t.name
      FROM tags t
      INNER JOIN post_tags pt ON t.id = pt.tag_id
      WHERE pt.post_id = ?
      ORDER BY t.name
    `, [postId]);
    
    if (result.length === 0) return [];
    return result[0].values.map(row => row[0]);
  }

  // Get user avatar by user ID
  static getUserAvatar(userId) {
    if (!userId) return null;
    const db = getDB();
    try {
      const result = db.exec('SELECT avatar FROM users WHERE id = ?', [userId]);
      if (result.length > 0 && result[0].values.length > 0) {
        return result[0].values[0][0];
      }
    } catch (error) {
      console.warn(`Error fetching user avatar for ${userId}:`, error);
    }
    return null;
  }

  // Convert database row to Post object
  static rowToPost(row) {
    const userId = row[6];
    return {
      id: row[0],           // id
      slug: row[1],         // slug
      title: row[2],        // title
      content: row[3],      // content
      excerpt: row[4] || '', // excerpt
      author: row[5],       // author
      userId: userId,       // user_id
      authorAvatar: Post.getUserAvatar(userId), // user avatar
      category: row[7] || '', // category
      coverImage: row[8] || '', // cover_image
      createdAt: row[9],    // created_at
      updatedAt: row[10],   // updated_at
      readTime: row[11],    // read_time
      featured: row[12] === 1 || row[12] === '1', // featured (convert to boolean)
      tags: Post.getPostTags(row[0]),
    };
  }

  // Get all posts
  static findAll() {
    const db = getDB();
    const result = db.exec('SELECT * FROM posts ORDER BY created_at DESC');
    
    if (result.length === 0) return [];
    return result[0].values.map(Post.rowToPost);
  }

  // Find posts by category
  static findByCategory(category) {
    const db = getDB();
    const result = db.exec(
      'SELECT * FROM posts WHERE LOWER(category) = ? ORDER BY created_at DESC',
      [category.toLowerCase()]
    );
    
    if (result.length === 0) return [];
    return result[0].values.map(Post.rowToPost);
  }

  // Find posts by tag
  static findByTag(tag) {
    const db = getDB();
    const result = db.exec(`
      SELECT DISTINCT p.*
      FROM posts p
      INNER JOIN post_tags pt ON p.id = pt.post_id
      INNER JOIN tags t ON pt.tag_id = t.id
      WHERE LOWER(t.name) = ?
      ORDER BY p.created_at DESC
    `, [tag.toLowerCase()]);
    
    if (result.length === 0) return [];
    return result[0].values.map(Post.rowToPost);
  }

  // Find post by ID
  static findById(id) {
    const db = getDB();
    const result = db.exec('SELECT * FROM posts WHERE id = ?', [id]);
    
    if (result.length === 0 || result[0].values.length === 0) return null;
    return Post.rowToPost(result[0].values[0]);
  }

  // Find post by slug
  static findBySlug(slug) {
    const db = getDB();
    const result = db.exec('SELECT * FROM posts WHERE slug = ?', [slug]);
    
    if (result.length === 0 || result[0].values.length === 0) return null;
    return Post.rowToPost(result[0].values[0]);
  }

  // Create new post
  static create(data) {
    const db = getDB();
    const id = Date.now().toString();
    const slug = slugify(data.title, { lower: true, strict: true });
    const now = new Date().toISOString();
    const readTime = Post.calculateReadTime(data.content);

    // Insert post
    db.run(`
      INSERT INTO posts (id, slug, title, content, excerpt, author, user_id, category, cover_image, created_at, updated_at, read_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      slug,
      data.title,
      data.content,
      data.excerpt || '',
      data.author,
      data.userId || null,
      data.category || '',
      data.coverImage || null,
      now,
      now,
      readTime
    ]);
    
    // Insert tags (avoid duplicates)
    if (data.tags && data.tags.length > 0) {
      const uniqueTags = [...new Set(data.tags.map(t => t.trim()).filter(t => t))];
      const insertedTagIds = new Set();
      
      for (const tagName of uniqueTags) {
        const tagId = Post.getOrCreateTagId(tagName);
        
        // Only insert if not already inserted for this post
        if (!insertedTagIds.has(tagId)) {
          try {
            db.run('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)', [id, tagId]);
            insertedTagIds.add(tagId);
          } catch (error) {
            console.warn(`Skipping duplicate tag ${tagName} for post ${id}`);
          }
        }
      }
    }
    
    saveDatabase();
    return Post.findById(id);
  }

  // Update post
  static update(id, data) {
    const existingPost = Post.findById(id);
    if (!existingPost) return null;
    
    const db = getDB();
    const slug = data.title ? slugify(data.title, { lower: true, strict: true }) : existingPost.slug;
    const updatedAt = new Date().toISOString();
    const readTime = data.content ? Post.calculateReadTime(data.content) : existingPost.readTime;
    
    db.run(`
      UPDATE posts
      SET slug = ?,
          title = ?,
          content = ?,
          excerpt = ?,
          author = ?,
          category = ?,
          cover_image = ?,
          updated_at = ?,
          read_time = ?
      WHERE id = ?
    `, [
      slug,
      data.title ?? existingPost.title,
      data.content ?? existingPost.content,
      data.excerpt ?? existingPost.excerpt,
      data.author ?? existingPost.author,
      data.category ?? existingPost.category,
      data.coverImage ?? existingPost.coverImage ?? null,
      updatedAt,
      readTime,
      id
    ]);
    
    // Update tags if provided
    if (data.tags !== undefined) {
      db.run('DELETE FROM post_tags WHERE post_id = ?', [id]);
      
      if (data.tags.length > 0) {
        const uniqueTags = [...new Set(data.tags.map(t => t.trim()).filter(t => t))];
        const insertedTagIds = new Set();
        
        for (const tagName of uniqueTags) {
          const tagId = Post.getOrCreateTagId(tagName);
          
          if (!insertedTagIds.has(tagId)) {
            db.run('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)', [id, tagId]);
            insertedTagIds.add(tagId);
          }
        }
      }
    }
    
    saveDatabase();
    return Post.findById(id);
  }

  // Delete post
  static delete(id) {
    const db = getDB();
    db.run('DELETE FROM posts WHERE id = ?', [id]);
    saveDatabase();
    return true;
  }

  // Get all categories
  static getAllCategories() {
    const db = getDB();
    const result = db.exec('SELECT DISTINCT category FROM posts WHERE category IS NOT NULL AND length(category) > 0 ORDER BY category');
    
    if (result.length === 0) return [];
    return result[0].values.map(row => row[0]);
  }

  // Get all tags
  static getAllTags() {
    const db = getDB();
    const result = db.exec('SELECT name FROM tags ORDER BY name');
    
    if (result.length === 0) return [];
    return result[0].values.map(row => row[0]);
  }

  // Get all unique authors
  static getAllAuthors() {
    const db = getDB();
    const result = db.exec(`
      SELECT DISTINCT author, COUNT(*) as post_count
      FROM posts 
      WHERE author IS NOT NULL AND author != ""
      GROUP BY author
      ORDER BY post_count DESC, author ASC
    `);
    
    if (result.length === 0) return [];
    return result[0].values.map(row => ({
      name: row[0],
      postCount: row[1]
    }));
  }

  // Feature a post
  static featurePost(postId) {
    const db = getDB();
    db.run('UPDATE posts SET featured = 1 WHERE id = ?', [postId]);
    saveDatabase();
    return Post.findById(postId);
  }

  // Unfeature a post
  static unfeaturePost(postId) {
    const db = getDB();
    db.run('UPDATE posts SET featured = 0 WHERE id = ?', [postId]);
    saveDatabase();
    return Post.findById(postId);
  }

  // Get all featured posts
  static getFeaturedPosts() {
    const db = getDB();
    const result = db.exec('SELECT * FROM posts WHERE featured = 1 ORDER BY created_at DESC');
    
    if (result.length === 0) return [];
    return result[0].values.map(Post.rowToPost);
  }

  // Check if post is featured
  static isFeatured(postId) {
    const db = getDB();
    const result = db.exec('SELECT featured FROM posts WHERE id = ?', [postId]);
    
    if (result.length === 0 || result[0].values.length === 0) return false;
    return result[0].values[0][0] === 1 || result[0].values[0][0] === '1';
  }
}

module.exports = Post;

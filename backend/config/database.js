const fs = require('fs');
const path = require('path');

const databasePath = () => path.join(__dirname, '..', 'blog.db');
let db = null;

// Initialize SQL.js database
async function initializeDatabase(database) {
  console.log('📊 Initializing database...');
  
  try {
    if (database) {
      db = database;
    } else {
      const SQL = await require('sql.js')();
      const dbPath = databasePath();
    
      // Load existing database or create a new one.
      db = fs.existsSync(dbPath)
        ? new SQL.Database(fs.readFileSync(dbPath))
        : new SQL.Database();
    }

    // Create users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        avatar TEXT,
        bio TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    
    const userColumns = db.exec('PRAGMA table_info(users)')[0].values;
    if (!userColumns.some(column => column[1] === 'session_version')) {
      db.run('ALTER TABLE users ADD COLUMN session_version INTEGER NOT NULL DEFAULT 0');
    }
    db.run(`CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);`);
    
    db.run(`
      CREATE TABLE IF NOT EXISTS email_auth_tokens (
        purpose TEXT NOT NULL,
        email TEXT NOT NULL,
        token_hash TEXT NOT NULL UNIQUE,
        expires_at INTEGER NOT NULL,
        requested_at INTEGER NOT NULL,
        account_version TEXT,
        PRIMARY KEY (purpose, email)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS ai_requests (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `);
    db.run('CREATE INDEX IF NOT EXISTS idx_ai_requests_date ON ai_requests(created_at)');
    db.run('CREATE INDEX IF NOT EXISTS idx_ai_requests_user_date ON ai_requests(user_id, created_at)');

    db.run(`
      CREATE TABLE IF NOT EXISTS ai_gemini_usage (
        id TEXT PRIMARY KEY,
        created_at INTEGER NOT NULL,
        tokens INTEGER NOT NULL
      )
    `);
    db.run('CREATE INDEX IF NOT EXISTS idx_ai_gemini_usage_date ON ai_gemini_usage(created_at)');

    // Create posts table (updated with user_id and featured)
    db.run(`
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        author TEXT NOT NULL,
        user_id TEXT,
        category TEXT,
        cover_image TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        read_time INTEGER NOT NULL,
        featured INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    
    // Add featured column if it doesn't exist (for existing databases)
    try {
      db.run(`ALTER TABLE posts ADD COLUMN featured INTEGER DEFAULT 0;`);
    } catch (e) {
      // Column already exists, ignore error
    }
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_slug ON posts(slug);`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_category ON posts(category);`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_created_at ON posts(created_at DESC);`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_user_id ON posts(user_id);`);
    
    // Create tags table
    db.run(`
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
      );
    `);
    
    // Create post_tags junction table
    db.run(`
      CREATE TABLE IF NOT EXISTS post_tags (
        post_id TEXT NOT NULL,
        tag_id INTEGER NOT NULL,
        PRIMARY KEY (post_id, tag_id),
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      );
    `);
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_post_tags_post ON post_tags(post_id);`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_post_tags_tag ON post_tags(tag_id);`);
    
    // Create likes table
    db.run(`
      CREATE TABLE IF NOT EXISTS likes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        post_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        UNIQUE(user_id, post_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
      );
    `);
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_likes_post ON likes(post_id);`);
    
    // Create comments table
    db.run(`
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        post_id TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
      );
    `);
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);`);
    
    // Create follows table
    db.run(`
      CREATE TABLE IF NOT EXISTS follows (
        id TEXT PRIMARY KEY,
        follower_id TEXT NOT NULL,
        following_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        UNIQUE(follower_id, following_id),
        FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);`);
    
    // Create bookmarks table
    db.run(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        post_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        UNIQUE(user_id, post_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
      );
    `);
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_bookmarks_post ON bookmarks(post_id);`);
    
    // Create post_views table (for analytics)
    db.run(`
      CREATE TABLE IF NOT EXISTS post_views (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        user_id TEXT,
        viewed_at TEXT NOT NULL,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_views_post ON post_views(post_id);`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_views_date ON post_views(viewed_at);`);
    
    // Create post_reads table (for analytics)
    db.run(`
      CREATE TABLE IF NOT EXISTS post_reads (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        user_id TEXT,
        read_at TEXT NOT NULL,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_reads_post ON post_reads(post_id);`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_reads_date ON post_reads(read_at);`);
    
    require('./socialSchema')(db);

    // Save database to disk
    saveDatabase();
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Save database to disk
function saveDatabase() {
  if (db?.export) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(databasePath(), buffer);
  }
}

// Get database instance
function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

// Export functions
module.exports = {
  initializeDatabase,
  getDB,
  saveDatabase,
};

module.exports = function initializeSocialSchema(db) {
  const columns = db.exec('PRAGMA table_info(comments)')[0].values;
  if (!columns.some(column => column[1] === 'parent_id')) {
    db.run('ALTER TABLE comments ADD COLUMN parent_id TEXT REFERENCES comments(id) ON DELETE SET NULL');
  }
  db.run('CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id)');
  db.run(`CREATE TABLE IF NOT EXISTS comment_likes (
    comment_id TEXT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL,
    PRIMARY KEY (comment_id, user_id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY,
    recipient_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    actor_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    target_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    read_at TEXT,
    UNIQUE(recipient_id, actor_id, kind, target_id)
  )`);
  db.run('CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, read_at, id)');

  const createTrigger = (table, select) => db.run(`
    CREATE TRIGGER IF NOT EXISTS notify_${table} AFTER INSERT ON ${table} BEGIN
      INSERT OR IGNORE INTO notifications (recipient_id, actor_id, post_id, kind, target_id, created_at)
      ${select};
    END`);
  createTrigger('comments', `
    SELECT recipient, NEW.user_id, NEW.post_id, kind, NEW.id, NEW.created_at FROM (
      SELECT user_id AS recipient, 'comment' AS kind FROM posts
      WHERE id = NEW.post_id AND user_id IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM comments WHERE id = NEW.parent_id AND user_id = posts.user_id)
      UNION ALL
      SELECT user_id, 'reply' FROM comments WHERE id = NEW.parent_id
    ) WHERE recipient <> NEW.user_id`);
  createTrigger('likes', `
    SELECT user_id, NEW.user_id, NEW.post_id, 'post-like', NEW.post_id, NEW.created_at FROM posts
    WHERE id = NEW.post_id AND user_id <> NEW.user_id`);
  createTrigger('comment_likes', `
    SELECT user_id, NEW.user_id, post_id, 'comment-like', NEW.comment_id, NEW.created_at FROM comments
    WHERE id = NEW.comment_id AND user_id <> NEW.user_id`);
  createTrigger('follows', `
    SELECT NEW.following_id, NEW.follower_id, NULL, 'follow', NEW.following_id, NEW.created_at
    WHERE NEW.following_id <> NEW.follower_id
      AND EXISTS (SELECT 1 FROM users WHERE id = NEW.following_id)`);
  createTrigger('posts', `
    SELECT follower_id, NEW.user_id, NEW.id, 'new-post', NEW.id, NEW.created_at FROM follows
    WHERE following_id = NEW.user_id AND follower_id <> NEW.user_id`);
};

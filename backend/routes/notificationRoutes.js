const router = require('express').Router();
const { getDB, saveDatabase } = require('../config/database');
const { protect } = require('../middleware/auth');

router.use(protect, (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

router.get('/', (req, res) => {
  const db = getDB();
  const rows = db.exec(`
    SELECT n.id, n.kind, n.created_at, n.read_at, u.name, p.slug, n.actor_id, n.target_id
    FROM notifications n JOIN users u ON u.id = n.actor_id
    LEFT JOIN posts p ON p.id = n.post_id
    WHERE n.recipient_id = ? ORDER BY n.id DESC LIMIT 50
  `, [req.user.id])[0]?.values ?? [];
  const unread = db.exec('SELECT COUNT(*) FROM notifications WHERE recipient_id = ? AND read_at IS NULL',
    [req.user.id])[0].values[0][0];
  res.json({ data: {
    unread,
    items: rows.map(([id, kind, createdAt, readAt, actor, slug, actorId, targetId]) => ({
      id, kind, createdAt, readAt, actor, slug, actorId, targetId
    }))
  } });
});

router.put('/read', (req, res) => {
  const { id } = req.body ?? {};
  if (id !== undefined && (!Number.isSafeInteger(id) || id < 1)) {
    return res.status(400).json({ message: 'Invalid notification ID.' });
  }
  const db = getDB();
  db.run('UPDATE notifications SET read_at = ? WHERE recipient_id = ? AND read_at IS NULL' +
    (id === undefined ? '' : ' AND id = ?'),
  [new Date().toISOString(), req.user.id, ...(id === undefined ? [] : [id])]);
  saveDatabase();
  return res.sendStatus(204);
});

module.exports = router;

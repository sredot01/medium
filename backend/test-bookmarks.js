// Quick script to check bookmarks in database
const { initializeDatabase, getDB } = require('./config/database');

async function checkBookmarks() {
  await initializeDatabase();
  const db = getDB();

  console.log('\n📚 Checking Bookmarks in Database...\n');

  // Get all bookmarks
  const bookmarksResult = db.exec('SELECT * FROM bookmarks');
  
  if (bookmarksResult.length === 0 || bookmarksResult[0].values.length === 0) {
    console.log('❌ No bookmarks found in database!');
    console.log('\nTo test:');
    console.log('1. Go to home page');
    console.log('2. Click the bookmark icon on any post');
    console.log('3. Then refresh bookmarks page\n');
  } else {
    console.log(`✅ Found ${bookmarksResult[0].values.length} bookmark(s):\n`);
    bookmarksResult[0].values.forEach(row => {
      console.log(`  ID: ${row[0]}`);
      console.log(`  User ID: ${row[1]}`);
      console.log(`  Post ID: ${row[2]}`);
      console.log(`  Created: ${row[3]}`);
      console.log('  ---');
    });
  }

  // Get all users
  const usersResult = db.exec('SELECT id, name, email FROM users');
  if (usersResult.length > 0) {
    console.log(`\n👥 Users in database:`);
    usersResult[0].values.forEach(row => {
      console.log(`  • ${row[1]} (${row[2]}) - ID: ${row[0]}`);
    });
  }

  // Get all posts
  const postsResult = db.exec('SELECT id, title, slug FROM posts');
  if (postsResult.length > 0) {
    console.log(`\n📝 Posts in database (${postsResult[0].values.length}):`);
    postsResult[0].values.slice(0, 5).forEach(row => {
      console.log(`  • ${row[1]} (${row[2]})`);
    });
  }

  console.log('\n');
}

checkBookmarks().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});


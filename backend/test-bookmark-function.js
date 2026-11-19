// Test the Bookmark.getUserBookmarks function
const { initializeDatabase } = require('./config/database');
const Bookmark = require('./models/Bookmark');

async function testGetUserBookmarks() {
  await initializeDatabase();

  const userId = '1759963141340'; // John Doe's ID

  console.log('\n📚 Testing Bookmark.getUserBookmarks()...\n');
  console.log(`User ID: ${userId}\n`);

  try {
    const bookmarks = Bookmark.getUserBookmarks(userId);
    
    console.log(`✅ Function returned ${bookmarks.length} bookmark(s)\n`);
    
    if (bookmarks.length > 0) {
      console.log('Bookmark structure:');
      console.log(JSON.stringify(bookmarks[0], null, 2));
    } else {
      console.log('❌ No bookmarks returned!');
    }
  } catch (error) {
    console.error('❌ Error calling getUserBookmarks:');
    console.error(error);
  }

  console.log('\n');
}

testGetUserBookmarks().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});


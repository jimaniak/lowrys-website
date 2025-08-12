
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@libsql/client');

async function listViews() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  try {
    console.log('🔍 Fetching list of all views from the database...');
    const rs = await db.execute("SELECT name FROM sqlite_master WHERE type='view'");
    
    if (rs.rows.length === 0) {
      console.log('✅ No views found in the database.');
      return;
    }

    const views = rs.rows.map(row => row.name);
    console.log('📋 Found views:');
    console.table(views);
  } catch (error) {
    console.error('❌ Error fetching views:', error);
  } finally {
    if (db) {
      db.close();
    }
  }
}

listViews();

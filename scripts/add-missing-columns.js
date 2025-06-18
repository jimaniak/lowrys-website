const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function addMissingColumns() {
  try {
    console.log('🔧 Adding missing columns to occupation_data table...');
    
    // Check current schema
    const columnCheck = await db.execute(`PRAGMA table_info(occupation_data)`);
    const existingColumns = columnCheck.rows.map(row => row[1]);
    console.log('Existing columns:', existingColumns.join(', '));
    
    // Add total_employment if missing
    if (!existingColumns.includes('total_employment')) {
      await db.execute(`ALTER TABLE occupation_data ADD COLUMN total_employment INTEGER`);
      console.log('  ✅ Added total_employment column');
    } else {
      console.log('  ✅ total_employment column already exists');
    }
    
    // Update column types if needed (SQLite doesn't support ALTER COLUMN, so we'll work with existing types)
    console.log('📋 Final schema:');
    const finalCheck = await db.execute(`PRAGMA table_info(occupation_data)`);
    finalCheck.rows.forEach(row => {
      console.log(`  ${row[1]} (${row[2]})`);
    });
    
    console.log('\n✅ Schema update completed!');
    
  } catch (error) {
    console.error('❌ Error updating schema:', error);
  } finally {
    await db.close();
  }
}

addMissingColumns();

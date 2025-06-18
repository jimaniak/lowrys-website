require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@libsql/client');

// Initialize database connection
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function quickTest() {
  try {
    console.log('Testing database connection...');
    
    // Simple count test
    const countResult = await db.execute('SELECT COUNT(*) as total FROM occupations');
    console.log(`Total occupations: ${countResult.rows[0].total}`);
    
    // Check if occupation_type column exists
    const schemaResult = await db.execute("PRAGMA table_info(occupations)");
    console.log('\nColumns in occupations table:');
    schemaResult.rows.forEach(col => {
      console.log(`  ${col.name}: ${col.type}`);
    });
    
    // Check occupation_type values
    const typeResult = await db.execute('SELECT occupation_type, COUNT(*) as count FROM occupations WHERE occupation_type IS NOT NULL GROUP BY occupation_type LIMIT 10');
    console.log('\nOccupation types:');
    typeResult.rows.forEach(row => {
      console.log(`  ${row.occupation_type}: ${row.count}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

quickTest();

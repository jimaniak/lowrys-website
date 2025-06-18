const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function checkSchema() {
  try {
    console.log('🔍 Checking occupation_data table schema...');
    const result = await db.execute('PRAGMA table_info(occupation_data)');
    console.log('Current schema:');
    result.rows.forEach(row => {
      console.log(`  ${row[1]} (${row[2]}) - ${row[3] ? 'NOT NULL' : 'NULL'} - ${row[4] ? `DEFAULT: ${row[4]}` : 'NO DEFAULT'} - ${row[5] ? 'PRIMARY KEY' : ''}`);
    });
    
    console.log('\n🔍 Checking if total_employment column exists...');
    const hasColumn = result.rows.some(row => row[1] === 'total_employment');
    console.log(`total_employment column exists: ${hasColumn}`);
    
    if (!hasColumn) {
      console.log('\n❌ total_employment column is missing from the table!');
      console.log('This explains why the migration is failing.');
    }
    
  } catch (error) {
    console.error('❌ Error checking schema:', error);
  } finally {
    await db.close();
  }
}

checkSchema();

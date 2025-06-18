const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function testOccupationQuery() {
  console.log('🔍 Testing occupation query...');
  
  // Check if environment variables are available
  if (!process.env.TURSO_DATABASE_URL) {
    console.error('❌ TURSO_DATABASE_URL not found');
    return;
  }
  
  if (!process.env.TURSO_AUTH_TOKEN) {
    console.error('❌ TURSO_AUTH_TOKEN not found');
    return;
  }
  
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  
  try {    // Test the new query (including NULL handling)
    console.log('\n📊 Testing updated occupation filter query...');
    const result = await db.execute({
      sql: 'SELECT code, name, occupation_type FROM occupations WHERE (occupation_type != ? OR occupation_type IS NULL) LIMIT 10',
      args: ['Summary']
    });
    
    console.log(`✅ Found ${result.rows.length} occupations`);
    result.rows.forEach(row => {
      console.log(`  - ${row.code}: ${row.name} (${row.occupation_type})`);
    });
    
    // Test count
    const countResult = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM occupations WHERE occupation_type != ?',
      args: ['Summary']
    });
    
    console.log(`\n📈 Total non-Summary occupations: ${countResult.rows[0].count}`);
    
    // Test count of Summary occupations
    const summaryCountResult = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM occupations WHERE occupation_type = ?',
      args: ['Summary']
    });
    
    console.log(`📋 Total Summary occupations: ${summaryCountResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Database query failed:', error);
  }
  
  process.exit(0);
}

testOccupationQuery();

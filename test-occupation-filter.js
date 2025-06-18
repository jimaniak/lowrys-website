const { createClient } = require('@libsql/client');

// Initialize database connection
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function testOccupationFilter() {
  console.log('🔍 Testing occupation filtering...');
  
  try {
    // Test the new query
    console.log('\n1. Testing new occupation_type filter...');
    const newQuery = await db.execute({
      sql: 'SELECT * FROM occupations WHERE occupation_type != ? ORDER BY name LIMIT 10',
      args: ['Summary']
    });
    
    console.log(`Found ${newQuery.rows.length} occupations with new filter`);
    if (newQuery.rows.length > 0) {
      console.log('Sample occupations:');
      newQuery.rows.forEach(row => {
        console.log(`  - ${row.code}: ${row.name} (${row.occupation_type})`);
      });
    }
    
    // Check what occupation_type values exist
    console.log('\n2. Checking occupation_type values...');
    const typeQuery = await db.execute('SELECT occupation_type, COUNT(*) as count FROM occupations GROUP BY occupation_type ORDER BY count DESC');
    
    console.log('Occupation types:');
    typeQuery.rows.forEach(row => {
      console.log(`  - ${row.occupation_type}: ${row.count} occupations`);
    });
    
    // Test without any filter
    console.log('\n3. Testing without filter...');
    const allQuery = await db.execute('SELECT COUNT(*) as total FROM occupations');
    console.log(`Total occupations in table: ${allQuery.rows[0].total}`);
    
    // Check if occupation_type column exists and has data
    console.log('\n4. Checking occupation_type column...');
    const schemaQuery = await db.execute("PRAGMA table_info(occupations)");
    const hasOccupationType = schemaQuery.rows.find(col => col.name === 'occupation_type');
    console.log('occupation_type column exists:', !!hasOccupationType);
    
    if (hasOccupationType) {
      const nullCount = await db.execute('SELECT COUNT(*) as count FROM occupations WHERE occupation_type IS NULL');
      console.log(`Occupations with NULL occupation_type: ${nullCount.rows[0].count}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

testOccupationFilter();

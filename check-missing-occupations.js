const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

(async () => {
  console.log('🔍 Checking occupation completeness...\n');
  
  // Total occupations in database
  const total = await client.execute('SELECT COUNT(*) as count FROM occupations');
  console.log('📊 Total occupations in database:', total.rows[0].count);
  
  // Occupations by type
  const byType = await client.execute(`
    SELECT occupation_type, COUNT(*) as count 
    FROM occupations 
    GROUP BY occupation_type 
    ORDER BY count DESC
  `);
  console.log('\n📋 Occupations by type:');
  byType.rows.forEach(row => {
    console.log(`  ${row.occupation_type || 'NULL'}: ${row.count}`);
  });
  
  // What we're showing in the API (Summary + Line item)
  const apiShown = await client.execute(`
    SELECT COUNT(*) as count 
    FROM occupations 
    WHERE occupation_type IN ('Summary', 'Line item')
    AND code IS NOT NULL
  `);
  console.log('\n🔗 Shown in hierarchy API:', apiShown.rows[0].count);
  
  // Check parent relationships
  const noParent = await client.execute(`
    SELECT COUNT(*) as count 
    FROM occupations 
    WHERE parent_code IS NULL
  `);
  console.log('🏢 Major Groups (no parent):', noParent.rows[0].count);
  
  const withParent = await client.execute(`
    SELECT COUNT(*) as count 
    FROM occupations 
    WHERE parent_code IS NOT NULL
  `);
  console.log('📁 Has parent relationship:', withParent.rows[0].count);
  
  // Check for orphaned occupations (parent doesn't exist)
  const orphaned = await client.execute(`
    SELECT COUNT(*) as count
    FROM occupations o1
    WHERE o1.parent_code IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM occupations o2 
      WHERE o2.code = o1.parent_code
    )
  `);
  console.log('⚠️  Orphaned (invalid parent):', orphaned.rows[0].count);
  
  // Sample of missing types
  console.log('\n🔍 Sample of other occupation types:');
  const otherTypes = await client.execute(`
    SELECT code, name, occupation_type 
    FROM occupations 
    WHERE occupation_type NOT IN ('Summary', 'Line item') 
    AND occupation_type IS NOT NULL
    LIMIT 10
  `);
  otherTypes.rows.forEach(row => {
    console.log(`  ${row.code}: ${row.name} (${row.occupation_type})`);
  });
  
  await client.close();
})();

// Test the new occupation filtering logic
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function testNewFiltering() {
  try {
    console.log('🧪 Testing new occupation filtering logic...');
    
    // Test the new query
    const occupationsQuery = `
      SELECT DISTINCT o.*, 
        JSON_EXTRACT(bst.additional_data, '$.["Occupation type"]') as occupation_type
      FROM occupations o
      LEFT JOIN bls_special_tables bst ON o.code = bst.occupation_code 
        AND bst.table_number = 'Table 1.2'
      WHERE (
        bst.additional_data IS NULL 
        OR JSON_EXTRACT(bst.additional_data, '$.["Occupation type"]') != 'Summary'
      )
      ORDER BY o.code
      LIMIT 20`;
    
    const result = await client.execute({ sql: occupationsQuery, args: [] });
    
    console.log('\n📋 Sample occupations (non-Summary):');
    result.rows.forEach(row => {
      console.log(`  ${row.code}: ${row.name} (Type: ${row.occupation_type || 'Unknown'})`);
    });
    
    // Also check what Summary occupations we're filtering out
    console.log('\n🚫 Sample Summary occupations (filtered out):');
    const summaryQuery = `
      SELECT DISTINCT o.*, 
        JSON_EXTRACT(bst.additional_data, '$.["Occupation type"]') as occupation_type
      FROM occupations o
      LEFT JOIN bls_special_tables bst ON o.code = bst.occupation_code 
        AND bst.table_number = 'Table 1.2'
      WHERE JSON_EXTRACT(bst.additional_data, '$.["Occupation type"]') = 'Summary'
      ORDER BY o.code
      LIMIT 10`;
    
    const summaryResult = await client.execute({ sql: summaryQuery, args: [] });
    summaryResult.rows.forEach(row => {
      console.log(`  ${row.code}: ${row.name} (Type: ${row.occupation_type})`);
    });
    
    // Count total results
    const countQuery = `
      SELECT COUNT(DISTINCT o.code) as total_count
      FROM occupations o
      LEFT JOIN bls_special_tables bst ON o.code = bst.occupation_code 
        AND bst.table_number = 'Table 1.2'
      WHERE (
        bst.additional_data IS NULL 
        OR JSON_EXTRACT(bst.additional_data, '$.["Occupation type"]') != 'Summary'
      )`;
    
    const countResult = await client.execute({ sql: countQuery, args: [] });
    console.log(`\n📊 Total non-Summary occupations: ${countResult.rows[0].total_count}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

testNewFiltering();

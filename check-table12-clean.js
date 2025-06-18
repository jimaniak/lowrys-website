// Debug script to check BLS Table 1.2 occupation types
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function checkTable12() {
  try {
    console.log('📊 Checking BLS Table 1.2 occupation types...');
    
    // First check if we have any data in bls_special_tables
    const countResult = await client.execute({
      sql: "SELECT COUNT(*) as count FROM bls_special_tables WHERE table_number = 'Table 1.2'",
      args: []
    });
    
    console.log(`Found ${countResult.rows[0].count} records in Table 1.2`);
    
    if (countResult.rows[0].count === 0) {
      console.log('❌ No Table 1.2 data found. Checking all tables...');
      const allTables = await client.execute({
        sql: "SELECT DISTINCT table_number FROM bls_special_tables ORDER BY table_number",
        args: []
      });
      console.log('Available tables:', allTables.rows.map(r => r.table_number));
      return;
    }    // Check what columns exist in bls_special_tables
    console.log('\n🔍 Checking bls_special_tables structure...');
    const tablesSchema = await client.execute({
      sql: "PRAGMA table_info(bls_special_tables)",
      args: []
    });
    
    console.log('bls_special_tables columns:');
    tablesSchema.rows.forEach(col => {
      console.log(`  - ${col.name} (${col.type})`);
    });

    // Check what occupation types exist in Table 1.2 (using correct column name)
    const result = await client.execute({
      sql: `SELECT DISTINCT * 
            FROM bls_special_tables 
            WHERE table_number = 'Table 1.2' 
            LIMIT 5`,
      args: []
    });

    console.log('\n📋 Sample Table 1.2 records:');
    result.rows.forEach(row => {
      console.log('  Record:', row);
    });

    // Also check the occupations table structure
    console.log('\n🏢 Checking occupations table structure...');
    const occupationsSchema = await client.execute({
      sql: "PRAGMA table_info(occupations)",
      args: []
    });
    
    console.log('Occupations table columns:');
    occupationsSchema.rows.forEach(col => {
      console.log(`  - ${col.name} (${col.type})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkTable12();

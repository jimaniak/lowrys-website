// Debug script to check if Actors occupation exists in database
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function debugActors() {
  try {
    console.log('� Checking BLS Table 1.2 occupation types...');
    
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
    }

    // Check what occupation types exist in Table 1.2
    const result = await client.execute({
      sql: `SELECT DISTINCT occupation_type 
            FROM bls_special_tables 
            WHERE table_number = 'Table 1.2' 
            ORDER BY occupation_type`,
      args: []
    });

    console.log('\n🏷️ Occupation types in Table 1.2:');
    result.rows.forEach(row => {
      console.log(`  - ${row.occupation_type}`);
    });

    // Check a few examples of each type
    const types = result.rows.map(r => r.occupation_type);
    
    for (const type of types.slice(0, 3)) { // Check first 3 types
      console.log(`\n📋 Examples of "${type}" occupations:`);
      const examples = await client.execute({
        sql: `SELECT occupation_code, occupation_title 
              FROM bls_special_tables 
              WHERE table_number = 'Table 1.2' AND occupation_type = ?
              ORDER BY occupation_code
              LIMIT 5`,
        args: [type]
      });
      
      examples.rows.forEach(row => {
        console.log(`  ${row.occupation_code}: ${row.occupation_title}`);
      });
    }

    // Also check the occupations table for occupation_type field
    console.log('\n🏢 Checking occupations table structure...');
    const occupationsSchema = await client.execute({
      sql: "PRAGMA table_info(occupations)",
      args: []
    });
    
    console.log('Occupations table columns:');
    occupationsSchema.rows.forEach(col => {
      console.log(`  - ${col.name} (${col.type})`);
    });

    // Check some examples from the occupations table
    console.log('\n📋 Sample occupations from main table:');
    const sampleOccupations = await client.execute({
      sql: "SELECT code, name FROM occupations ORDER BY code LIMIT 10",
      args: []
    });
    
    sampleOccupations.rows.forEach(row => {
      console.log(`  ${row.code}: ${row.name}`);
    });
        args: [actorCode]
      });
      
      if (wageResult.rows.length > 0) {
        console.log('Wage data found:', wageResult.rows[0]);
      } else {
        console.log('❌ No wage data found for this occupation');
      }
      
      // Check projections
      console.log(`\n📈 Checking projections for ${actorCode}...`);
      const projResult = await client.execute({
        sql: "SELECT * FROM projections WHERE occupation_code = ? LIMIT 1",
        args: [actorCode]
      });
      
      if (projResult.rows.length > 0) {
        console.log('Projections found:', projResult.rows[0]);
      } else {
        console.log('❌ No projections found for this occupation');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.close();
  }
}

debugActors();

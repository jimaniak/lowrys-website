const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function dropUnusedTables() {
  console.log('Checking foreign key constraints and dropping unused/legacy tables...');
  
  const tablesToDrop = [
    'major_groups',
    'occupation_categories', 
    'occupations_normalized',
    'occupations_old',
    'occupations_test'
  ];
  
  try {
    // First, let's check what tables exist and their foreign key constraints
    console.log('\nCurrent tables:');
    const tablesResult = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `);
    
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.name}`);
    });
    
    // Check for foreign key constraints on tables we want to drop
    console.log('\nChecking foreign key constraints...');
    for (const table of tablesToDrop) {
      try {
        const fkResult = await client.execute(`PRAGMA foreign_key_list(${table})`);
        if (fkResult.rows.length > 0) {
          console.log(`${table} has foreign key constraints:`);
          fkResult.rows.forEach(row => {
            console.log(`  - References ${row.table}.${row.to} from ${row.from}`);
          });
        }
      } catch (error) {
        console.log(`  - Table ${table} does not exist or error checking FK: ${error.message}`);
      }
    }
    
    // Disable foreign key constraints temporarily
    console.log('\nDisabling foreign key constraints...');
    await client.execute('PRAGMA foreign_keys = OFF');
    
    // Now try to drop the tables
    for (const table of tablesToDrop) {
      console.log(`Dropping table: ${table}`);
      try {
        await client.execute(`DROP TABLE IF EXISTS ${table}`);
        console.log(`✓ Dropped table: ${table}`);
      } catch (error) {
        console.log(`  - Could not drop ${table}: ${error.message}`);
      }
    }
    
    // Re-enable foreign key constraints
    console.log('\nRe-enabling foreign key constraints...');
    await client.execute('PRAGMA foreign_keys = ON');
    
    console.log('\n✅ Table cleanup completed!');
    
    // List remaining tables to verify
    console.log('\nRemaining tables:');
    const result = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `);
    
    result.rows.forEach(row => {
      console.log(`  - ${row.name}`);
    });
    
  } catch (error) {
    console.error('❌ Error during table cleanup:', error);
    process.exit(1);
  } finally {
    client.close();
  }
}

dropUnusedTables();

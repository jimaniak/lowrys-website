const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function auditBlsTables() {
  console.log('🔍 Auditing BLS tables for normalization planning...\n');
  
  const blsTables = [
    'bls_table_1_1', 'bls_table_1_2', 'bls_table_1_3', 'bls_table_1_4',
    'bls_table_1_5', 'bls_table_1_6', 'bls_table_1_8', 'bls_table_1_9',
    'bls_table_1_10', 'bls_table_1_11', 'bls_table_1_12'
  ];
  
  try {
    for (const table of blsTables) {
      console.log(`=== ${table} ===`);
      
      // Count rows
      const countResult = await client.execute(`SELECT COUNT(*) as count FROM ${table}`);
      const rowCount = countResult.rows[0].count;
      console.log(`Rows: ${rowCount}`);
      
      if (rowCount > 0) {
        // Get column structure
        const pragmaResult = await client.execute(`PRAGMA table_info(${table})`);
        console.log('Columns:');
        pragmaResult.rows.forEach(col => {
          console.log(`  - ${col.name} (${col.type})`);
        });
        
        // Sample a few rows to see the data structure
        const sampleResult = await client.execute(`SELECT * FROM ${table} LIMIT 2`);
        if (sampleResult.rows.length > 0) {
          console.log('Sample data:');
          sampleResult.rows.forEach((row, index) => {
            console.log(`  Row ${index + 1}:`);
            Object.entries(row).forEach(([key, value]) => {
              console.log(`    ${key}: ${value}`);
            });
          });
        }
      } else {
        console.log('Table is empty');
      }
      console.log('');
    }
    
    // Also check other important tables
    console.log('=== Other Important Tables ===');
    const otherTables = ['bls_data_versions', 'bls_special_tables', 'occupation_data', 'projections'];
    
    for (const table of otherTables) {
      console.log(`\n--- ${table} ---`);
      const countResult = await client.execute(`SELECT COUNT(*) as count FROM ${table}`);
      const rowCount = countResult.rows[0].count;
      console.log(`Rows: ${rowCount}`);
      
      if (rowCount > 0 && rowCount <= 10) {
        // Show all data for small tables
        const allResult = await client.execute(`SELECT * FROM ${table}`);
        console.log('Data:');
        allResult.rows.forEach((row, index) => {
          console.log(`  Row ${index + 1}:`);
          Object.entries(row).forEach(([key, value]) => {
            console.log(`    ${key}: ${value}`);
          });
        });
      } else if (rowCount > 0) {
        // Show structure and sample for larger tables
        const pragmaResult = await client.execute(`PRAGMA table_info(${table})`);
        console.log('Columns:');
        pragmaResult.rows.forEach(col => {
          console.log(`  - ${col.name} (${col.type})`);
        });
        
        const sampleResult = await client.execute(`SELECT * FROM ${table} LIMIT 2`);
        console.log('Sample data:');
        sampleResult.rows.forEach((row, index) => {
          console.log(`  Row ${index + 1}:`);
          Object.entries(row).forEach(([key, value]) => {
            console.log(`    ${key}: ${value}`);
          });
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error auditing tables:', error);
    process.exit(1);
  } finally {
    client.close();
  }
}

auditBlsTables();

#!/usr/bin/env node

const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function detailedDatabaseAnalysis() {
  try {
    console.log('=== DETAILED DATABASE ANALYSIS ===\n');
    
    // Get ALL tables including system tables
    const allTablesResult = await client.execute(`
      SELECT name, type FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `);
    
    console.log(`Total tables found: ${allTablesResult.rows.length}\n`);
    
    // Check specifically for bls_table_1_* pattern
    const blsTablesResult = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name LIKE 'bls_table_1_%'
      ORDER BY name
    `);
    
    console.log(`BLS tables (bls_table_1_*): ${blsTablesResult.rows.length}`);
    if (blsTablesResult.rows.length > 0) {
      blsTablesResult.rows.forEach(row => {
        console.log(`  - ${row.name}`);
      });
    } else {
      console.log('  (No bls_table_1_* tables found)');
    }
    
    console.log('\n=== ALL TABLES ===');
    allTablesResult.rows.forEach((row, i) => {
      console.log(`${i+1}. ${row.name} (${row.type})`);
    });
    
    // Get row counts for each table
    console.log('\n=== TABLE ROW COUNTS ===');
    for (const row of allTablesResult.rows) {
      if (row.type === 'table' && !row.name.startsWith('sqlite_')) {
        try {
          const countResult = await client.execute(`SELECT COUNT(*) as count FROM ${row.name}`);
          const count = countResult.rows[0].count;
          console.log(`${row.name}: ${count} rows`);
        } catch (error) {
          console.log(`${row.name}: Error getting count (${error.message})`);
        }
      }
    }
    
    // Check if we can create a test bls_table_1_test
    console.log('\n=== TESTING TABLE CREATION ===');
    try {
      await client.execute(`
        CREATE TABLE IF NOT EXISTS bls_table_1_test (
          id INTEGER PRIMARY KEY,
          test_column TEXT
        )
      `);
      console.log('✅ Can create bls_table_1_* tables');
      
      // Clean up test table
      await client.execute('DROP TABLE IF EXISTS bls_table_1_test');
      console.log('✅ Test table cleaned up');
    } catch (error) {
      console.log(`❌ Cannot create bls_table_1_* tables: ${error.message}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

detailedDatabaseAnalysis();

#!/usr/bin/env node

/**
 * Database Table Analysis Script
 * 
 * Analyzes the structure and usage of specialized tables in the Turso database:
 * - occupation_data
 * - projections  
 * - bls_special_tables
 */

const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function analyzeTable(tableName) {
  console.log(`\n📊 ANALYZING TABLE: ${tableName.toUpperCase()}`);
  console.log('='.repeat(50));
  
  try {
    // Get row count
    const countResult = await client.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
    const rowCount = countResult.rows[0].count;
    console.log(`📈 Row Count: ${rowCount.toLocaleString()}`);
    
    // Get table schema
    const schemaResult = await client.execute(`PRAGMA table_info(${tableName})`);
    console.log(`\n🔧 Table Schema:`);
    schemaResult.rows.forEach(column => {
      console.log(`  - ${column.name}: ${column.type} ${column.notnull ? '(NOT NULL)' : '(NULLABLE)'} ${column.pk ? '(PRIMARY KEY)' : ''}`);
    });
    
    // Get sample data (first 3 rows)
    const sampleResult = await client.execute(`SELECT * FROM ${tableName} LIMIT 3`);
    console.log(`\n📋 Sample Data (first 3 rows):`);
    if (sampleResult.rows.length > 0) {
      // Show column headers
      const columns = Object.keys(sampleResult.rows[0]);
      console.log(`\nColumns: ${columns.join(' | ')}`);
      console.log('-'.repeat(columns.join(' | ').length));
      
      // Show sample rows
      sampleResult.rows.forEach((row, index) => {
        console.log(`Row ${index + 1}:`);
        columns.forEach(col => {
          const value = row[col];
          const displayValue = typeof value === 'string' && value.length > 50 
            ? value.substring(0, 50) + '...' 
            : value;
          console.log(`  ${col}: ${displayValue}`);
        });
        console.log('');
      });
    } else {
      console.log('  No data found in table');
    }
    
    // Check for unique values in key columns (if they exist)
    if (tableName === 'occupation_data') {
      try {
        const uniqueResult = await client.execute(`SELECT COUNT(DISTINCT occupation_code) as unique_codes FROM ${tableName}`);
        console.log(`🔑 Unique occupation codes: ${uniqueResult.rows[0].unique_codes}`);
      } catch (error) {
        console.log(`🔑 Could not check unique occupation codes: ${error.message}`);
      }
    }
    
    if (tableName === 'projections') {
      try {
        const uniqueResult = await client.execute(`SELECT COUNT(DISTINCT occupation_code) as unique_codes FROM ${tableName}`);
        console.log(`🔑 Unique occupation codes in projections: ${uniqueResult.rows[0].unique_codes}`);
      } catch (error) {
        console.log(`🔑 Could not check unique occupation codes: ${error.message}`);
      }
    }
    
    return {
      tableName,
      rowCount,
      schema: schemaResult.rows,
      sampleData: sampleResult.rows
    };
    
  } catch (error) {
    console.error(`❌ Error analyzing table ${tableName}:`, error.message);
    return { tableName, error: error.message };
  }
}

async function checkTableUsageInAPI() {
  console.log(`\n\n🔍 CHECKING TABLE USAGE IN API ENDPOINTS`);
  console.log('='.repeat(50));
  
  // This would require reading the API files, but we can document what we know
  console.log(`
📝 Known Table Usage:
  - occupations: ✅ Used extensively in rate calculator API
  - projections: 🔄 Likely used for employment projections display
  - occupation_data: ❓ Usage unclear - needs investigation
  - bls_special_tables: ❓ Usage unclear - needs investigation
  - seo_intake_forms: ✅ Used in SEO intake form API
  `);
}

async function main() {
  console.log('🔬 DATABASE TABLE ANALYSIS');
  console.log('==========================');
  console.log(`Connected to: ${process.env.TURSO_DATABASE_URL.split('@')[1]}`);
  
  // Analyze each specialized table
  const tables = ['occupation_data', 'projections', 'bls_special_tables'];
  const results = [];
  
  for (const table of tables) {
    const result = await analyzeTable(table);
    results.push(result);
  }
  
  // Check API usage
  await checkTableUsageInAPI();
  
  // Summary
  console.log(`\n\n📊 ANALYSIS SUMMARY`);
  console.log('==================');
  results.forEach(result => {
    if (result.error) {
      console.log(`❌ ${result.tableName}: ERROR - ${result.error}`);
    } else {
      console.log(`✅ ${result.tableName}: ${result.rowCount.toLocaleString()} rows, ${result.schema.length} columns`);
    }
  });
  
  console.log(`\n🎯 NEXT STEPS:`);
  console.log(`1. Review table structures above`);
  console.log(`2. Identify which tables are actively used in API`);
  console.log(`3. Determine if any tables can be consolidated or removed`);
  console.log(`4. Proceed with BLS table normalization`);
}

main().catch(console.error);

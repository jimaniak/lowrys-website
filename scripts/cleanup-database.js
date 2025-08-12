#!/usr/bin/env node

/**
 * Database cleanup script to remove unused/legacy tables
 * 
 * Tables to remove:
 * - major_groups
 * - occupation_categories  
 * - occupations_normalized
 * - occupations_old
 * - occupations_test
 * - bls_data_versions
 */

const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function listTables() {
  try {
    const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    console.log('\nCurrent tables in database:');
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.name}`);
    });
    return result.rows.map(row => row.name);
  } catch (error) {
    console.error('Error listing tables:', error);
    return [];
  }
}

async function backupTable(tableName) {
  try {
    console.log(`\nBacking up table: ${tableName}`);
    const result = await client.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
    const count = result.rows[0].count;
    console.log(`  - ${tableName}: ${count} rows`);
    
    // Get table schema
    const schema = await client.execute(`SELECT sql FROM sqlite_master WHERE type='table' AND name='${tableName}'`);
    if (schema.rows.length > 0) {
      console.log(`  - Schema: ${schema.rows[0].sql}`);
    }
    
    return { name: tableName, rowCount: count, schema: schema.rows[0]?.sql || null };
  } catch (error) {
    console.error(`Error backing up table ${tableName}:`, error);
    return { name: tableName, error: error.message };
  }
}

async function dropTable(tableName) {
  try {
    console.log(`\nDropping table: ${tableName}`);
    await client.execute(`DROP TABLE IF EXISTS ${tableName}`);
    console.log(`  ✓ Successfully dropped ${tableName}`);
    return { name: tableName, success: true };
  } catch (error) {
    console.error(`Error dropping table ${tableName}:`, error);
    return { name: tableName, success: false, error: error.message };
  }
}

async function main() {
  console.log('🧹 Database Cleanup Script');
  console.log('==========================');

  // List all current tables
  const tables = await listTables();
  
  // Tables to remove (as identified in our previous analysis)
  const tablesToRemove = [
    'major_groups',
    'occupation_categories', 
    'occupations_normalized',
    'occupations_old',
    'occupations_test',
    'bls_data_versions'
  ];

  // Filter to only tables that actually exist
  const existingTablesToRemove = tablesToRemove.filter(table => tables.includes(table));
  
  console.log(`\nFound ${existingTablesToRemove.length} tables to remove:`);
  existingTablesToRemove.forEach(table => console.log(`  - ${table}`));

  if (existingTablesToRemove.length === 0) {
    console.log('\n✅ No unused tables found to remove!');
    return;
  }

  // Backup information about tables before dropping
  console.log('\n📋 Creating backup information...');
  const backupInfo = [];
  for (const table of existingTablesToRemove) {
    const backup = await backupTable(table);
    backupInfo.push(backup);
  }

  // Save backup info to file
  const fs = require('fs');
  const backupData = {
    timestamp: new Date().toISOString(),
    droppedTables: backupInfo,
    remainingTables: tables.filter(t => !existingTablesToRemove.includes(t))
  };
  
  fs.writeFileSync('./scripts/database-cleanup-backup.json', JSON.stringify(backupData, null, 2));
  console.log('\n💾 Backup information saved to ./scripts/database-cleanup-backup.json');

  // Drop the tables
  console.log('\n🗑️  Dropping unused tables...');
  const dropResults = [];
  for (const table of existingTablesToRemove) {
    const result = await dropTable(table);
    dropResults.push(result);
  }

  // Summary
  console.log('\n📊 Cleanup Summary:');
  console.log('===================');
  const successful = dropResults.filter(r => r.success);
  const failed = dropResults.filter(r => !r.success);
  
  console.log(`✅ Successfully removed: ${successful.length} tables`);
  successful.forEach(r => console.log(`  - ${r.name}`));
  
  if (failed.length > 0) {
    console.log(`❌ Failed to remove: ${failed.length} tables`);
    failed.forEach(r => console.log(`  - ${r.name}: ${r.error}`));
  }

  // List remaining tables
  console.log('\n📋 Remaining tables after cleanup:');
  const remainingTables = await listTables();
  
  console.log('\n🎉 Database cleanup completed!');
  console.log(`Removed ${successful.length} unused tables, ${remainingTables.length} tables remain.`);
}

main().catch(console.error);

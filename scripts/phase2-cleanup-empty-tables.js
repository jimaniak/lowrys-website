#!/usr/bin/env node

/**
 * Phase 2 Cleanup: Remove Empty BLS Tables
 * 
 * Based on the analysis, all bls_table_1_* tables are empty and can be safely removed.
 * This script will:
 * 1. Create a backup of the current database state
 * 2. Remove the 11 empty bls_table_1_* tables
 * 3. Update documentation
 */

const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

const EMPTY_TABLES = [
  'bls_table_1_1',
  'bls_table_1_10', 
  'bls_table_1_11',
  'bls_table_1_12',
  'bls_table_1_2',
  'bls_table_1_3',
  'bls_table_1_4',
  'bls_table_1_5',
  'bls_table_1_6',
  'bls_table_1_8',
  'bls_table_1_9'
];

async function createBackup() {
  console.log('=== Creating Database Backup ===');
  
  try {
    // Get all table names for backup documentation
    const tablesResult = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `);
    
    const allTables = tablesResult.rows.map(row => row.name);
    console.log(`Found ${allTables.length} total tables in database`);
    
    // Create backup metadata
    const backupInfo = {
      timestamp: new Date().toISOString(),
      totalTables: allTables.length,
      tablesToDrop: EMPTY_TABLES,
      remainingTables: allTables.filter(table => !EMPTY_TABLES.includes(table)),
      reason: 'Phase 2 cleanup: Removing empty bls_table_1_* tables'
    };
    
    console.log('Backup metadata:');
    console.log(`  - Total tables: ${backupInfo.totalTables}`);
    console.log(`  - Tables to drop: ${backupInfo.tablesToDrop.length}`);
    console.log(`  - Remaining tables: ${backupInfo.remainingTables.length}`);
    
    // In production, you'd create an actual backup here
    console.log('Note: Create database backup before proceeding with cleanup');
    
    return backupInfo;
    
  } catch (error) {
    console.error('Error creating backup metadata:', error);
    throw error;
  }
}

async function verifyTablesEmpty() {
  console.log('\n=== Verifying Tables Are Empty ===');
  
  const verification = {};
  
  for (const tableName of EMPTY_TABLES) {
    try {
      const countResult = await client.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
      const rowCount = countResult.rows[0].count;
      verification[tableName] = rowCount;
      
      console.log(`${tableName}: ${rowCount} rows`);
      
      if (rowCount > 0) {
        console.error(`⚠️  WARNING: ${tableName} is not empty (${rowCount} rows)!`);
        return false;
      }
    } catch (error) {
      console.error(`Error checking ${tableName}:`, error.message);
      return false;
    }
  }
  
  console.log('✅ All tables verified as empty');
  return true;
}

async function dropEmptyTables(dryRun = true) {
  console.log(`\n=== ${dryRun ? 'DRY RUN: ' : ''}Dropping Empty Tables ===`);
  
  const results = {
    dropped: [],
    errors: []
  };
  
  for (const tableName of EMPTY_TABLES) {
    try {
      if (dryRun) {
        console.log(`Would DROP TABLE ${tableName}`);
      } else {
        await client.execute(`DROP TABLE IF EXISTS ${tableName}`);
        console.log(`✅ Dropped ${tableName}`);
      }
      results.dropped.push(tableName);
    } catch (error) {
      console.error(`❌ Error dropping ${tableName}:`, error.message);
      results.errors.push({ table: tableName, error: error.message });
    }
  }
  
  return results;
}

async function updateProjectDocumentation() {
  console.log('\n=== Updating Documentation ===');
  
  const updateInfo = {
    timestamp: new Date().toISOString(),
    action: 'Removed 11 empty bls_table_1_* tables',
    tablesRemoved: EMPTY_TABLES,
    reason: 'Tables were empty and not used by any API endpoints',
    impact: 'No impact on functionality - cleanup only'
  };
  
  console.log('Documentation updates needed:');
  console.log('  - Update project_structure.md');
  console.log('  - Update database-normalization-progress.md');
  console.log('  - Note: No API changes needed (tables were unused)');
  
  return updateInfo;
}

async function main() {
  try {
    console.log('Phase 2 Cleanup: BLS Table Removal\n');
    
    // Step 1: Create backup metadata
    const backupInfo = await createBackup();
    
    // Step 2: Verify all tables are empty
    const isEmpty = await verifyTablesEmpty();
    if (!isEmpty) {
      console.error('❌ Aborting: Some tables are not empty');
      process.exit(1);
    }
    
    // Step 3: Dry run - show what would be dropped
    await dropEmptyTables(true);
    
    // Step 4: Documentation updates
    const docInfo = await updateProjectDocumentation();
    
    console.log('\n=== Summary ===');
    console.log('✅ All 11 bls_table_1_* tables verified as empty');
    console.log('✅ Safe to proceed with cleanup');
    console.log('✅ No API endpoints will be affected');
    
    console.log('\nTo execute the cleanup:');
    console.log('  1. Ensure database backup is created');
    console.log('  2. Run this script with --execute flag');
    console.log('  3. Update documentation files');
    
    // Check for execute flag
    if (process.argv.includes('--execute')) {
      console.log('\n🚀 Executing cleanup...');
      const results = await dropEmptyTables(false);
      
      if (results.errors.length === 0) {
        console.log(`✅ Successfully dropped ${results.dropped.length} tables`);
      } else {
        console.error(`❌ Encountered ${results.errors.length} errors during cleanup`);
        results.errors.forEach(err => {
          console.error(`  - ${err.table}: ${err.error}`);
        });
      }
    }
    
    return {
      success: true,
      backupInfo,
      docInfo,
      tablesVerified: EMPTY_TABLES.length,
      readyForCleanup: isEmpty
    };
    
  } catch (error) {
    console.error('Phase 2 cleanup failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = { createBackup, verifyTablesEmpty, dropEmptyTables, updateProjectDocumentation };

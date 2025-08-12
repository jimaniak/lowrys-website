// Database Cleanup and Migration Script
// Removes unused/old tables and prepares database for normalized BLS data structure

const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Tables to keep (used by the app)
const TABLES_TO_KEEP = new Set([
  // Core tables used by the app
  'occupations',
  'seo_intake_forms',
  
  // New normalized BLS tables
  'bls_employment_by_major_occupational_group',
  'bls_occupation_codes_and_titles',
  'bls_employment_and_wages_by_occupation',
  'bls_occupations_with_most_job_growth',
  'bls_occupations_with_fastest_growth',
  'bls_occupations_with_most_job_decline',
  'bls_occupations_with_fastest_decline',
  'bls_occupations_by_education_work_experience',
  'bls_occupations_by_education_work_experience_detail',
  'bls_new_jobs_by_education',
  'bls_occupational_separations_by_education',
  'bls_occupational_openings_by_education',
  
  // OEWS wage data tables
  'bls_oews_national',
  'bls_oews_state',
  
  // Metadata and tracking tables
  'bls_data_metadata',
  'automation_log',
  
  // System tables (SQLite internal)
  'sqlite_master',
  'sqlite_sequence'
]);

// Patterns of tables to archive (move to backup tables instead of dropping)
const ARCHIVE_PATTERNS = [
  /^bls_table_1[0-9]_/, // Old BLS table format
  /^bls_table_\d+_/, // Any old numbered table format
];

// Get all tables in the database
async function getAllTables() {
  try {
    const result = await db.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    return result.rows.map(row => row.name || row[0]);
  } catch (error) {
    console.error('❌ Failed to get table list:', error);
    throw error;
  }
}

// Check if table has data
async function getTableInfo(tableName) {
  try {
    const countResult = await db.execute(`SELECT COUNT(*) as count FROM "${tableName}"`);
    const count = countResult.rows[0]?.count || 0;
    
    const schemaResult = await db.execute(`PRAGMA table_info("${tableName}")`);
    const columns = schemaResult.rows.map(row => ({
      name: row.name || row[1],
      type: row.type || row[2],
      notnull: row.notnull || row[3],
      pk: row.pk || row[5]
    }));
    
    return {
      name: tableName,
      recordCount: count,
      columnCount: columns.length,
      columns: columns
    };
  } catch (error) {
    console.error(`❌ Failed to get info for table ${tableName}:`, error);
    return {
      name: tableName,
      recordCount: 0,
      columnCount: 0,
      columns: [],
      error: error.message
    };
  }
}

// Archive a table by renaming it
async function archiveTable(tableName) {
  const archiveName = `archived_${tableName}_${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}`;
  
  try {
    await db.execute(`ALTER TABLE "${tableName}" RENAME TO "${archiveName}"`);
    console.log(`📦 Archived table: ${tableName} → ${archiveName}`);
    return archiveName;
  } catch (error) {
    console.error(`❌ Failed to archive table ${tableName}:`, error);
    throw error;
  }
}

// Drop a table completely
async function dropTable(tableName) {
  try {
    await db.execute(`DROP TABLE IF EXISTS "${tableName}"`);
    console.log(`🗑️  Dropped table: ${tableName}`);
  } catch (error) {
    console.error(`❌ Failed to drop table ${tableName}:`, error);
    throw error;
  }
}

// Analyze database and create cleanup plan
async function analyzeDatabase() {
  console.log('🔍 Analyzing database structure...\n');
  
  const tables = await getAllTables();
  console.log(`📊 Found ${tables.length} tables total`);
  
  const tableInfo = [];
  for (const tableName of tables) {
    const info = await getTableInfo(tableName);
    tableInfo.push(info);
  }
  
  // Categorize tables
  const toKeep = [];
  const toArchive = [];
  const toDrop = [];
  const unknown = [];
  
  for (const info of tableInfo) {
    const { name, recordCount } = info;
    
    if (TABLES_TO_KEEP.has(name)) {
      toKeep.push(info);
    } else if (ARCHIVE_PATTERNS.some(pattern => pattern.test(name))) {
      if (recordCount > 0) {
        toArchive.push(info);
      } else {
        toDrop.push(info);
      }
    } else if (name.startsWith('sqlite_')) {
      toKeep.push(info); // System tables
    } else {
      unknown.push(info);
    }
  }
  
  // Print analysis
  console.log('📋 Database Analysis Results:');
  console.log(`   • Tables to keep: ${toKeep.length}`);
  console.log(`   • Tables to archive: ${toArchive.length}`);
  console.log(`   • Tables to drop: ${toDrop.length}`);
  console.log(`   • Unknown tables: ${unknown.length}\\n`);
  
  if (toKeep.length > 0) {
    console.log('✅ Tables to KEEP:');
    for (const info of toKeep) {
      console.log(`   • ${info.name} (${info.recordCount} records, ${info.columnCount} cols)`);
    }
    console.log();
  }
  
  if (toArchive.length > 0) {
    console.log('📦 Tables to ARCHIVE:');
    for (const info of toArchive) {
      console.log(`   • ${info.name} (${info.recordCount} records, ${info.columnCount} cols)`);
    }
    console.log();
  }
  
  if (toDrop.length > 0) {
    console.log('🗑️  Tables to DROP (empty):');
    for (const info of toDrop) {
      console.log(`   • ${info.name} (${info.recordCount} records, ${info.columnCount} cols)`);
    }
    console.log();
  }
  
  if (unknown.length > 0) {
    console.log('❓ UNKNOWN tables (need manual review):');
    for (const info of unknown) {
      console.log(`   • ${info.name} (${info.recordCount} records, ${info.columnCount} cols)`);
    }
    console.log();
  }
  
  return {
    toKeep,
    toArchive,
    toDrop,
    unknown,
    totalTables: tables.length
  };
}

// Execute cleanup based on analysis
async function executeCleanup(dryRun = true) {
  console.log(`🧹 ${dryRun ? 'DRY RUN - ' : ''}Starting database cleanup...\\n`);
  
  const analysis = await analyzeDatabase();
  
  if (dryRun) {
    console.log('🔍 This is a DRY RUN - no changes will be made');
    console.log('   To execute cleanup, run with --execute flag\\n');
    return analysis;
  }
  
  let archivedCount = 0;
  let droppedCount = 0;
  const errors = [];
  
  // Archive tables with data
  console.log('📦 Archiving tables with data...');
  for (const info of analysis.toArchive) {
    try {
      await archiveTable(info.name);
      archivedCount++;
    } catch (error) {
      errors.push({ table: info.name, action: 'archive', error: error.message });
    }
  }
  
  // Drop empty tables
  console.log('\\n🗑️  Dropping empty tables...');
  for (const info of analysis.toDrop) {
    try {
      await dropTable(info.name);
      droppedCount++;
    } catch (error) {
      errors.push({ table: info.name, action: 'drop', error: error.message });
    }
  }
  
  // Create cleanup log
  await db.execute(`
    CREATE TABLE IF NOT EXISTS cleanup_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cleanup_date TEXT NOT NULL,
      tables_archived INTEGER NOT NULL,
      tables_dropped INTEGER NOT NULL,
      tables_kept INTEGER NOT NULL,
      errors_count INTEGER NOT NULL,
      notes TEXT
    )
  `);
  
  await db.execute(`
    INSERT INTO cleanup_log (cleanup_date, tables_archived, tables_dropped, tables_kept, errors_count, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    new Date().toISOString(),
    archivedCount,
    droppedCount,
    analysis.toKeep.length,
    errors.length,
    errors.length > 0 ? JSON.stringify(errors) : 'No errors'
  ]);
  
  console.log('\\n✅ Cleanup completed!');
  console.log(`📊 Summary:`);
  console.log(`   • Tables archived: ${archivedCount}`);
  console.log(`   • Tables dropped: ${droppedCount}`);
  console.log(`   • Tables kept: ${analysis.toKeep.length}`);
  console.log(`   • Errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\\n❌ Errors encountered:');
    for (const error of errors) {
      console.log(`   • ${error.table} (${error.action}): ${error.error}`);
    }
  }
  
  if (analysis.unknown.length > 0) {
    console.log('\\n❓ Unknown tables remain (manual review needed):');
    for (const info of analysis.unknown) {
      console.log(`   • ${info.name} (${info.recordCount} records)`);
    }
  }
  
  return analysis;
}

// Show current database status
async function showDatabaseStatus() {
  console.log('📊 Current Database Status\\n');
  
  try {
    const tables = await getAllTables();
    
    console.log(`Total tables: ${tables.length}\\n`);
    
    for (const tableName of tables) {
      const info = await getTableInfo(tableName);
      const status = TABLES_TO_KEEP.has(tableName) ? '✅' : 
                    ARCHIVE_PATTERNS.some(p => p.test(tableName)) ? '📦' : '❓';
      
      console.log(`${status} ${info.name}`);
      console.log(`   Records: ${info.recordCount.toLocaleString()}`);
      console.log(`   Columns: ${info.columnCount}`);
      if (info.error) {
        console.log(`   Error: ${info.error}`);
      }
      console.log();
    }
    
  } catch (error) {
    console.error('❌ Failed to show database status:', error);
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'analyze';
  
  try {
    switch (command) {
      case 'analyze':
        await analyzeDatabase();
        break;
        
      case 'status':
        await showDatabaseStatus();
        break;
        
      case 'cleanup':
        const execute = args.includes('--execute');
        await executeCleanup(!execute);
        break;
        
      case 'help':
        console.log('Database Cleanup Script Commands:');
        console.log('  analyze  - Analyze database and show cleanup plan');
        console.log('  status   - Show current database status');
        console.log('  cleanup  - Execute cleanup (dry run by default)');
        console.log('  cleanup --execute - Execute actual cleanup');
        console.log('  help     - Show this help message');
        break;
        
      default:
        console.log(`Unknown command: ${command}`);
        console.log('Use "help" to see available commands');
        process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  analyzeDatabase,
  executeCleanup,
  showDatabaseStatus,
  getAllTables,
  getTableInfo,
  archiveTable,
  dropTable
};

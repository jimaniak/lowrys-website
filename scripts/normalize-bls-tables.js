// Comprehensive BLS Table Normalization Script
// Normalizes all BLS Tables 1.1-1.12 by splitting year-based columns into value/year pairs
// and creates clean, normalized database tables

const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');
const xlsx = require('xlsx');
require('dotenv').config({ path: '.env.local' });

// Create Turso client
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Path to the occupation workbook
const OCCUPATION_XLSX_PATH = path.join(__dirname, '../public/data/occupation.xlsx');

// Table configuration - maps table numbers to their characteristics
const TABLE_CONFIGS = {
  '1.1': {
    name: 'Employment by major occupational group',
    tableName: 'bls_table_1_1',
    description: 'Employment by major occupational group, 2023 and projected 2033',
    yearColumns: ['Employment, 2023', 'Employment, 2033', 'Employment change, numeric, 2023–33', 'Employment change, percent, 2023–33'],
    baseYear: 2023,
    projectionYear: 2033
  },
  '1.2': {
    name: 'Occupational projections and worker characteristics',
    tableName: 'bls_table_1_2', 
    description: 'Occupational projections, 2023–33, and worker characteristics, 2023',
    yearColumns: ['Employment, 2023', 'Employment, 2033', 'Employment change, numeric, 2023–33', 'Employment change, percent, 2023–33'],
    baseYear: 2023,
    projectionYear: 2033
  },
  '1.3': {
    name: 'Fastest growing occupations',
    tableName: 'bls_table_1_3',
    description: 'Fastest growing occupations, 2023 and projected 2033',
    yearColumns: ['Employment, 2023', 'Employment, 2033', 'Employment change, numeric, 2023-33', 'Employment change, percent, 2023-33'],
    baseYear: 2023,
    projectionYear: 2033
  },
  '1.4': {
    name: 'Occupations with the most job growth',
    tableName: 'bls_table_1_4',
    description: 'Occupations with the most job growth, 2023 and projected 2033',
    yearColumns: ['Employment, 2023', 'Employment, 2033', 'Employment change, numeric, 2023-33', 'Employment change, percent, 2023-33'],
    baseYear: 2023,
    projectionYear: 2033
  },
  '1.5': {
    name: 'Fastest declining occupations',
    tableName: 'bls_table_1_5',
    description: 'Fastest declining occupations, 2023 and projected 2033',
    yearColumns: ['Employment, 2023', 'Employment, 2033', 'Employment change, numeric, 2023-33', 'Employment change, percent, 2023-33'],
    baseYear: 2023,
    projectionYear: 2033
  },
  '1.6': {
    name: 'Occupations with the largest job declines',
    tableName: 'bls_table_1_6',
    description: 'Occupations with the largest job declines, 2023 and projected 2033',
    yearColumns: ['Employment, 2023', 'Employment, 2033', 'Employment change, numeric, 2023-33', 'Employment change, percent, 2023-33'],
    baseYear: 2023,
    projectionYear: 2033
  },
  '1.7': {
    name: 'Combined with Table 1.2',
    tableName: 'bls_table_1_7',
    description: 'Content moved to Table 1.2 - redirect table',
    yearColumns: [],
    skip: true
  },
  '1.8': {
    name: 'Industry-occupation matrix data, by occupation',
    tableName: 'bls_table_1_8',
    description: '2023–33 Industry-occupation matrix data, by occupation',
    yearColumns: [],
    baseYear: 2023,
    projectionYear: 2033
  },
  '1.9': {
    name: 'Industry-occupation matrix data, by industry',
    tableName: 'bls_table_1_9',
    description: '2023–33 Industry-occupation matrix data, by industry',
    yearColumns: [],
    baseYear: 2023,
    projectionYear: 2033
  },
  '1.10': {
    name: 'Occupational separations and openings',
    tableName: 'bls_table_1_10',
    description: 'Occupational separations and openings, projected 2023–33',
    yearColumns: ['Employment, 2023', 'Employment, 2033', 'Employment change, numeric, 2023–33', 'Employment change, percent, 2023–33'],
    baseYear: 2023,
    projectionYear: 2033
  },
  '1.11': {
    name: 'Employment in STEM occupations',
    tableName: 'bls_table_1_11',
    description: 'Employment in STEM occupations, 2023 and projected 2033',
    yearColumns: ['Employment, 2023', 'Employment, 2033', 'Employment change, numeric, 2023-33', 'Employment change, percent, 2023-33'],
    baseYear: 2023,
    projectionYear: 2033
  },
  '1.12': {
    name: 'Factors affecting occupational utilization',
    tableName: 'bls_table_1_12',
    description: 'Factors affecting occupational utilization, projected 2023–33',
    yearColumns: [],
    baseYear: 2023,
    projectionYear: 2033
  }
};

// Extract year from column name
function extractYearFromColumn(columnName) {
  const yearMatch = columnName.match(/\b(20\d{2}|19\d{2})\b/);
  return yearMatch ? parseInt(yearMatch[1]) : null;
}

// Normalize column name (remove years, standardize naming)
function normalizeColumnName(columnName) {
  return columnName
    .replace(/\b(20\d{2}|19\d{2})\b/g, '') // Remove years
    .replace(/[–—-]/g, '') // Remove dashes
    .replace(/,\s+/g, '_') // Replace commas with underscores
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_+/g, '_') // Remove multiple underscores
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    .toLowerCase();
}

// Get table sheet mapping from workbook
function getTableSheetMapping() {
  if (!fs.existsSync(OCCUPATION_XLSX_PATH)) {
    throw new Error(`occupation.xlsx not found at: ${OCCUPATION_XLSX_PATH}`);
  }

  const workbook = xlsx.readFile(OCCUPATION_XLSX_PATH);
  const tableSheets = new Map();
  
  workbook.SheetNames.forEach(sheetName => {
    const tableMatch = sheetName.match(/(\d+\.\d+)/) || sheetName.match(/table\s+(\d+\.\d+)/i);
    if (tableMatch) {
      tableSheets.set(tableMatch[1], sheetName);
    }
  });

  return tableSheets;
}

// Create normalized schema for a table
async function createNormalizedTableSchema(tableNum, config) {
  const { tableName, description } = config;
  
  console.log(`📊 Creating schema for ${tableName}...`);
  
  // Drop existing table
  await db.execute(`DROP TABLE IF EXISTS ${tableName}`);
  
  // Create new normalized table with metadata
  const createSQL = `
    CREATE TABLE ${tableName} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT,
      name TEXT,
      occupation_type TEXT,
      category TEXT,
      parent_code TEXT,
      metric_name TEXT NOT NULL,
      metric_value REAL,
      metric_year INTEGER NOT NULL,
      data_source TEXT DEFAULT 'BLS_OCCUPATION_WORKBOOK',
      workbook_year INTEGER,
      refresh_date TEXT DEFAULT CURRENT_TIMESTAMP,
      table_description TEXT DEFAULT '${description}',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  await db.execute(createSQL);
  
  // Create indexes for better query performance
  await db.execute(`CREATE INDEX idx_${tableName}_code ON ${tableName}(code)`);
  await db.execute(`CREATE INDEX idx_${tableName}_metric ON ${tableName}(metric_name, metric_year)`);
  await db.execute(`CREATE INDEX idx_${tableName}_category ON ${tableName}(category)`);
  
  console.log(`✅ Schema created for ${tableName}`);
}

// Process and normalize a single table
async function processTable(tableNum, sheetName, config) {
  const { tableName, yearColumns, baseYear, projectionYear, skip } = config;
  
  if (skip) {
    console.log(`⏭️  Skipping Table ${tableNum} - ${config.description}`);
    return;
  }
  
  console.log(`\n📊 Processing Table ${tableNum}: ${sheetName}`);
  
  // Read the workbook
  const workbook = xlsx.readFile(OCCUPATION_XLSX_PATH);
  const worksheet = workbook.Sheets[sheetName];
  const rawData = xlsx.utils.sheet_to_json(worksheet);
  
  if (rawData.length === 0) {
    console.log(`⚠️  No data found in Table ${tableNum}`);
    return;
  }
  
  // Get headers from first row
  const headers = Object.keys(rawData[0]);
  console.log(`📋 Headers found: ${headers.slice(0, 5).join(', ')}${headers.length > 5 ? '...' : ''}`);
  
  // Create schema
  await createNormalizedTableSchema(tableNum, config);
  
  // Process each row
  let processedRows = 0;
  let insertedRecords = 0;
  
  for (const row of rawData) {
    const code = row['2023 National Employment Matrix code'] || row['2023 National Employment Matrix occupation code'] || null;
    const name = row['2023 National Employment Matrix title'] || row['2023 National Employment Matrix occupation title'] || null;
    const occupationType = row['Occupation type'] || null;
    
    // Skip header rows or rows without code
    if (!code || code.includes('Matrix code') || code === 'code') {
      continue;
    }
    
    processedRows++;
    
    // Determine category (basic classification)
    let category = 'OTHER';
    if (occupationType === 'Line item') {
      category = 'OCCUPATION';
    } else if (occupationType === 'Summary') {
      if (code === '00-0000') category = 'TOP';
      else if (code.endsWith('0000')) category = 'MAJOR';
      else if (code.endsWith('000')) category = 'MINOR';
      else if (code.endsWith('00')) category = 'BROAD';
      else category = 'DETAILED';
    }
    
    // Process each column that contains year-based data
    for (const [columnName, value] of Object.entries(row)) {
      if (value === null || value === undefined || value === '') continue;
      
      // Extract year from column name
      const year = extractYearFromColumn(columnName);
      
      if (year) {
        // This is a year-based column - normalize it
        const normalizedMetricName = normalizeColumnName(columnName);
        
        await db.execute({
          sql: `INSERT INTO ${tableName} (
            code, name, occupation_type, category, 
            metric_name, metric_value, metric_year,
            workbook_year, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          args: [
            code,
            name,
            occupationType,
            category,
            normalizedMetricName,
            parseFloat(value) || null,
            year,
            baseYear
          ]
        });
        
        insertedRecords++;
      }
    }
    
    if (processedRows % 100 === 0) {
      console.log(`  Processed ${processedRows} rows, inserted ${insertedRecords} records...`);
    }
  }
  
  console.log(`✅ Table ${tableNum} processed: ${processedRows} rows → ${insertedRecords} normalized records`);
}

// Main normalization function
async function normalizeAllTables() {
  console.log('🚀 Starting BLS table normalization...\n');
  
  const startTime = Date.now();
  
  try {
    // Get table sheet mapping
    const tableSheets = getTableSheetMapping();
    
    if (tableSheets.size === 0) {
      throw new Error('No table sheets found in occupation workbook');
    }
    
    console.log(`📋 Found ${tableSheets.size} tables to process`);
    
    // Process each table
    for (const [tableNum, sheetName] of tableSheets) {
      const config = TABLE_CONFIGS[tableNum];
      
      if (!config) {
        console.log(`⚠️  No configuration found for Table ${tableNum}, skipping`);
        continue;
      }
      
      await processTable(tableNum, sheetName, config);
    }
    
    // Validation summary
    console.log('\n📊 Normalization Summary:');
    
    for (const [tableNum, config] of Object.entries(TABLE_CONFIGS)) {
      if (config.skip) continue;
      
      const count = await db.execute(`SELECT COUNT(*) as count FROM ${config.tableName}`);
      const metricCount = await db.execute(`SELECT COUNT(DISTINCT metric_name) as count FROM ${config.tableName}`);
      const yearCount = await db.execute(`SELECT COUNT(DISTINCT metric_year) as count FROM ${config.tableName}`);
      
      console.log(`  Table ${tableNum} (${config.tableName}): ${count.rows[0].count} records, ${metricCount.rows[0].count} metrics, ${yearCount.rows[0].count} years`);
    }
    
    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`\n🎉 BLS table normalization completed successfully in ${duration} seconds!`);
    
  } catch (error) {
    console.error('❌ Normalization failed:', error);
    throw error;
  }
}

// Clean up old/unused tables
async function cleanupOldTables() {
  console.log('\n🧹 Cleaning up old/unused tables...');
  
  // List of old table patterns to drop
  const oldTablePatterns = [
    'bls_table_1X_%', // Old pattern with X
    'bls_table_temp_%', // Temporary tables
    'bls_backup_%' // Backup tables
  ];
  
  // Get all table names
  const tables = await db.execute(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name LIKE 'bls_%'
  `);
  
  let droppedCount = 0;
  
  for (const table of tables.rows) {
    const tableName = table.name;
    
    // Check if it matches old patterns
    const shouldDrop = oldTablePatterns.some(pattern => 
      tableName.match(pattern.replace('%', '.*'))
    );
    
    // Also check if it's not in our current config
    const isCurrentTable = Object.values(TABLE_CONFIGS).some(config => 
      config.tableName === tableName
    );
    
    if (shouldDrop || (!isCurrentTable && tableName.startsWith('bls_table_'))) {
      console.log(`  Dropping old table: ${tableName}`);
      await db.execute(`DROP TABLE IF EXISTS ${tableName}`);
      droppedCount++;
    }
  }
  
  console.log(`✅ Cleaned up ${droppedCount} old tables`);
}

// Export functions for use in other scripts
module.exports = {
  normalizeAllTables,
  cleanupOldTables,
  TABLE_CONFIGS,
  getTableSheetMapping
};

// Run if called directly
if (require.main === module) {
  (async () => {
    try {
      if (!fs.existsSync(OCCUPATION_XLSX_PATH)) {
        console.error('❌ occupation.xlsx not found. Please download it first using:');
        console.error('   node scripts/enhanced-sunday-night-automation.js');
        process.exit(1);
      }
      
      await normalizeAllTables();
      await cleanupOldTables();
      
    } catch (error) {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    } finally {
      await db.close();
    }
  })();
}
